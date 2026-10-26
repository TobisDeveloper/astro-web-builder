import {test,expect} from '@playwright/test';
import {unzipSync,strFromU8} from 'fflate';
import {join,dirname} from 'node:path';
test('visual editing, responsive preview, layers, undo and persistence',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await expect(page.locator('.brand')).toBeVisible();
 const canvas=page.frameLocator('iframe');await expect(canvas.getByRole('heading',{name:'Spaces for living. Designed for you.'})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('forma-desktop.png'),fullPage:true});
 const transfer=await page.frames().find(f=>f.parentFrame()).evaluateHandle(()=>new DataTransfer());
 await canvas.locator('[data-node="projects"]').dispatchEvent('dragstart',{dataTransfer:transfer});
 await canvas.locator('[data-node="intro"]').dispatchEvent('drop',{dataTransfer:transfer});
 await expect(canvas.locator('[data-node]').nth(2)).toHaveAttribute('data-node','projects');
 await page.getByRole('button',{name:'Heading',exact:true}).click();
 await expect(page.locator('.statusbar')).toContainText('5 elements');
 await page.getByLabel('Content',{exact:true}).fill('Made with Forma');
 await expect(canvas.getByRole('heading',{name:'Made with Forma'})).toBeVisible();
 await page.getByRole('button',{name:'Mobile',exact:true}).click();await expect(page.locator('iframe')).toHaveCSS('width','375px');
 await page.getByRole('button',{name:'Layers',exact:true}).click();await expect(page.locator('.layer')).toHaveCount(5);
 await page.locator('.layer').last().getByTitle('Move up').click();
 await expect(page.locator('.layer').nth(3)).toContainText('Heading');
 await page.getByTitle('Undo',{exact:true}).click();await expect(page.locator('.layer').last()).toContainText('Heading');
 await expect(page.locator('.saved')).toContainText('All changes saved');await page.reload();
 await expect(page.locator('.statusbar')).toContainText('5 elements');await expect(canvas.getByRole('heading',{name:'Made with Forma'})).toBeVisible();
 expect(errors).toEqual([]);
});
test('code editing, library connection and Astro archive export',async({page},testInfo)=>{
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Libraries',exact:true}).click();
 await page.locator('.library-item').first().getByRole('button').click();await expect(page.locator('.installed')).toContainText('GSAP');
 await expect.poll(()=>page.frames().find(f=>f.parentFrame())?.evaluate(()=>typeof window.gsap),{timeout:15000}).toBe('object');
 await page.getByRole('button',{name:'Try a GSAP animation'}).click();await expect(page.frameLocator('iframe').locator('#motion-card')).toBeVisible();
 await page.getByRole('button',{name:'Code',exact:true}).click();await page.getByLabel('Page source code').fill('<main><h1>A custom website</h1><p>Code meets canvas.</p></main>');
 await page.getByRole('button',{name:'Apply & preview'}).click();await expect(page.frameLocator('iframe').getByRole('heading',{name:'A custom website'})).toBeVisible();
 await page.getByRole('button',{name:'Publish',exact:true}).click();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export Astro project'}).click();const d=await downloadPromise;const fs=await import('node:fs/promises');const archive=unzipSync(new Uint8Array(await fs.readFile(await d.path())));
 expect(Object.keys(archive)).toContain('src/pages/index.astro');expect(strFromU8(archive['src/pages/index.astro'])).toContain('A custom website');expect(strFromU8(archive['src/pages/index.astro'])).toContain('GSAP 3.13.0');expect(Object.keys(archive)).toContain('public/llms.txt');
 const exportDir=testInfo.outputPath('astro-export');for(const [name,data] of Object.entries(archive)){const target=join(exportDir,name);await fs.mkdir(dirname(target),{recursive:true});await fs.writeFile(target,data)}
});
test('new projects, SEO and video controls',async({page})=>{
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Start with a template'}).click();await page.getByLabel('Project name',{exact:true}).fill('My next idea');await page.locator('.template-grid button').last().click();await expect(page.locator('.project-breadcrumb')).toContainText('My next idea');
 await page.getByRole('button',{name:'SEO',exact:true}).click();await page.getByLabel('Page title').fill('My next idea — Welcome');await expect(page.locator('.seo-preview')).toContainText('My next idea — Welcome');
 await page.getByRole('button',{name:'Add',exact:true}).click();await page.getByRole('button',{name:'Video',exact:true}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByLabel('Loop video')).toBeChecked();await expect.poll(()=>page.frameLocator('iframe').locator('video').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);await page.getByLabel('Loop video').uncheck();await expect(page.frameLocator('iframe').locator('video')).not.toHaveAttribute('loop','');
 await page.getByTitle('Your projects').click();await expect(page.locator('.project-list')).toContainText('My next idea');
});
