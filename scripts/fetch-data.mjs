// Download the raw Epoch AI "AI Supercomputers" CSV.
// Run via `npm run fetch-data` (locally or in the update-data GitHub Action).
import { mkdir, writeFile } from 'node:fs/promises';

const URL = 'https://epoch.ai/data/generated/ai_supercomputers.csv';
const OUT = 'data/raw/ai_supercomputers.csv';

const res = await fetch(URL, { headers: { 'user-agent': 'powering-ai-atlas (data refresh script)' } });
if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const text = await res.text();
if (!text.includes(',') || text.trimStart().startsWith('<')) {
  console.error('Downloaded content does not look like a CSV; aborting.');
  process.exit(1);
}
await mkdir('data/raw', { recursive: true });
await writeFile(OUT, text);
console.log(`Saved ${OUT} (${(text.length / 1024).toFixed(0)} KB, ${text.split('\n').length} lines)`);
