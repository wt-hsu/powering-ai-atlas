// PNG @2x 輸出:node shot.js [dark|light|all]
const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const which = process.argv[2] || 'all';
  const themes = which === 'all' ? ['dark', 'light'] : [which];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 920, height: 660 }, deviceScaleFactor: 2 });
  for (const t of themes) {
    await page.goto('file://' + path.join(__dirname, 'output', `AIDC_map_${t}.html`));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(__dirname, 'output', `AIDC_map_${t}@2x.png`) });
    console.log(`產出 output/AIDC_map_${t}@2x.png (1840×1320)`);
  }
  await browser.close();
})();
