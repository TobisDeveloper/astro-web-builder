const { _electron: electron } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
(async () => {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'forma-desktop-test-'));
  const executablePath = process.env.FORMA_DESKTOP_EXECUTABLE ? path.resolve(process.env.FORMA_DESKTOP_EXECUTABLE) : undefined;
  const args = executablePath ? [] : [process.env.FORMA_DESKTOP_APP_PATH ? path.resolve(process.env.FORMA_DESKTOP_APP_PATH) : path.join(__dirname, 'main.cjs')];
  if (process.platform === 'linux') args.unshift('--no-sandbox'); // CI container only; not shipped in the app.
  if (process.env.FORMA_ELECTRON_HEADLESS === '1') args.unshift('--ozone-platform=headless');
  let app;
  try {
    app = await electron.launch({ executablePath, args, env: { ...process.env, FORMA_TEST_USER_DATA: profile }, timeout: 60_000 });
    const page = await app.firstWindow();
    const errors = [];page.on('pageerror', error => errors.push(error.message));
    await page.locator('.app[data-ready="true"]').waitFor();
    assert.equal(page.url(), 'forma://app/');
    assert.equal(await page.evaluate(() => typeof require), 'undefined');
    assert.equal(await page.evaluate(() => typeof process), 'undefined');
    const preferences = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
    assert.equal(preferences.nodeIntegration, false);
    assert.equal(preferences.contextIsolation, true);
    assert.equal(preferences.sandbox, true);
    await page.frameLocator('iframe').getByRole('heading', { name: 'Spaces for living. Designed for you.' }).waitFor();
    // Bundled media must work without a development server or external host.
    assert.equal(await page.evaluate(async () => (await fetch('/media/flower.webm')).status), 200);
    assert.equal(await page.evaluate(async () => (await fetch('/missing-file')).status), 404);
    assert.equal(await page.evaluate(async () => (await fetch('/%2e%2e/package.json')).status), 404);
    await page.getByRole('button', { name: 'Brand', exact: true }).click();
    await page.getByLabel('Brand name', { exact: true }).fill('Desktop Studio');
    await page.getByLabel('Custom font name').fill('Desktop Type');
    await page.getByLabel('Upload custom font').setInputFiles(path.join(__dirname, '..', 'node_modules', '@fontsource', 'dm-sans', 'files', 'dm-sans-latin-400-normal.woff2'));
    await page.locator('.custom-font-card').waitFor();
    await page.getByRole('button', { name: 'Use on selection' }).click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('forma-projects') || '[]')[0]?.fonts?.length === 1);
    assert.match(await page.frameLocator('iframe').locator('h1').evaluate(e=>getComputedStyle(e).fontFamily), /forma-font-/);
    await page.getByLabel('Use my name, logo & color in the editor').check();
    await page.waitForFunction(() => document.title.startsWith('Desktop Studio'));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('forma-projects') || '[]')[0]?.branding?.brandEditor === true);
    await page.reload();
    await page.locator('.app[data-ready="true"]').waitFor();
    assert.match(await page.locator('.brand').innerText(), /Desktop Studio/);
    const destination = path.join(profile, 'desktop-export.zip');
    await app.evaluate(({ session }, file) => { session.defaultSession.once('will-download', (_event, item) => item.setSavePath(file)); }, destination);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Export Astro project' }).click();
    const { unzipSync, strFromU8 } = require('fflate');
    let exported = false;
    for (let i = 0; i < 60 && !exported; i++) {
      try { const archive = unzipSync(await fs.readFile(destination));assert.match(strFromU8(archive['src/pages/index.astro']), /data:font\/woff2;base64/);exported = true; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.ok(exported, 'Native export must save a ZIP with the custom font.');
    assert.equal(errors.length, 0, errors.join('\n'));
    await app.close();app = null;
    app = await electron.launch({ executablePath, args, env: { ...process.env, FORMA_TEST_USER_DATA: profile }, timeout: 60_000 });
    const reopened = await app.firstWindow();await reopened.locator('.app[data-ready="true"]').waitFor();
    assert.match(await reopened.locator('.brand').innerText(), /Desktop Studio/);
    assert.match(await reopened.frameLocator('iframe').locator('h1').evaluate(e=>getComputedStyle(e).fontFamily), /forma-font-/);
    console.log('Desktop smoke passed: secure renderer, packaged assets, custom fonts, branding, native ZIP export and persistence across restart.');
  } finally {
    if (app) await app.close();
    await fs.rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
