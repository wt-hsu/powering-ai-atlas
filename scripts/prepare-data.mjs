// Transform the raw Epoch CSV into the compact JSON the map consumes.
// Column names are resolved by pattern so minor upstream renames don't break us;
// the resolved mapping and any unmapped status values are logged for review.
import { readFile, writeFile } from 'node:fs/promises';

const RAW = 'data/raw/ai_supercomputers.csv';
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

function statusFor(raw) {
  const s = (raw || '').toLowerCase();
  if (/decommission|retired|cancel/.test(s)) return null; // dropped
  if (/construction|planned|announced|rumor|rumour|proposed/.test(s)) return 'upcoming';
  if (/existing|operational|active|^$/.test(s)) return 'operational';
  return 'unmapped';
}

/* ---- main ---- */
const text = await readFile(RAW, 'utf8');
const rows = parseCSV(text);
const headers = rows[0];
console.log(`Parsed ${rows.length - 1} data rows, ${headers.length} columns`);

const col = {
  name: findCol(headers, [/^name$/i, /name/i], { label: 'name' }),
  lat: findCol(headers, [/^latitude$/i, /latitude/i, /\blat\b/i], { label: 'latitude' }),
  lng: findCol(headers, [/^longitude$/i, /longitude/i, /\blon|lng\b/i], { label: 'longitude' }),
  owner: findCol(headers, [/^owner$/i, /owner/i], { label: 'owner' }),
  country: findCol(headers, [/^country$/i, /country/i], { label: 'country' }),
  status: findCol(headers, [/^status$/i, /status/i], { label: 'status' }),
  mw: findCol(
    headers,
    [/power.*capacity.*calculated/i, /calculated.*power/i, /power.*capacity/i, /power.*\(mw\)/i, /^power/i],
    { label: 'power (MW)' },
  ),
  h100e: findCol(headers, [/h100/i], { required: false, label: 'h100 equivalents' }),
  date: findCol(headers, [/first.*operational/i, /operational.*date/i], { required: false, label: 'first operational date' }),
};
console.log('Resolved columns:', Object.fromEntries(Object.entries(col).map(([k, i]) => [k, headers[i] ?? '(none)'])));

const statusValues = new Map();
let skippedNoCoords = 0;
let dropped = 0;
const out = [];

for (const r of rows.slice(1)) {
  const rawStatus = col.status !== -1 ? r[col.status] : '';
  statusValues.set(rawStatus, (statusValues.get(rawStatus) || 0) + 1);

  const status = statusFor(rawStatus);
  if (status === null) {
    dropped++;
    continue;
  }
  const lat = num(r[col.lat]);
  const lng = num(r[col.lng]);
  if (lat === null || lng === null) {
    skippedNoCoords++;
    continue;
  }
  const owner = r[col.owner] || 'Unknown';
  const dateStr = col.date !== -1 ? r[col.date] : '';
  const year = dateStr ? num(dateStr.slice(0, 4)) : null;
  out.push({
    name: r[col.name],
    owner,
    ownerKey: ownerKeyFor(owner),
    country: r[col.country] || '',
    lat,
    lng,
    mw: num(r[col.mw]),
    h100e: col.h100e !== -1 ? num(r[col.h100e]) : null,
    status: status === 'unmapped' ? 'operational' : status,
    year,
  });
}

console.log('Status values seen:', Object.fromEntries(statusValues));
const unmapped = [...statusValues.keys()].filter((s) => statusFor(s) === 'unmapped');
if (unmapped.length) console.warn('⚠️ Unmapped status values (treated as operational):', unmapped);
console.log(`Kept ${out.length} · dropped (decommissioned/cancelled) ${dropped} · skipped (no coordinates) ${skippedNoCoords}`);

out.sort((a, b) => (b.mw || 0) - (a.mw || 0));
await writeFile(OUT_DATA, JSON.stringify(out, null, 1) + '\n');
await writeFile(
  OUT_META,
  JSON.stringify(
    {
      sample: false,
      updated: new Date().toISOString().slice(0, 10),
      count: out.length,
      source: 'Epoch AI, “AI Supercomputers” dataset',
      sourceUrl: 'https://epoch.ai/data/ai-supercomputers',
      license: 'CC BY 4.0',
      skippedNoCoords,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Wrote ${OUT_DATA} and ${OUT_META}`);
