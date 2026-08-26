// 獨立 insight 圖卡產生器:node cards.cjs
// 讀 gen.cjs 匯出的主題/統計 → output/cards/*.{svg,html,png}(1200×675,@2x PNG)
const fs = require('fs');
const path = require('path');
const { THEMES, SANS, MONO, DATA, GRID, AUDIT_DATE, zoneStats, YEARS, cumCount, text, fontCss } = require('./gen.cjs');

const W = 1200, H = 675;
const M = 64; // 邊距
const outDir = path.join(__dirname, 'output', 'cards');
fs.mkdirSync(outDir, { recursive: true });

const additions = YEARS.map((y) => DATA.sites.filter((s) => s.year_online === y).length);

// 卡片外框:標題/副標/註腳/品牌,回傳 {head, foot} 片段與繪圖區
function chrome(T, title, titleEn, footNote) {
  let head = `<rect width="${W}" height="${H}" fill="${T.bg}"/>`;
  for (let gx = 0; gx <= W; gx += 60) head += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${T.grid}"/>`;
  for (let gy = 0; gy <= H; gy += 60) head += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${T.grid}"/>`;
  head += text(M, 88, title, { size: 34, fill: T.ink, weight: 700 });
  head += text(M, 118, titleEn, { size: 15, fill: T.accent, family: MONO, spacing: 2 });
  let foot = text(M, H - 40, footNote, { size: 12.5, fill: T.ink3 });
  foot += text(M, H - 22, `資料:公開報導與官方新聞稿彙整(來源見 DATA_AUDIT.md)|查核日 ${AUDIT_DATE}`, { size: 12.5, fill: T.ink3 });
  foot += text(W - M, H - 22, 'powering-ai-atlas', { size: 13, fill: T.ink3, family: MONO, anchor: 'end' });
  return { head, foot };
}

const hatchDef = (T) => `<defs><pattern id="hatch" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="9" stroke="${T.hatch}" stroke-width="1.5"/></pattern></defs>`;

// ---------- 卡 1:需求擠在限制區(C) ----------
function cardZone(T) {
  const { head, foot } = chrome(T, '需求擠在限制區', 'DEMAND INSIDE THE MORATORIUM ZONE',
    '口徑依個案(契約容量/最大負載/IT 負載),合計僅供量級參考;區外另有 1 案容量未揭露。');
  let s = head;
  s += text(M, 168, '台電 2023-09 起不核供北北基桃 5MW+ 資料中心——但市場的落點沒有跟著政策走。', { size: 17, fill: T.ink2 });
  const maxMw = Math.max(zoneStats.in.mw, zoneStats.out.mw);
  const barW = (mw) => (mw / maxMw) * (W - 2 * M - 200);
  const rows = [
    { y: 240, label: `北北基桃「暫緩供電區」內・${zoneStats.in.n} 案`, mw: zoneStats.in.mw, val: `${zoneStats.in.mw}MW`, hatch: true },
    { y: 400, label: `限制區外・${zoneStats.out.n} 案`, mw: zoneStats.out.mw, val: `${zoneStats.out.mw}MW+`, hatch: false },
  ];
  for (const r of rows) {
    s += text(M, r.y, r.label, { size: 19, fill: T.ink, weight: 500 });
    if (r.hatch) {
      s += `<rect x="${M}" y="${r.y + 16}" width="${barW(r.mw)}" height="64" rx="5" fill="${T.accent}"/>`;
      s += `<rect x="${M}" y="${r.y + 16}" width="${barW(r.mw)}" height="64" rx="5" fill="url(#hatch)"/>`;
    } else {
      s += `<rect x="${M}" y="${r.y + 16}" width="${barW(r.mw)}" height="64" rx="5" fill="${T.accentFill}" stroke="${T.accent}" stroke-width="2"/>`;
    }
    s += text(M + barW(r.mw) + 18, r.y + 58, r.val, { size: 30, fill: T.ink, family: MONO, weight: 600 });
  }
  s += text(M, 560, '客戶、光纖與人才在哪,機房就想在哪——政策擋得住供電,擋不住選址。', { size: 15, fill: T.ink2 });
  return hatchDef(T) + s + foot;
}

// ---------- 卡 2:累積案場數(B) ----------
function cardCumulative(T) {
  const { head, foot } = chrome(T, '前 11 年 1 案,近 4 年 10 案', 'CUMULATIVE AIDC SITES 2013–2029',
    '按各案啟用/預計年;Microsoft 蘆竹無公開年份、Keppel 依一期投入服務估 2026。');
  let s = head;
  const cx0 = M + 20, cy0 = 520, cw = W - 2 * M - 40, ch = 330;
  const X = (i) => cx0 + (i / (YEARS.length - 1)) * cw;
  const Y = (c) => cy0 - (c / 13) * ch;
  for (const g of [5, 10]) {
    s += `<line x1="${cx0}" y1="${Y(g)}" x2="${cx0 + cw}" y2="${Y(g)}" stroke="${T.grid}"/>`;
    s += text(cx0 - 10, Y(g) + 4, `${g}`, { size: 13, fill: T.ink3, family: MONO, anchor: 'end' });
  }
  s += `<line x1="${cx0}" y1="${cy0}" x2="${cx0 + cw}" y2="${cy0}" stroke="${T.cardBorder}" stroke-width="1.5"/>`;
  let d = `M${X(0)} ${Y(cumCount[0])}`;
  for (let i = 1; i < YEARS.length; i++) d += ` L${X(i)} ${Y(cumCount[i - 1])} L${X(i)} ${Y(cumCount[i])}`;
  s += `<path d="${d}" fill="none" stroke="${T.accent}" stroke-width="3.5"/>`;
  const i24 = YEARS.indexOf(2024), i27 = YEARS.indexOf(2027);
  s += `<line x1="${X(i24)}" y1="${cy0}" x2="${X(i24)}" y2="${Y(13)}" stroke="${T.cardBorder}" stroke-dasharray="4 4"/>`;
  for (const [i, lab] of [[0, '2013'], [i24, '2024'], [i27, '2027'], [YEARS.length - 1, '2029']]) {
    s += text(X(i), cy0 + 24, lab, { size: 14, fill: T.ink3, family: MONO, anchor: 'middle' });
  }
  s += text(X(3), Y(1) - 14, 'Google 彰濱之後,11 年僅 1 案', { size: 15, fill: T.ink2 });
  s += text(X(i27) - 14, Y(cumCount[i27]) - 14, `4 年 +10 案`, { size: 17, fill: T.ink, weight: 700, anchor: 'end' });
  s += text(X(YEARS.length - 1), Y(13) - 12, '13', { size: 20, fill: T.ink, family: MONO, weight: 600, anchor: 'end' });
  return s + foot;
}

// ---------- 卡 3:每年新增案數(新) ----------
function cardAdditions(T) {
  const { head, foot } = chrome(T, '每年新增 AIDC 案數', 'NEW AIDC SITES PER YEAR',
    '按各案啟用/預計年(2026 起含建置/規劃中);樣本小、單案量體差異大,不適合換算成長率。');
  let s = head;
  const cx0 = M + 20, cy0 = 520, cw = W - 2 * M - 40, ch = 320;
  const maxN = Math.max(...additions);
  const slot = cw / YEARS.length;
  const bw = slot * 0.6;
  s += `<line x1="${cx0}" y1="${cy0}" x2="${cx0 + cw}" y2="${cy0}" stroke="${T.cardBorder}" stroke-width="1.5"/>`;
  // 2024–27 加速帶
  const bx = cx0 + YEARS.indexOf(2024) * slot - 4, bw2 = 4 * slot + 8;
  s += `<rect x="${bx}" y="${cy0 - ch - 34}" width="${bw2}" height="${ch + 34}" rx="6" fill="${T.accentFill}"/>`;
  s += text(bx + bw2 / 2, cy0 - ch - 46, '2024–27:10 案', { size: 16, fill: T.ink, weight: 700, anchor: 'middle' });
  YEARS.forEach((y, i) => {
    const n = additions[i];
    const x = cx0 + i * slot + (slot - bw) / 2;
    if (n > 0) {
      const h = (n / maxN) * ch;
      s += `<rect x="${x}" y="${cy0 - h}" width="${bw}" height="${h}" rx="4" fill="${T.accent}"/>`;
      s += text(x + bw / 2, cy0 - h - 10, `${n}`, { size: 17, fill: T.ink, family: MONO, weight: 600, anchor: 'middle' });
    }
    if ([2013, 2016, 2019, 2022, 2024, 2026, 2029].includes(y)) {
      s += text(x + bw / 2, cy0 + 24, `${y}`, { size: 13.5, fill: T.ink3, family: MONO, anchor: 'middle' });
    }
  });
  return s + foot;
}

// ---------- 輸出 + 截圖 ----------
const CARDS = [
  { id: 'zone', build: cardZone },
  { id: 'cumulative', build: cardCumulative },
  { id: 'additions', build: cardAdditions },
];

(async () => {
  const files = [];
  for (const themeName of ['dark', 'light']) {
    const T = THEMES[themeName];
    for (const c of CARDS) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${SANS.replace(/'/g, '&#39;')}">${c.build(T)}</svg>`;
      const base = `card_${c.id}_${themeName}`;
      const cardFontCss = fontCss.replace(/\.\.\/assets/g, '../../assets');
      fs.writeFileSync(path.join(outDir, `${base}.svg`), svg.replace(/^<svg/, `<svg`).replace('>', `><style>${cardFontCss}</style>`, 1));
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cardFontCss}
html,body{margin:0;padding:0;background:${T.bg};}svg{display:block;width:${W}px;height:${H}px;}</style></head><body>${svg}</body></html>`;
      fs.writeFileSync(path.join(outDir, `${base}.html`), html);
      files.push(base);
    }
  }
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  for (const base of files) {
    await page.goto('file://' + path.join(outDir, `${base}.html`));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(outDir, `${base}@2x.png`) });
    console.log(`產出 output/cards/${base}.{svg,html,png}`);
  }
  await browser.close();
})();
