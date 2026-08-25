# powering-ai-atlas

An open, source-linked atlas of global AI infrastructure projects.

## 台灣 AIDC 開發案地圖 Taiwan AI Data Center Map

由 `sites.json`(資料)+ `gen.js`(產圖)驅動的台灣 AI 資料中心開發案地圖,深色科技感為母檔、淺色為變體。

```bash
npm install
node gen.js    # sites.json → output/AIDC_map_{dark,light}.{svg,html}
node shot.js   # → output/AIDC_map_{dark,light}@2x.png (1840×1320)
```

- 規格書:[`SPEC.md`](SPEC.md)(v2,本 repo 為正本)
- 資料查核紀錄:[`DATA_AUDIT.md`](DATA_AUDIT.md)(每案來源、查核日、可信度)
- 字體:`assets/fonts/`(Noto Sans TC + IBM Plex Mono,OFL 授權)

更新資料 → 改 `sites.json` → 重跑上面兩行 → 目檢 PNG → 同步 `DATA_AUDIT.md`。
