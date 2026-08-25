// Download the raw Epoch AI datasets:
//  - "AI Supercomputers" (operational clusters) — required
//  - "Frontier Data Centers" (mega-campuses)   — best effort; on failure the
//    committed snapshot in data/raw/ is kept
// Run via `npm run fetch-data` (locally or in the update-data GitHub Action).
import { mkdir, writeFile } from 'node:fs/promises';

const SOURCES = [
  {
    url: 'https://epoch.ai/data/generated/ai_supercomputers.csv',
    out: 'data/raw/ai_supercomputers.csv',
    required: true,
  },
  {
    url: 'https://epoch.ai/data/generated/data_centers.csv',
    out: 'data/raw/data_centers.csv',
    required: false,
  },
];

await mkdir('data/raw', { recursive: true });

for (const { url, out, required } of SOURCES) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'powering-ai-atlas (data refresh script)' } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    if (!text.includes(',') || text.trimStart().startsWith('<')) throw new Error('response is not a CSV');
    await writeFile(out, text);
    console.log(`Saved ${out} (${(text.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    if (required) {
      console.error(`Download failed for required ${url}: ${err.message}`);
      process.exit(1);
    }
    console.warn(`⚠️ Optional download failed (${url}: ${err.message}) — keeping existing ${out}`);
  }
}
