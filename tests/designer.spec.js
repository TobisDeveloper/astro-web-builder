import {test,expect} from '@playwright/test';
import {unzipSync,strFromU8} from 'fflate';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
async function start(page,template='Blank canvas'){
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');
 await page.getByTitle('Browse templates').click();
 await page.locator('.designer-template-card').filter({has:page.getByRole('heading',{name:template,exact:true})}).getByRole('button',{name:'Use template',exact:true}).click();
 await expect(page.getByLabel('Canvas layout')).toHaveValue(['Orbit','Form & Field','Blank canvas'].includes(template)?'freeform':'flow');
}
// Playwright's boundingBox does not scale child coordinates for transformed iframes.
async function visualBox(page,locator){
 const r=await locator.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}});
 const frame=await page.locator('iframe').evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width}});
 const scale=frame.width/1080;return {x:frame.x+r.x*scale,y:frame.y+r.y*scale,width:r.width*scale,height:r.height*scale,scale};
}
test('free canvas: real pointer drag, resize, inline edit, shortcuts, undo and persistence',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 const canvas=page.frameLocator('iframe');
 const heading=canvas.locator('[data-type="heading"]');await expect(heading).toBeVisible();
 const box=await visualBox(page,heading);const scale=box.scale;
 const originalX=Number(await page.getByLabel('Position X',{exact:true}).inputValue());
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60*scale,box.y+box.height/2+40*scale,{steps:12});await page.mouse.up();
 await expect.poll(async()=>Number(await page.getByLabel('Position X',{exact:true}).inputValue())).toBeGreaterThan(originalX+30);
 const draggedX=await page.getByLabel('Position X',{exact:true}).inputValue();
 await page.getByTitle('Undo',{exact:true}).click();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue(String(originalX));
 await page.getByTitle('Redo',{exact:true}).click();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue(draggedX);
 const initialWidth=Number(await page.getByLabel('Element width').inputValue());
 const handle=canvas.getByRole('button',{name:'Resize e',exact:true});const hb=await visualBox(page,handle);
 await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();await page.mouse.move(hb.x+hb.width/2+40*scale,hb.y+hb.height/2,{steps:8});await page.mouse.up();
 await expect.poll(async()=>Number(await page.getByLabel('Element width').inputValue())).toBeGreaterThan(initialWidth+20);
 const textBox=await visualBox(page,heading.getByRole('heading'));await page.mouse.dblclick(textBox.x+textBox.width/2,textBox.y+textBox.height/2);await expect(canvas.locator('[contenteditable]')).toBeFocused();
 await canvas.locator('[contenteditable]').fill('Designed on the canvas');await canvas.locator('[contenteditable]').press('Tab');
 await expect(page.getByLabel('Content',{exact:true})).toHaveValue('Designed on the canvas');
 await page.getByLabel('Font family',{exact:true}).selectOption('sans');await page.getByLabel('Font weight',{exact:true}).selectOption('700');await expect(heading.getByRole('heading')).toHaveCSS('font-weight','700');
 // Keyboard commands work when focus is inside the sandboxed canvas, too.
 const activeBox=await visualBox(page,heading.getByRole('heading'));await page.mouse.click(activeBox.x+activeBox.width/2,activeBox.y+activeBox.height/2);await page.keyboard.press('Control+d');await expect(canvas.locator('[data-type="heading"]')).toHaveCount(2);
 await page.keyboard.press('Delete');await expect(canvas.locator('[data-type="heading"]')).toHaveCount(1);
 await expect(page.locator('.saved')).toContainText('All changes saved');await page.reload();await expect(canvas.getByRole('heading',{name:'Designed on the canvas'})).toBeVisible();
 expect(errors).toEqual([]);
});
test('templates: real previews, filtering, mobile stacking and clean Astro export',async({page},testInfo)=>{
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');await page.getByTitle('Browse templates').click();
 await expect(page.locator('.designer-template-card')).toHaveCount(6);
 await page.getByRole('button',{name:'Landing page',exact:true}).click();await expect(page.locator('.designer-template-card')).toHaveCount(1);
 await page.getByTitle('Preview Orbit',{exact:true}).click();await expect(page.locator('.template-detail')).toContainText('Orbit');await page.getByTitle('Mobile template preview').click();
 await expect(page.locator('.template-large-wrapper')).toHaveClass(/mobile/);await page.getByRole('button',{name:'Use this template'}).click();
 const canvas=page.frameLocator('iframe');await expect(canvas.getByRole('heading',{name:'Big ideas. Less busywork.'})).toBeVisible();
 await page.getByRole('button',{name:'Mobile',exact:true}).click();await expect(canvas.locator('[data-type="heading"]').first()).toHaveCSS('position','relative');
 const metrics=await canvas.locator('body').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));expect(metrics.scroll).toBeLessThanOrEqual(metrics.width);
 await page.getByRole('button',{name:'Publish',exact:true}).click();const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Export Astro project'}).click();
 const download=await promise;const archive=unzipSync(new Uint8Array(await readFile(await download.path())));const source=strFromU8(archive['src/pages/index.astro']);expect(source).toContain('Big ideas.');expect(source).toContain('position:absolute');expect(source).toContain('max-width:600px');expect(source).not.toContain('forma-selection');expect(source).not.toContain('editorRuntime');
 const directory=testInfo.outputPath('orbit-export');for(const [name,data] of Object.entries(archive)){const path=join(directory,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,data)}
});
test('layers: visibility, locking and conversion between layout modes',async({page})=>{
 await page.goto('/');await expect(page.locator('.app')).toHaveAttribute('data-ready','true');
 await page.getByLabel('Canvas layout').selectOption('freeform');await expect(page.getByLabel('Position X',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Layers',exact:true}).click();const hero=page.locator('.layer').filter({hasText:'Hero section'});
 await hero.getByTitle('Lock layer',{exact:true}).click();await expect(page.frameLocator('iframe').locator('[data-node="hero"]')).toHaveAttribute('data-locked','true');
 await hero.getByTitle('Hide layer',{exact:true}).click();await expect(page.frameLocator('iframe').locator('[data-node="hero"]')).toBeHidden();
 await hero.getByTitle('Show layer',{exact:true}).click();await hero.getByTitle('Unlock layer',{exact:true}).click();await expect(page.frameLocator('iframe').locator('[data-node="hero"]')).toBeVisible();
 await page.getByLabel('Canvas layout').selectOption('flow');await expect(page.getByLabel('Position X',{exact:true})).toHaveCount(0);
});

test('designer tools: snapping guides, alignment, zoom and hand panning',async({page})=>{
 await start(page);const canvas=page.frameLocator('iframe');const heading=canvas.locator('[data-type="heading"]');
 const box=await visualBox(page,heading);const startX=box.x+box.width/2,startY=box.y+box.height/2;
 await page.mouse.move(startX,startY);await page.mouse.down();await page.mouse.move(startX+4*box.scale,startY+40*box.scale,{steps:10});
 await expect(canvas.locator('.forma-guide.vertical')).toBeVisible();await page.mouse.up();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('80');
 await page.getByTitle('Center element on artboard').click();await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('115');
 await page.getByTitle('Show layout grid').click();await expect(canvas.locator('.forma-page')).toHaveClass(/forma-grid/);
 await page.getByTitle('Zoom in',{exact:true}).click();await page.getByTitle('Zoom in',{exact:true}).click();
 const active=await visualBox(page,heading);await page.mouse.click(active.x+active.width/2,active.y+active.height/2);await page.keyboard.press('h');await expect(page.locator('.canvas-hand-layer')).toBeVisible();const area=await page.locator('.canvas-area').boundingBox();
 await page.mouse.move(area.x+area.width/2,area.y+210);await page.mouse.down();await page.mouse.move(area.x+area.width/2-90,area.y+150,{steps:10});await page.mouse.up();
 await expect.poll(()=>page.locator('.canvas-area').evaluate(e=>e.scrollLeft)).toBeGreaterThan(30);
 await page.getByTitle('Fit canvas',{exact:true}).click();await page.keyboard.press('v');await expect(page.locator('.canvas-hand-layer')).toHaveCount(0);
});
