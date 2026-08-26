// 台灣 AIDC 開發案地圖產生器
// 讀 sites.json → 產出 output/AIDC_map_{dark,light}.{svg,html}
// 用法:node gen.js
const fs = require('fs');
const path = require('path');
const topo = require('taiwan-atlas/counties-10t.json');
const { feature } = require('topojson-client');
const { geoTransverseMercator, geoPath } = require('d3-geo');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'sites.json'), 'utf8'));
const W = 920, H = 660;
const AUDIT_DATE = DATA.audit_date;
const GRID = DATA.grid;

// insight 統計:限制區內外(C)與累積案場數(B),皆由 sites 陣列導出
const IN_ZONE = new Set(['taoyuan', 'neihu']);
const zoneStats = { in: { mw: 0, n: 0 }, out: { mw: 0, n: 0, undisclosed: 0 } };
for (const s of DATA.sites) {
  const t = IN_ZONE.has(s.cluster) ? zoneStats.in : zoneStats.out;
  t.n++;
  if (s.mw_draw) t.mw += s.mw_draw;
  else t.undisclosed = (t.undisclosed || 0) + 1;
}
const YEARS = [];
for (let y = 2013; y <= 2029; y++) YEARS.push(y);
const cumCount = YEARS.map((y) => DATA.sites.filter((s) => s.year_online <= y).length);

// ---------- 主題 token ----------
const THEMES = {
  dark: {
    bg: '#0A101C', land: '#18222F', county: '#2A3648', coast: '#4E6076',
    grid: '#101A2B', hatch: '#334155',
    ink: '#E9F0F8', ink2: '#A9B8CC', ink3: '#74869E',
    accent: '#00A3B8', accentFill: 'rgba(0,163,184,0.16)',
    corridor: '#BD8628',
    card: '#0E1626', cardBorder: '#223047', leader: '#4E6076',
    ring: '#0A101C' // 重疊分隔環 = 底色
  },
  light: {
    bg: '#F7F9FC', land: '#E9EDF3', county: '#CBD5E1', coast: '#94A3B8',
    grid: '#EDF1F6', hatch: '#B6C2D2',
    ink: '#14202E', ink2: '#46566B', ink3: '#74869E',
    accent: '#00829D', accentFill: 'rgba(0,130,157,0.12)',
    corridor: '#A87415',
    card: '#FFFFFF', cardBorder: '#D8E0EA', leader: '#94A3B8',
    ring: '#F7F9FC'
  }
};

const SANS = `'Noto Sans TC','WenQuanYi Zen Hei',sans-serif`;
const MONO = `'IBM Plex Mono','DejaVu Sans Mono',monospace`;

// ---------- 幾何 ----------
const EXCLUDE = new Set(['金門縣', '連江縣', '澎湖縣']);
const NORTH_RESTRICT = new Set(['台北市', '新北市', '基隆市', '桃園市']); // 北北基桃 5MW+ 暫緩區
const counties = feature(topo, topo.objects.counties);
counties.features = counties.features.filter(f => !EXCLUDE.has(f.properties.COUNTYNAME));

const projection = geoTransverseMercator().rotate([-121, 0])
  .fitExtent([[178, 30], [500, 645]], counties);
const pathGen = geoPath(projection);

// 圓半徑:面積 ∝ MW
const radius = mw => Math.max(5, 1.7 * Math.sqrt(mw));

// 投影 + 確定性散置(同 cluster 內兩兩推開,質心不動,重跑結果相同)
const sites = DATA.sites.map(s => {
  const [x, y] = projection(s.lonlat);
  return { ...s, x, y, x0: x, y0: y, r: s.mw_draw ? radius(s.mw_draw) : 7.5 };
});
const GAP = 4; // 圓緣最小間隙(含 2px 分隔環)
const clusters = {};
sites.forEach(s => { (clusters[s.cluster] ||= []).push(s); });
// 全域確定性散置:所有點兩兩推開(跨聚落也算,例:台中點原始位置落在 Google 大圓內)
for (let iter = 0; iter < 400; iter++) {
  let moved = false;
  for (let i = 0; i < sites.length; i++) for (let j = i + 1; j < sites.length; j++) {
    const a = sites[i], b = sites[j];
    let dx = b.x - a.x, dy = b.y - a.y;
    let d = Math.hypot(dx, dy);
    if (d === 0) { dx = 1; dy = 0; d = 1; } // 完全重合時往固定方向推,保持確定性
    const need = a.r + b.r + GAP;
    if (d < need) {
      const push = (need - d) / 2;
      a.x -= (dx / d) * push; a.y -= (dy / d) * push;
      b.x += (dx / d) * push; b.y += (dy / d) * push;
      moved = true;
    }
  }
  if (!moved) break;
}
// 散置檢查輸出
sites.forEach(s => {
  const off = Math.hypot(s.x - s.x0, s.y - s.y0);
  if (off > 0.5) console.log(`[散置] ${s.id} 位移 ${off.toFixed(1)}px → (${s.x.toFixed(0)},${s.y.toFixed(0)}) r=${s.r.toFixed(1)}`);
});

const byId = Object.fromEntries(sites.map(s => [s.id, s]));

// cluster 外接圓(導引線停靠 & 內湖收束框用)
function enclosing(members) {
  const cx = members.reduce((a, s) => a + s.x, 0) / members.length;
  const cy = members.reduce((a, s) => a + s.y, 0) / members.length;
  const R = Math.max(...members.map(s => Math.hypot(s.x - cx, s.y - cy) + s.r));
  return { cx, cy, R };
}

// ---------- SVG 工具 ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function text(x, y, str, { size = 10, fill, weight = 400, family = SANS, anchor = 'start', spacing } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" font-family="${family}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${esc(str)}</text>`;
}

// 狀態小圖徽(卡片列用)
function glyph(x, y, status, T) {
  if (status === 'operating') return `<circle cx="${x}" cy="${y}" r="3.2" fill="${T.accent}"/>`;
  if (status === 'undisclosed') return `<path d="M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z" fill="none" stroke="${T.ink2}" stroke-width="1.2"/>`;
  if (status === 'nested') return `<circle cx="${x}" cy="${y}" r="4.6" fill="none" stroke="${T.accent}" stroke-width="1.1" stroke-dasharray="2.5 2"/><circle cx="${x}" cy="${y}" r="2" fill="${T.accent}"/>`;
  return `<circle cx="${x}" cy="${y}" r="3.5" fill="none" stroke="${T.accent}" stroke-width="1.3" stroke-dasharray="3 2.2"/>`; // construction / planned
}

// 卡片:回傳 {svg, h}
function card(x, y, w, title, titleEn, rows, T, opts = {}) {
  const padX = 9, headH = 17;
  let rowY = y + headH + 10;
  let body = '';
  for (const r of rows) {
    body += glyph(x + padX + 4, rowY - 3.5, r.status, T);
    body += text(x + padX + 13, rowY, r.name, { size: 9.5, fill: T.ink, weight: 500 });
    if (r.value) body += text(x + w - padX, rowY, r.value, { size: 8.6, fill: T.ink2, family: MONO, anchor: 'end' });
    rowY += 12.5;
    if (r.note) { body += text(x + padX + 13, rowY - 2.5, r.note, { size: 8, fill: T.ink3 }); rowY += 10.5; }
  }
  const h = rowY - y - 2;
  const head = text(x + padX, y + headH - 3, title, { size: 11, fill: T.ink, weight: 700 })
    + text(x + padX + (opts.headOffset || 0), y + headH - 3, '', {})
    + text(x + w - padX, y + headH - 3, titleEn, { size: 8.2, fill: T.ink3, family: MONO, anchor: 'end' });
  return {
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${T.card}" stroke="${T.cardBorder}" stroke-width="1"/>`
      + `<line x1="${x + padX}" y1="${y + headH + 2}" x2="${x + w - padX}" y2="${y + headH + 2}" stroke="${T.cardBorder}" stroke-width="1"/>`
      + head + body,
    h
  };
}

// 肘形導引線:從卡片邊緣到目標,端點停在圓緣外 3px
// elbowX 可覆蓋轉折點(用於繞開其他圓),端點沿「轉折點→圓心」方向接入
function leader(fromX, fromY, target, T, elbowX) {
  const { cx, cy, R } = target;
  const ex0 = elbowX !== undefined ? elbowX : fromX + (cx - fromX) * 0.45;
  const dx = cx - ex0, dy = cy - fromY;
  const d = Math.hypot(dx, dy) || 1;
  const ex = cx - (dx / d) * (R + 3), ey = cy - (dy / d) * (R + 3);
  return `<polyline points="${fromX},${fromY} ${ex0},${fromY} ${ex},${ey}" fill="none" stroke="${T.leader}" stroke-width="1"/>`
    + `<circle cx="${ex}" cy="${ey}" r="1.6" fill="${T.leader}"/>`;
}

// ---------- 圖面組裝 ----------
function build(themeName) {
  const T = THEMES[themeName];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${SANS.replace(/'/g, '&#39;')}">`;

  // defs:斜線 pattern + 微光暈
  s += `<defs>
  <pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="6" stroke="${T.hatch}" stroke-width="1"/>
  </pattern>
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>
</defs>`;

  s += `<rect width="${W}" height="${H}" fill="${T.bg}"/>`;

  // 底層網格(科技感,recessive)
  let grid = '';
  for (let gx = 0; gx <= W; gx += 46) grid += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}"/>`;
  for (let gy = 0; gy <= H; gy += 46) grid += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}"/>`;
  s += `<g stroke="${T.grid}" stroke-width="1">${grid}</g>`;

  // 陸地
  for (const f of counties.features) s += `<path d="${pathGen(f)}" fill="${T.land}"/>`;
  // 北北基桃斜線
  for (const f of counties.features) if (NORTH_RESTRICT.has(f.properties.COUNTYNAME))
    s += `<path d="${pathGen(f)}" fill="url(#hatch)"/>`;
  // 縣市界、國界輪廓
  for (const f of counties.features) s += `<path d="${pathGen(f)}" fill="none" stroke="${T.county}" stroke-width="0.7"/>`;
  s += `<path d="${pathGen(counties)}" fill="none" stroke="${T.coast}" stroke-width="1.1"/>`;

  // 南臺灣算力廊帶(圓角虛線框)
  const south = ['nchc', 'shalun', 'nvidia'].map(id => byId[id]);
  const pad = 14;
  const bx0 = Math.min(...south.map(p => p.x - p.r)) - pad;
  const by0 = Math.min(...south.map(p => p.y - p.r)) - pad;
  const bx1 = Math.max(...south.map(p => p.x + p.r)) + pad;
  const by1 = Math.max(...south.map(p => p.y + p.r)) + pad;
  s += `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" rx="10" fill="none" stroke="${T.corridor}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
  const clY = by0 + 14;
  s += text(bx1 + 7, clY, '南臺灣算力廊帶', { size: 10, fill: T.corridor, weight: 700 });
  s += text(bx1 + 7, clY + 11, 'Southern Compute Corridor', { size: 7.8, fill: T.corridor, family: MONO });

  // D1:中電北送流向箭頭(位置=中北電網介面附近,示意)
  const [fx1, fy1] = projection([121.06, 24.28]);
  const [fx2, fy2] = projection([121.13, 24.7]);
  const midX2 = (fx1 + fx2) / 2 + 14, midY2 = (fy1 + fy2) / 2;
  s += `<path d="M${fx1} ${fy1} Q${midX2} ${midY2} ${fx2} ${fy2}" fill="none" stroke="${T.ink3}" stroke-width="1.6" stroke-dasharray="6 3"/>`;
  const ang = Math.atan2(fy2 - midY2, fx2 - midX2);
  const ah = (a) => `${fx2 - 7 * Math.cos(ang - a)},${fy2 - 7 * Math.sin(ang - a)}`;
  s += `<polygon points="${fx2},${fy2} ${ah(0.42)} ${ah(-0.42)}" fill="${T.ink3}"/>`;
  s += text(midX2 + 8, midY2 - 2, '中電北送', { size: 8.6, fill: T.ink2, weight: 700 });
  s += text(midX2 + 8, midY2 + 9, `尖峰 ${GRID.central_to_north.peak_flow_mw.toLocaleString()}MW`, { size: 7.6, fill: T.ink3, family: MONO });

  // 內湖收束框 + 徽章
  const nh = enclosing(clusters.neihu);
  s += `<circle cx="${nh.cx}" cy="${nh.cy}" r="${nh.R + 5}" fill="none" stroke="${T.leader}" stroke-width="0.9" stroke-dasharray="3 3"/>`;
  s += text(nh.cx + nh.R + 10, nh.cy - 10, '內湖 ×3', { size: 9, fill: T.ink2, weight: 500 });

  // 泡泡(由大到小)
  const drawOrder = [...sites].sort((a, b) => b.r - a.r);
  for (const p of drawOrder) {
    if (p.status === 'undisclosed') {
      const d = 7.5;
      s += `<path d="M${p.x} ${p.y - d} L${p.x + d} ${p.y} L${p.x} ${p.y + d} L${p.x - d} ${p.y} Z" fill="${T.land}" stroke="${T.ink2}" stroke-width="1.4"/>`;
    } else if (p.nested_inner) {
      const ri = radius(p.nested_inner.mw);
      s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${T.accentFill}" stroke="${T.accent}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      s += `<circle cx="${p.x}" cy="${p.y}" r="${ri}" fill="${T.accent}" filter="url(#glow)" opacity="0.55"/>`;
      s += `<circle cx="${p.x}" cy="${p.y}" r="${ri}" fill="${T.accent}" stroke="${T.ring}" stroke-width="2"/>`;
    } else if (p.status === 'operating') {
      s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${T.accent}" filter="url(#glow)" opacity="0.55"/>`;
      s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${T.accent}" stroke="${T.ring}" stroke-width="2"/>`;
    } else { // construction / planned
      s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${T.accentFill}" stroke="${T.accent}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    }
  }

  // ---------- 標題(全部收在 x<400,避開島嶼北端) ----------
  s += text(10, 34, '台灣 AIDC 開發案地圖', { size: 22, fill: T.ink, weight: 700 });
  s += text(10, 52, 'TAIWAN AI DATA CENTER MAP', { size: 10.5, fill: T.accent, family: MONO, spacing: 1.5 });
  s += text(10, 72, '需求最密的北部,正是供電最緊的北部;', { size: 10.5, fill: T.ink2 });
  s += text(10, 86, '成長的出口在南部算力廊帶。', { size: 10.5, fill: T.ink2 });
  s += text(10, 100, 'Demand is densest where power is tightest — the North.', { size: 7.6, fill: T.ink3, family: MONO });

  // ---------- 左欄卡片(西部案場,由北而南) ----------
  const LX = 8, LW = 160;
  let ly = 112;
  const leaders = [];

  const tao = card(LX, ly, LW, '桃園', 'TAOYUAN ×5', [
    { status: 'operating', name: 'Microsoft 龜山', value: '40MW' },
    { status: 'construction', name: 'Microsoft 蘆竹', value: '50MW' },
    { status: 'construction', name: 'Keppel/DDSP', value: '80MW' },
    { status: 'operating', name: '台灣大×Vantage', value: '25MW·IT16' },
    { status: 'operating', name: '中華電 崙坪', value: '≤36MW', note: '2026-08 啟用;分階段至 36MW' }
  ], T);
  s += tao.svg;
  leaders.push([LX + LW, ly + tao.h / 2, enclosing(clusters.taoyuan)]);
  ly += tao.h + 8;

  // 彰化在台中前:兩點在圖上相距僅 ~20px,此序讓兩條導引線不交叉、不穿 Google 大圓
  const ch = card(LX, ly, LW, '彰化', 'CHANGHUA', [
    { status: 'operating', name: 'Google 彰濱', value: '250MW', note: '2013 啟用;2026 加碼 NT$270 億' }
  ], T);
  s += ch.svg;
  leaders.push([LX + LW, ly + ch.h / 2, { cx: byId.google.x, cy: byId.google.y, R: byId.google.r }]);
  ly += ch.h + 8;

  const tc = card(LX, ly, LW, '台中', 'TAICHUNG', [
    { status: 'undisclosed', name: '是方 中科', value: '未揭露', note: '核准 NT$30 億;2028 商轉' }
  ], T);
  s += tc.svg;
  // 南繞:轉折點放在 Google 大圓以東,再向北接入台中圓
  leaders.push([LX + LW, ly + tc.h / 2, { cx: byId.chief_ct.x, cy: byId.chief_ct.y, R: byId.chief_ct.r }, 320]);
  ly += tc.h + 8;

  const tn = card(LX, ly, LW, '台南', 'TAINAN ×2', [
    { status: 'operating', name: '國網算力中心', value: '15MW', note: '2025-12 啟用' },
    { status: 'planned', name: '沙崙算力中心', value: '120MW', note: '規劃 2029' }
  ], T);
  s += tn.svg;
  leaders.push([LX + LW, ly + 24, { cx: byId.nchc.x, cy: byId.nchc.y, R: byId.nchc.r }]);
  leaders.push([LX + LW, ly + tn.h - 18, { cx: byId.shalun.x, cy: byId.shalun.y, R: byId.shalun.r }]);
  ly += tn.h + 8;

  const kh = card(LX, ly, LW, '高雄', 'KAOHSIUNG', [
    { status: 'nested', name: 'NVIDIA×鴻海', value: '5→27MW', note: '5MW 已商轉;首期 27MW 建置中' }
  ], T);
  s += kh.svg;
  leaders.push([LX + LW, ly + kh.h / 2, { cx: byId.nvidia.x, cy: byId.nvidia.y, R: byId.nvidia.r }]);
  ly += kh.h + 14;

  // ---------- insight 面板(左下空區) ----------
  const PW = 156, PH = 148;
  // 面板 C:限制區內外的需求
  {
    const px = LX, py = ly;
    s += `<rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="4" fill="${T.card}" stroke="${T.cardBorder}"/>`;
    s += text(px + 9, py + 17, '需求擠在限制區', { size: 10, fill: T.ink, weight: 700 });
    s += text(px + 9, py + 29, 'DEMAND INSIDE THE ZONE', { size: 6.8, fill: T.ink3, family: MONO, spacing: 0.5 });
    const maxMw = Math.max(zoneStats.in.mw, zoneStats.out.mw);
    const barW = (mw) => (mw / maxMw) * (PW - 24);
    let by = py + 46;
    s += text(px + 9, by, `北北基桃內 ${zoneStats.in.n} 案`, { size: 8.2, fill: T.ink2 });
    s += text(px + PW - 9, by, `${zoneStats.in.mw}MW`, { size: 8.2, fill: T.ink, family: MONO, anchor: 'end', weight: 600 });
    s += `<rect x="${px + 9}" y="${by + 4}" width="${barW(zoneStats.in.mw)}" height="11" rx="2" fill="${T.accent}"/>`;
    s += `<rect x="${px + 9}" y="${by + 4}" width="${barW(zoneStats.in.mw)}" height="11" rx="2" fill="url(#hatch)"/>`;
    by += 34;
    s += text(px + 9, by, `限制區外 ${zoneStats.out.n} 案`, { size: 8.2, fill: T.ink2 });
    s += text(px + PW - 9, by, `${zoneStats.out.mw}MW+`, { size: 8.2, fill: T.ink, family: MONO, anchor: 'end', weight: 600 });
    s += `<rect x="${px + 9}" y="${by + 4}" width="${barW(zoneStats.out.mw)}" height="11" rx="2" fill="${T.accentFill}" stroke="${T.accent}" stroke-width="1.2"/>`;
    by += 30;
    s += text(px + 9, by, '禁供電政策 vs 市場落點:', { size: 7.6, fill: T.ink3 });
    s += text(px + 9, by + 10, '客戶與光纖在哪,機房就想在哪。', { size: 7.6, fill: T.ink3 });
    s += text(px + 9, by + 22, '口徑依個案,合計僅供量級參考;區外含 1 案未揭露', { size: 6.4, fill: T.ink3 });
  }
  // 面板 B:累積案場數 2013–2029
  {
    const px = LX + PW + 10, py = ly;
    s += `<rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="4" fill="${T.card}" stroke="${T.cardBorder}"/>`;
    s += text(px + 9, py + 17, '前 11 年 1 案,近 4 年 10 案', { size: 10, fill: T.ink, weight: 700 });
    s += text(px + 9, py + 29, 'CUMULATIVE SITES 2013–29', { size: 6.8, fill: T.ink3, family: MONO, spacing: 0.5 });
    const cx0 = px + 12, cy0 = py + PH - 30, cw = PW - 24, chh = 72;
    const X = (i) => cx0 + (i / (YEARS.length - 1)) * cw;
    const Y = (c) => cy0 - (c / DATA.sites.length) * chh;
    let d = `M${X(0)} ${Y(cumCount[0])}`;
    for (let i = 1; i < YEARS.length; i++) d += ` L${X(i)} ${Y(cumCount[i - 1])} L${X(i)} ${Y(cumCount[i])}`;
    s += `<line x1="${cx0}" y1="${cy0}" x2="${cx0 + cw}" y2="${cy0}" stroke="${T.cardBorder}"/>`;
    s += `<path d="${d}" fill="none" stroke="${T.accent}" stroke-width="1.8"/>`;
    const i2024 = YEARS.indexOf(2024), iEnd = YEARS.indexOf(2027);
    s += `<line x1="${X(i2024)}" y1="${cy0}" x2="${X(i2024)}" y2="${Y(13)}" stroke="${T.cardBorder}" stroke-dasharray="2 2"/>`;
    s += text(cx0, cy0 + 11, '2013', { size: 7, fill: T.ink3, family: MONO });
    s += text(X(i2024), cy0 + 11, '2024', { size: 7, fill: T.ink3, family: MONO, anchor: 'middle' });
    s += text(cx0 + cw, cy0 + 11, '2029', { size: 7, fill: T.ink3, family: MONO, anchor: 'end' });
    s += text(X(iEnd) + 3, Y(cumCount[iEnd]) + 3, `${cumCount[iEnd]}`, { size: 8.2, fill: T.ink, family: MONO, weight: 600 });
    s += text(cx0 + 2, Y(1) - 5, '1 案', { size: 7, fill: T.ink3 });
    s += text(px + 9, py + PH - 8, '按啟用/預計年;蘆竹、Keppel 依一期估 2026', { size: 6.4, fill: T.ink3 });
  }

  // ---------- 右欄 ----------
  const RX = 566, RW = 168;   // 右欄 A
  const RX2 = 744, RW2 = 168; // 右欄 B
  let ry = 104;

  const nhCard = card(RX, ry, RW, '台北內湖', 'NEIHU ×3', [
    { status: 'operating', name: '是方 內湖', value: '20MW' },
    { status: 'construction', name: 'Epoch ETW1', value: 'IT 22–23.5MW', note: '2026 啟用;另說 32MW 總受電' },
    { status: 'construction', name: 'Empyrion TW1', value: '10MW·IT7', note: '2027Q4' }
  ], T);
  s += nhCard.svg;
  leaders.push([RX, ry + nhCard.h / 2, { cx: nh.cx, cy: nh.cy, R: nh.R + 5 }]);
  ry += nhCard.h + 10;

  // 政策註記 + D1 電網數字
  const polH = 118;
  s += `<rect x="${RX}" y="${ry}" width="${RW}" height="${polH}" rx="4" fill="${T.card}" stroke="${T.cardBorder}"/>`;
  s += `<rect x="${RX + 9}" y="${ry + 10}" width="16" height="12" fill="url(#hatch)" stroke="${T.hatch}" stroke-width="0.8"/>`;
  s += text(RX + 31, ry + 20, '北北基桃・5MW+ 暫緩供電區', { size: 9, fill: T.ink, weight: 700 });
  s += text(RX + 9, ry + 35, '2024 起實施(2023-09 台電決策)。', { size: 8.4, fill: T.ink2 });
  s += text(RX + 9, ry + 47, '2026-07 有條件解禁:大潭、協和', { size: 8.4, fill: T.ink2 });
  s += text(RX + 9, ry + 59, '電廠周邊;2026-08 擬電廠直供。', { size: 8.4, fill: T.ink2 });
  s += `<line x1="${RX + 9}" y1="${ry + 67}" x2="${RX + RW - 9}" y2="${ry + 67}" stroke="${T.cardBorder}"/>`;
  s += text(RX + 9, ry + 80, `北部電力缺口(2023,台電)`, { size: 8.4, fill: T.ink, weight: 700 });
  s += text(RX + 9, ry + 92, `用電 ${GRID.north_twh_2023.demand} 億度 > 發電 ${GRID.north_twh_2023.supply} 億度`, { size: 8.4, fill: T.ink2, family: MONO });
  s += text(RX + 9, ry + 104, `中電北送尖峰 ${GRID.central_to_north.peak_flow_mw.toLocaleString()}MW(${GRID.central_to_north.year})`, { size: 8.4, fill: T.ink2, family: MONO });
  s += text(RX + 9, ry + 114, 'North runs on power sent north', { size: 7.4, fill: T.ink3, family: MONO });
  ry += polH + 10;

  // 側卡(不入圖事實)— 文案預折行,行寬 ≤150px
  const scItems = [
    { t: 'AWS 台北區域', l: ['區位未揭露;投資 >US$50 億', '2025-06 啟用'] },
    { t: '中華電信 20 座 IDC 升級', l: ['全台既有機房升級 AIDC', '面狀事實,不畫單點'] },
    { t: 'NVIDIA×鴻海 100MW 規劃', l: ['2025 曾宣布三期共 100MW', '2026 年無更新,不畫外圈'] }
  ];
  const scH = 24 + scItems.reduce((a, it) => a + 13 + it.l.length * 10 + 6, 0);
  s += `<rect x="${RX}" y="${ry}" width="${RW}" height="${scH}" rx="4" fill="none" stroke="${T.cardBorder}" stroke-dasharray="3 3"/>`;
  s += text(RX + 9, ry + 16, '不入圖・側記 OFF-MAP', { size: 8.6, fill: T.ink3, weight: 700, spacing: 0.5 });
  let scy = ry + 32;
  for (const it of scItems) {
    s += text(RX + 9, scy, it.t, { size: 8.6, fill: T.ink2, weight: 700 });
    it.l.forEach((l, i) => s += text(RX + 9, scy + 11 + i * 10, l, { size: 7.8, fill: T.ink3 }));
    scy += 13 + it.l.length * 10 + 6;
  }

  // ---------- 圖例(右欄 B) ----------
  let gy = 104;
  const legH = 232;
  s += `<rect x="${RX2}" y="${gy}" width="${RW2}" height="${legH}" rx="4" fill="${T.card}" stroke="${T.cardBorder}"/>`;
  s += text(RX2 + 9, gy + 17, '圖例 LEGEND', { size: 9.5, fill: T.ink, weight: 700, spacing: 0.5 });
  // 面積比例:嵌套圓 250/50/15
  const cX = RX2 + 42, cBase = gy + 88;
  for (const mw of [250, 50, 15]) {
    const r = radius(mw);
    s += `<circle cx="${cX}" cy="${cBase - r}" r="${r}" fill="none" stroke="${T.ink3}" stroke-width="1"/>`;
    s += `<line x1="${cX}" y1="${cBase - 2 * r}" x2="${cX + 38}" y2="${cBase - 2 * r}" stroke="${T.ink3}" stroke-width="0.6" stroke-dasharray="2 2"/>`;
    s += text(cX + 41, cBase - 2 * r + 3, `${mw}`, { size: 8.4, fill: T.ink2, family: MONO });
  }
  s += text(RX2 + 9, cBase + 16, '圓面積 ∝ 容量 MW', { size: 8.6, fill: T.ink2 });
  s += text(RX2 + 9, cBase + 27, 'Area ∝ disclosed capacity', { size: 7.4, fill: T.ink3, family: MONO });
  // 狀態
  let sy = cBase + 44;
  s += glyph(RX2 + 15, sy - 3, 'operating', T);
  s += text(RX2 + 27, sy, '營運中 Operating', { size: 8.8, fill: T.ink2 });
  sy += 15;
  s += glyph(RX2 + 15, sy - 3, 'construction', T);
  s += text(RX2 + 27, sy, '建置/規劃中 In build/Planned', { size: 8.8, fill: T.ink2 });
  sy += 15;
  s += glyph(RX2 + 15, sy - 3, 'undisclosed', T);
  s += text(RX2 + 27, sy, '規模未揭露 Undisclosed', { size: 8.8, fill: T.ink2 });
  sy += 15;
  s += glyph(RX2 + 15, sy - 3, 'nested', T);
  s += text(RX2 + 27, sy, '已商轉首期→建置上限', { size: 8.8, fill: T.ink2 });
  sy += 11;
  s += text(RX2 + 27, sy, 'Live phase → build-out cap', { size: 7.4, fill: T.ink3, family: MONO });
  gy += legH + 10;

  // 警語卡
  const cavZh = [
    '圓面積 ≈ 公開揭露容量,口徑依個案',
    '(契約容量/最大負載/IT 負載)。',
    '座標為鄉鎮級示意;密集區點位經散置。'
  ];
  const cavEn = [
    'Metrics vary by project; positions',
    'are township-level, displaced in',
    'dense clusters for legibility.'
  ];
  const wH = 30 + cavZh.length * 11 + cavEn.length * 9.5 + 6;
  s += `<rect x="${RX2}" y="${gy}" width="${RW2}" height="${wH}" rx="4" fill="none" stroke="${T.cardBorder}"/>`;
  s += text(RX2 + 9, gy + 16, '讀圖前提 CAVEATS', { size: 8.6, fill: T.ink2, weight: 700, spacing: 0.5 });
  cavZh.forEach((l, i) => s += text(RX2 + 9, gy + 31 + i * 11, l, { size: 7.8, fill: T.ink3 }));
  cavEn.forEach((l, i) => s += text(RX2 + 9, gy + 31 + cavZh.length * 11 + 4 + i * 9.5, l, { size: 7, fill: T.ink3, family: MONO }));

  // 導引線(最後畫,壓在泡泡上但避開圓內)
  for (const [fx, fy, tgt, elbowX] of leaders) s += leader(fx, fy, tgt, T, elbowX);

  // ---------- 註腳 ----------
  s += text(10, H - 10, `資料:公開報導與官方新聞稿彙整(來源見 DATA_AUDIT.md)|查核日 ${AUDIT_DATE}|離島無 AIDC 案場,不入圖`, { size: 7.8, fill: T.ink3 });
  s += text(W - 10, H - 10, 'powering-ai-atlas', { size: 7.8, fill: T.ink3, family: MONO, anchor: 'end' });

  s += '</svg>';
  return s;
}

// ---------- 輸出 ----------
const outDir = path.join(__dirname, 'output');
fs.mkdirSync(outDir, { recursive: true });
const fontCss = `
@font-face{font-family:'Noto Sans TC';src:url('../assets/fonts/NotoSansTC-wght.ttf') format('truetype');font-weight:100 900;}
@font-face{font-family:'IBM Plex Mono';src:url('../assets/fonts/IBMPlexMono-Regular.ttf') format('truetype');font-weight:400;}
@font-face{font-family:'IBM Plex Mono';src:url('../assets/fonts/IBMPlexMono-SemiBold.ttf') format('truetype');font-weight:600;}`;

for (const themeName of ['dark', 'light']) {
  const svg = build(themeName);
  fs.writeFileSync(path.join(outDir, `AIDC_map_${themeName}.svg`),
    svg.replace('<defs>', `<defs><style>${fontCss}</style>`));
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>台灣 AIDC 開發案地圖</title>
<style>${fontCss}
html,body{margin:0;padding:0;background:${THEMES[themeName].bg};}
svg{display:block;width:920px;height:660px;}</style></head><body>${svg}</body></html>`;
  fs.writeFileSync(path.join(outDir, `AIDC_map_${themeName}.html`), html);
  console.log(`產出 output/AIDC_map_${themeName}.{svg,html}`);
}
