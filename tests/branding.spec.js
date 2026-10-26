import {test,expect} from '@playwright/test';
import {unzipSync,strFromU8} from 'fflate';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
const fontPath=join(process.cwd(),'node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2');
const logo={name:'studio-logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="12" fill="#3366ee"/><path d="M20 60V20l20 22 20-22v40" stroke="white" stroke-width="6" fill="none"/></svg>')};
async function openBrand(page){await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Brand',exact:true}).click();}
test('custom font and brand kit render, persist and travel in Astro exports',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await openBrand(page);
 await page.getByLabel('Brand name',{exact:true}).fill('Meridian Studio');await page.getByLabel('Brand tagline').fill('Thoughtful websites, made yours.');
 await page.getByLabel('Upload brand logo',{exact:true}).setInputFiles(logo);await page.getByLabel('Upload brand favicon').setInputFiles(logo);
 await page.getByLabel('Custom font name').fill('Studio Type');await page.getByLabel('Upload custom font').setInputFiles(fontPath);
 await expect(page.locator('.custom-font-card')).toContainText('Studio Type');
 await page.getByRole('button',{name:'Use on selection'}).click();
 const canvas=page.frameLocator('iframe');await expect(canvas.locator('h1')).toHaveCSS('font-family',/forma-font-/);
 await expect.poll(()=>page.frames().find(f=>f.parentFrame())?.evaluate(async()=>{await document.fonts.ready;return [...document.fonts].some(f=>f.family.includes('forma-font-')&&f.status==='loaded')})).toBe(true);
 const fontValue=await page.getByLabel('Brand heading font').getByRole('option',{name:'Studio Type · 400'}).getAttribute('value');
 await page.getByLabel('Brand heading font').selectOption(fontValue);await page.getByLabel('Brand body font').selectOption(fontValue);
 await page.getByRole('button',{name:'Apply brand styles across page'}).click();
 await page.getByLabel('Show a branded page footer').check();await page.getByLabel('Use my name, logo & color in the editor').check();
 await expect(page.locator('.brand')).toContainText('Meridian Studio');await expect(page).toHaveTitle('Meridian Studio — Website Builder');
 await expect(canvas.locator('.site-brand')).toContainText('Meridian Studio');await expect(canvas.locator('.site-brand img')).toHaveAttribute('src',/^data:image\/svg\+xml;base64,/);
 await expect(canvas.locator('.brand-footer')).toContainText('Thoughtful websites, made yours.');
 await expect(canvas.locator('link[rel=icon]')).toHaveAttribute('href',/^data:image/);
 await expect(canvas.locator('h1')).toHaveCSS('font-family',/forma-font-/);
 await expect(page.locator('.saved')).toContainText('All changes saved');await page.reload();await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await expect(page.locator('.brand')).toContainText('Meridian Studio');await expect(canvas.locator('h1')).toHaveCSS('font-family',/forma-font-/);
 await page.getByRole('button',{name:'Publish',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export Astro project'}).click();const download=await pending;
 const archive=unzipSync(new Uint8Array(await readFile(await download.path())));const source=strFromU8(archive['src/pages/index.astro']);expect(source).toContain('@font-face');expect(source).toContain('data:font/woff2;base64,');expect(source).toContain('Meridian Studio');expect(source).toContain('rel="icon"');expect(source).toContain('.cta{background:#e98263');expect(source).not.toContain('forma-selection');
 const directory=testInfo.outputPath('branded-export');for(const [name,data] of Object.entries(archive)){const file=join(directory,name);await mkdir(dirname(file),{recursive:true});await writeFile(file,data)}
 expect(errors).toEqual([]);
});
test('invalid fonts are rejected and removing a font restores brand fallbacks',async({page})=>{
 await openBrand(page);await page.getByLabel('Upload custom font').setInputFiles({name:'broken.woff2',mimeType:'font/woff2',buffer:Buffer.from('not a font')});
 await expect(page.locator('.toast')).toContainText('not a supported');await expect(page.locator('.custom-font-card')).toHaveCount(0);
 await page.getByLabel('Custom font name').fill('Temporary Font');await page.getByLabel('Upload custom font').setInputFiles(fontPath);await expect(page.locator('.custom-font-card')).toHaveCount(1);await page.getByRole('button',{name:'Use on selection'}).click();
 await expect(page.frameLocator('iframe').locator('h1')).toHaveCSS('font-family',/forma-font-/);await page.getByTitle('Remove font Temporary Font').click();await expect(page.locator('.custom-font-card')).toHaveCount(0);await expect(page.frameLocator('iframe').locator('h1')).toHaveCSS('font-family',/Georgia/);
});
