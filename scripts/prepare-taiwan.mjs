// 台灣 AIDC 互動地圖資料準備:sites.json + taiwan-atlas → src/data/taiwan-aidc.json
// 用法:node scripts/prepare-taiwan.mjs(改 sites.json 後重跑)
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, mesh, merge } from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = require('taiwan-atlas/counties-10t.json');
const data = JSON.parse(fs.readFileSync(new URL('../sites.json', import.meta.url), 'utf8'));

// 北北基桃 5MW+ 暫緩供電區(縣市面);排除離島
const EXCLUDE = new Set(['金門縣', '連江縣', '澎湖縣']);
const isMain = (g) => !EXCLUDE.has(g.properties.COUNTYNAME);
const counties = feature(topo, topo.objects.counties);
const NORTH = new Set(['台北市', '新北市', '基隆市', '桃園市']);
const moratorium = {
  type: 'FeatureCollection',
  features: counties.features.filter((f) => NORTH.has(f.properties.COUNTYNAME)),
};

// 自帶底圖層:本島陸地面 + 縣界線 + 海岸輪廓(不依賴外部 basemap 也能讀出台灣)
const land = {
  type: 'Feature',
  properties: {},
  geometry: merge(topo, topo.objects.counties.geometries.filter(isMain)),
};
const borders = {
  type: 'Feature',
  properties: {},
  geometry: mesh(topo, { ...topo.objects.counties, geometries: topo.objects.counties.geometries.filter(isMain) }, (a, b) => a !== b),
};
const coast = {
  type: 'Feature',
  properties: {},
  geometry: mesh(topo, { ...topo.objects.counties, geometries: topo.objects.counties.geometries.filter(isMain) }, (a, b) => a === b),
};

// 案場點(NVIDIA 嵌套:外圈用 mw,內圈另出一個 core 點)
const siteFeature = (s) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: s.lonlat },
  properties: {
    id: s.id,
    name: s.name,
    region: s.region,
    mw: s.mw_draw,
    mwLabel: s.mw_label,
    status: s.status,
    timeline: s.timeline || '',
    grade: s.grade,
    nestedLive: s.nested_inner ? s.nested_inner.mw : null,
    nestedLabel: s.nested_inner ? s.nested_inner.label : null,
    year: s.year_online,
  },
});
const sites = { type: 'FeatureCollection', features: data.sites.map(siteFeature) };

// 南臺灣算力廊帶:南部三點外框(經緯度,含邊距)
const south = data.sites.filter((s) => ['nchc', 'shalun', 'nvidia'].includes(s.id));
const pad = 0.14;
const lons = south.map((s) => s.lonlat[0]);
const lats = south.map((s) => s.lonlat[1]);
const [x0, x1] = [Math.min(...lons) - pad, Math.max(...lons) + pad];
const [y0, y1] = [Math.min(...lats) - pad, Math.max(...lats) + pad];
const corridor = {
  type: 'Feature',
  properties: { name: '南臺灣算力廊帶 Southern Compute Corridor' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]],
  },
};

// D1 流向線(中電北送,示意)與 insight 統計
const flow = {
  type: 'Feature',
  properties: { name: '中電北送' },
  geometry: { type: 'LineString', coordinates: [[121.06, 24.28], [121.1, 24.55], [121.13, 24.7]] },
};
const IN_ZONE = new Set(['taoyuan', 'neihu']);
const stats = { inZone: { mw: 0, n: 0 }, outZone: { mw: 0, n: 0 } };
for (const s of data.sites) {
  const t = IN_ZONE.has(s.cluster) ? stats.inZone : stats.outZone;
  t.n++;
  if (s.mw_draw) t.mw += s.mw_draw;
}

const out = { auditDate: data.audit_date, sites, moratorium, corridor, land, borders, coast, sidecard: data.sidecard, grid: data.grid, flow, stats };
// 座標降至 4 位小數(≈11m),檔案瘦身;鄉鎮級示意用綽綽有餘
const round = (v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v);
const json = JSON.stringify(out, (k, v) => (Array.isArray(v) ? v.map(round) : v));
fs.writeFileSync(new URL('../src/data/taiwan-aidc.json', import.meta.url), json);
console.log(
  `src/data/taiwan-aidc.json:${data.sites.length} 案場、暫緩區 ${moratorium.features.length} 縣市、查核日 ${data.audit_date}`,
);
