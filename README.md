# ⚡ Powering AI Atlas

An open, source-linked atlas of global AI infrastructure — interactive maps and
visual essays about the physical footprint of artificial intelligence.

**Live site:** https://wt-hsu.github.io/powering-ai-atlas/

## Pieces

| Piece | Path | Status |
|---|---|---|
| Where AI Computing Lives — global map of AI supercomputers | `/compute-map/` | v1 |
| 台灣 AIDC 開發案地圖 — Taiwan AI data center map (static SVG/PNG) | `output/` | v1 |
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

## 台灣 AIDC 開發案地圖 Taiwan AIDC Map

由 `sites.json`(單一事實來源)+ `gen.cjs`(產圖)驅動的靜態地圖,深色科技感為母檔、淺色為變體。

```bash
npm run map:gen    # sites.json → output/AIDC_map_{dark,light}.{svg,html}
npm run map:shot   # → output/AIDC_map_{dark,light}@2x.png (1840×1320)
```

- 規格書:[`SPEC.md`](SPEC.md)(v2,本 repo 為正本)
- 資料查核紀錄:[`DATA_AUDIT.md`](DATA_AUDIT.md)(每案來源、查核日、可信度)
- 字體:`assets/fonts/`(Noto Sans TC + IBM Plex Mono,OFL 授權)

更新資料 → 改 `sites.json` → 重跑上面兩行 → 目檢 PNG → 同步 `DATA_AUDIT.md`。

## Attribution

- Data: [Epoch AI](https://epoch.ai/data/ai-supercomputers), CC BY 4.0
- Basemap: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, © [CARTO](https://carto.com/attributions)
- 台灣縣市界:內政部,經 [taiwan-atlas](https://www.npmjs.com/package/taiwan-atlas)
