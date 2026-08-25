// Transform the raw Epoch CSVs into the compact JSON the map consumes.
// Two layers:
//  - "operational" (solid dots):  AI Supercomputers dataset, existing clusters
//  - "campus"      (hollow dots): Frontier Data Centers hub, mega-campuses
//    building out (no coordinates upstream — geocoded to city level below)
// Column names are resolved by pattern so minor upstream renames don't break us;
// the resolved mapping and any unmapped values are logged for review.
import { readFile, writeFile } from 'node:fs/promises';

const RAW_CLUSTERS = 'data/raw/ai_supercomputers.csv';
const RAW_CAMPUSES = 'data/raw/data_centers.csv';
const OUT_DATA = 'src/data/clusters.json';
const OUT_META = 'src/data/meta.json';

/* ---- minimal RFC 4180 CSV parser ---- */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function findCol(headers, patterns, { required = true, label }) {
  for (const p of patterns) {
    const idx = headers.findIndex((h) => p.test(h));
    if (idx !== -1) return idx;
  }
  if (required) {
    console.error(`Could not resolve required column "${label}" among: ${headers.join(' | ')}`);
    process.exit(1);
  }
  return -1;
}

const num = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

/* ---- owner buckets (must match src/components/owners.js keys) ---- */
function ownerKeyFor(owner) {
  const o = (owner || '').toLowerCase();
  if (/microsoft/.test(o)) return 'microsoft';
  if (/amazon|aws/.test(o)) return 'amazon';
  if (/google|alphabet|deepmind/.test(o)) return 'google';
  if (/\bmeta\b|facebook/.test(o)) return 'meta';
  if (/openai/.test(o)) return 'openai';
  return 'other';
}

// bucket by owner, falling back to the primary user — for leased sites (e.g.
// Stargate campuses owned by Oracle/Crusoe but run for OpenAI) the user is the
// identity readers ask about
function bucketFor(owner, users) {
  const byOwner = ownerKeyFor(owner);
  if (byOwner !== 'other') return byOwner;
  return ownerKeyFor(users);
}

/* ================= layer 1: AI supercomputers (operational) ================= */

const text = await readFile(RAW_CLUSTERS, 'utf8');
const rows = parseCSV(text);
const headers = rows[0];
console.log(`[clusters] ${rows.length - 1} rows, ${headers.length} columns`);

const col = {
  name: findCol(headers, [/^name$/i, /name/i], { label: 'name' }),
  lat: findCol(headers, [/^latitude$/i, /latitude/i], { label: 'latitude' }),
  lng: findCol(headers, [/^longitude$/i, /longitude/i], { label: 'longitude' }),
  owner: findCol(headers, [/^owner$/i, /owner/i], { label: 'owner' }),
  country: findCol(headers, [/^country$/i, /country/i], { label: 'country' }),
  status: findCol(headers, [/^status$/i, /status/i], { label: 'status' }),
  mw: findCol(headers, [/^power capacity \(mw\)$/i, /power.*capacity.*\(mw\)/i, /^power/i], { label: 'power (MW)' }),
  h100e: findCol(headers, [/^h100 equivalents$/i, /h100/i], { required: false, label: 'h100 equivalents' }),
  users: findCol(headers, [/^users$/i], { required: false, label: 'users' }),
  date: findCol(headers, [/first.*operational date$/i, /first.*operational/i], { required: false, label: 'first operational date' }),
  certainty: findCol(headers, [/^certainty$/i], { required: false, label: 'certainty' }),
  superseded: findCol(headers, [/^superseded by$/i], { required: false, label: 'superseded by' }),
  decommissioned: findCol(headers, [/^decommissioned date/i], { required: false, label: 'decommissioned date' }),
};
console.log('[clusters] resolved columns:', Object.fromEntries(Object.entries(col).map(([k, i]) => [k, headers[i] ?? '(none)'])));

const statusValues = new Map();
let skippedNoCoords = 0;
let droppedSuperseded = 0;
let droppedGone = 0;
const out = [];

for (const r of rows.slice(1)) {
  statusValues.set(r[col.status], (statusValues.get(r[col.status]) || 0) + 1);

  // decommissioned or replaced-by-a-newer-listed-system rows would double-count
  if (col.decommissioned !== -1 && r[col.decommissioned]?.trim()) {
    droppedGone++;
    continue;
  }
  if (col.superseded !== -1 && r[col.superseded]?.trim()) {
    droppedSuperseded++;
    continue;
  }
  const lat = num(r[col.lat]);
  const lng = num(r[col.lng]);
  if (lat === null || lng === null) {
    skippedNoCoords++;
    continue;
  }
  const owner = r[col.owner]?.trim() || 'Undisclosed';
  const dateStr = col.date !== -1 ? r[col.date] : '';
  out.push({
    name: r[col.name],
    owner,
    ownerKey: bucketFor(owner, col.users !== -1 ? r[col.users] : ''),
    country: r[col.country] || '',
    lat,
    lng,
    mw: num(r[col.mw]),
    h100e: col.h100e !== -1 ? num(r[col.h100e]) : null,
    status: 'operational',
    year: dateStr ? num(dateStr.slice(0, 4)) : null,
    cert: col.certainty === -1 || /confirmed/i.test(r[col.certainty] || ''),
  });
}
console.log('[clusters] status values seen:', Object.fromEntries(statusValues));
console.log(`[clusters] kept ${out.length} · superseded ${droppedSuperseded} · decommissioned ${droppedGone} · no coords ${skippedNoCoords}`);

/* ================= layer 2: frontier mega-campuses (hollow) ================= */
/* The hub CSV has street addresses but no coordinates — geocode to city level. */

const CITY_COORDS = {
  'Abilene,TX': [32.4487, -99.7331], 'Afton,TX': [33.1701, -101.0541],
  'Barker,NY': [43.3292, -78.5417], 'Claude,TX': [34.8834, -101.3648],
  'Columbus,OH': [39.9612, -82.9988], 'Council Bluffs,IA': [41.2619, -95.8608],
  'Cumming,IA': [41.4709, -93.7636], 'Denton,TX': [33.2148, -97.1331],
  'Fairfax,IA': [41.9247, -91.7808], 'Fayetteville,GA': [33.4418, -84.4549],
  'Fort Wayne,IN': [41.0793, -85.1394], 'Goodyear,AZ': [33.4353, -112.3576],
  'Manassas,VA': [38.7509, -77.4753], 'Memphis,TN': [35.1495, -90.049],
  'Midlothian,TX': [32.4818, -97.0058], 'Mount Pleasant,WI': [42.7197, -87.8784],
  'New Albany,OH': [40.0814, -82.796], 'New Carlisle,IN': [41.7056, -86.5014],
  'Omaha,NE': [41.2565, -95.9345], 'Pryor,OK': [36.3042, -95.3169],
  'Red Oak,TX': [32.5165, -96.8047], 'San Antonio,TX': [29.4241, -98.4936],
  'Sandston,VA': [37.5243, -77.3191], 'Temple,TX': [31.0982, -97.3428],
  'Warren,OH': [41.2373, -80.8184], 'Papillion,NE': [41.0197, -96.0447],
  'Ridgeland,MS': [32.4085, -90.1323], 'The Dalles,OR': [45.5946, -121.1787],
  'Cedar Rapids,IA': [41.9779, -91.6656], 'Kuna,ID': [43.4921, -116.4202],
  'Madison,MS': [32.61, -90.04], 'Holly Ridge,LA': [32.6, -91.87],
  'Richland Parish,LA': [32.4, -91.75], 'Rosenberg,TX': [29.5572, -95.8088],
  'Leesburg,VA': [39.1157, -77.5636], 'Ashburn,VA': [39.0438, -77.4874],
  'Atlanta,GA': [33.749, -84.388], 'Phoenix,AZ': [33.4484, -112.074],
  'El Paso,TX': [31.7619, -106.485], 'Cheyenne,WY': [41.14, -104.8202],
  'Louisville,KY': [38.2527, -85.7585], 'Lancaster,TX': [32.5921, -96.7561],
};
const STATE_CENTROIDS = {
  AL: [32.8067, -86.7911], AZ: [33.7298, -111.4312], AR: [34.9697, -92.3731],
  CA: [36.1162, -119.6816], CO: [39.0598, -105.3111], FL: [27.7663, -81.6868],
  GA: [33.0406, -83.6431], ID: [44.2405, -114.4788], IL: [40.3495, -88.9861],
  IN: [39.8494, -86.2583], IA: [42.0115, -93.2105], KS: [38.5266, -96.7265],
  KY: [37.6681, -84.6701], LA: [31.17, -91.8678], MI: [43.3266, -84.5361],
  MN: [45.6945, -93.9002], MS: [32.7416, -89.6787], MO: [38.4561, -92.2884],
  NE: [41.1254, -98.2681], NV: [38.3135, -117.0554], NM: [34.8405, -106.2485],
  NY: [42.1657, -74.9481], NC: [35.6301, -79.8064], ND: [47.5289, -99.784],
  OH: [40.3888, -82.7649], OK: [35.5653, -96.9289], OR: [44.572, -122.0709],
  PA: [40.5908, -77.2098], SC: [33.8569, -80.945], TN: [35.7478, -86.6923],
  TX: [31.0545, -97.5635], UT: [40.15, -111.8624], VA: [37.7693, -78.17],
  WA: [47.4009, -121.4905], WI: [44.2685, -89.6165], WY: [42.756, -107.3025],
};
const COUNTRY_COORDS = {
  'United Arab Emirates': [24.42, 54.62], Portugal: [38.7169, -9.1399],
  Malaysia: [3.139, 101.6869], Indonesia: [-6.2088, 106.8456],
  'United Kingdom': [53.0, -1.5], France: [46.6, 2.4], Norway: [60.5, 8.5],
  India: [21.0, 78.0], Japan: [36.0, 138.0], 'South Korea': [36.5, 127.9],
  Canada: [53.0, -100.0], Australia: [-25.0, 134.0], China: [41.1, 114.7],
  'Saudi Arabia': [24.0, 45.0], Qatar: [25.3, 51.2],
};

// last resort: recognizable toponyms in the facility name or street address
const PLACE_HINTS = {
  'Storey County': [39.55, -119.53], 'New Mexico': [34.8405, -106.2485],
  Wisconsin: [44.2685, -89.6165], Michigan: [43.3266, -84.5361],
  Milam: [30.7885, -96.9781], 'Kansas City': [39.0997, -94.5786],
  Litchfield: [33.42, -112.32], Phoenix: [33.4484, -112.074],
};

function geocodeCampus(address, country, name) {
  if (country && country !== 'United States' && COUNTRY_COORDS[country]) {
    return { coords: COUNTRY_COORDS[country], precision: 'country' };
  }
  const m = /,\s*([^,]+),\s*([A-Z]{2})(?:\s+\d{5})?\s*$/.exec((address || '').trim());
  if (m) {
    const key = `${m[1].trim()},${m[2]}`;
    if (CITY_COORDS[key]) return { coords: CITY_COORDS[key], precision: 'city' };
    if (STATE_CENTROIDS[m[2]]) return { coords: STATE_CENTROIDS[m[2]], precision: 'state' };
  }
  const hay = `${address || ''} ${name || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (hay.includes(key.split(',')[0].toLowerCase())) return { coords, precision: 'city' };
  }
  for (const [place, coords] of Object.entries(PLACE_HINTS)) {
    if (hay.includes(place.toLowerCase())) return { coords, precision: 'state' };
  }
  return null;
}

let campuses = [];
let campusesSkipped = 0;
try {
  const ctext = await readFile(RAW_CAMPUSES, 'utf8');
  const crows = parseCSV(ctext);
  const ch = crows[0];
  const cc = {
    name: findCol(ch, [/^name$/i], { label: 'name' }),
    mw: findCol(ch, [/current power \(mw\)/i, /power \(mw\)/i], { label: 'current power' }),
    h100e: findCol(ch, [/h100 equivalents/i], { required: false, label: 'h100e' }),
    owner: findCol(ch, [/^owner$/i], { label: 'owner' }),
    users: findCol(ch, [/^users$/i], { required: false, label: 'users' }),
    country: findCol(ch, [/^country$/i], { label: 'country' }),
    address: findCol(ch, [/^address$/i], { required: false, label: 'address' }),
  };
  console.log(`[campuses] ${crows.length - 1} rows`);
  for (const r of crows.slice(1)) {
    // owner/user cells carry "#confident"-style certainty tags — strip them
    const owner = (r[cc.owner] || '').split('#')[0].trim().replace(/,\s*$/, '') || 'Undisclosed';
    const geo = geocodeCampus(cc.address !== -1 ? r[cc.address] : '', r[cc.country]?.trim(), r[cc.name]);
    if (!geo) {
      campusesSkipped++;
      console.warn(`[campuses] could not geocode: ${r[cc.name]} — ${r[cc.address]} (${r[cc.country]})`);
      continue;
    }
    campuses.push({
      name: r[cc.name],
      owner: owner.replace(/^SpaceXAI$/i, 'xAI'),
      ownerKey: bucketFor(owner, cc.users !== -1 ? r[cc.users] : ''),
      country: r[cc.country]?.trim() || '',
      lat: geo.coords[0],
      lng: geo.coords[1],
      mw: num(r[cc.mw]),
      h100e: cc.h100e !== -1 ? num(r[cc.h100e]) : null,
      status: 'campus',
      year: null,
      cert: true,
      approx: geo.precision !== 'city',
    });
  }
  console.log(`[campuses] kept ${campuses.length} · not geocoded ${campusesSkipped}`);
} catch (err) {
  console.warn(`⚠️ Campus layer skipped (${err.message})`);
}

/* ================= write ================= */

const all = [...out, ...campuses].sort((a, b) => (b.mw || 0) - (a.mw || 0));
await writeFile(OUT_DATA, JSON.stringify(all, null, 1) + '\n');
await writeFile(
  OUT_META,
  JSON.stringify(
    {
      sample: false,
      updated: new Date().toISOString().slice(0, 10),
      count: out.length,
      campusCount: campuses.length,
      source: 'Epoch AI, “AI Supercomputers” dataset',
      sourceUrl: 'https://epoch.ai/data/ai-supercomputers',
      campusSource: 'Epoch AI, “Frontier Data Centers” hub',
      campusSourceUrl: 'https://epoch.ai/data/data-centers',
      license: 'CC BY 4.0',
      skippedNoCoords,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Wrote ${OUT_DATA} (${all.length} features) and ${OUT_META}`);
