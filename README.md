# ⚡ Powering AI Atlas

An open, source-linked atlas of global AI infrastructure — interactive maps and
visual essays about the physical footprint of artificial intelligence.

**Live site:** https://wt-hsu.github.io/powering-ai-atlas/

## Pieces

| Piece | Path | Status |
|---|---|---|
| Where AI Computing Lives — global map of AI supercomputers | `/compute-map/` | v1 |
| The Build-out — timeline of the largest AI campuses | — | planned |

## Tech

- [Astro](https://astro.build) static site, deployed to GitHub Pages
- Interactive pieces are React islands using [MapLibre GL JS](https://maplibre.org) via `react-map-gl`
- Dark-committed design; owner colors are a colorblind-validated categorical set

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
```

Tip: `PUBLIC_BASEMAP=offline npm run build` swaps the remote basemap for a plain
dark background — useful in sandboxes without network access to the tile server.

## Data

Map data comes from the [Epoch AI “AI Supercomputers” dataset](https://epoch.ai/data/ai-supercomputers)
(CC BY 4.0), committed to the repo as a static snapshot:

- `scripts/fetch-data.mjs` downloads the raw CSV to `data/raw/`
- `scripts/prepare-data.mjs` filters and reshapes it into `src/data/clusters.json`
  (decommissioned sites dropped; sites without coordinates — e.g. anonymized
  Chinese facilities — skipped and counted in `src/data/meta.json`)

To refresh the snapshot, run the **Update data** GitHub Action (or run both
scripts locally) and commit the result.

## Attribution

- Data: [Epoch AI](https://epoch.ai/data/ai-supercomputers), CC BY 4.0
- Basemap: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, © [CARTO](https://carto.com/attributions)
