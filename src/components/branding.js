export function cssFontName(font) { return 'forma-font-' + String(font.id).replace(/[^a-zA-Z0-9-]/g,''); }
const cssString = value => JSON.stringify(String(value)).replaceAll('<','\\3c ').replaceAll('>','\\3e ');
export function validFontSource(src) {
  if (typeof src !== 'string') return false;
  return /^https:\/\//i.test(src) || /^data:(font\/(woff2?|ttf|otf)|application\/(font-woff|x-font-ttf|x-font-opentype|octet-stream));base64,[A-Za-z0-9+/=]+$/.test(src);
}
export function fontFacesCSS(project) {
  return (project.fonts||[]).filter(f=>f.id&&validFontSource(f.src)).map(f=>`@font-face{font-family:${cssString(cssFontName(f))};src:url(${cssString(f.src)}) format(${cssString(['woff2','woff','truetype','opentype'].includes(f.format)?f.format:'woff2')});font-weight:${['100 900','400','500','600','700','800','900','300','200','100'].includes(String(f.weight))?f.weight:'400'};font-style:${f.style==='italic'?'italic':'normal'};font-display:swap}`).join('\n');
}
export function familyCSS(value,project) {
  if(value?.startsWith('font:')){const font=(project.fonts||[]).find(f=>f.id===value.slice(5));if(font)return `${cssFontName(font)},Arial,sans-serif`;}
  return value==='serif'?'Georgia,serif':'Arial,sans-serif';
}
export function elementFontCSS(node,project={}) {
  const heading=['hero','heading','section','gallery'].includes(node.type);
  return familyCSS(node.fontFamily||project.branding?.[heading?'headingFont':'bodyFont']||(heading?'serif':'sans'),project);
}
export function brandingCSS(project) {
  const b=project.branding||{};
  let css=fontFacesCSS(project)+`.site-brand{display:flex;align-items:center;gap:12px}.site-brand img{height:30px;max-width:140px;object-fit:contain}.brand-footer{padding:28px 36px;display:flex;justify-content:space-between;gap:20px;font:12px ${familyCSS(b.bodyFont||'sans',project)};background:${/^#[0-9a-f]{6}$/i.test(b.surfaceColor||'')?b.surfaceColor:'#faf9f6'};color:#7c8274}`;
  if(b.bodyFont)css+=`body,nav,.hero p,.intro p,.gallery figcaption,.cta{font-family:${familyCSS(b.bodyFont,project)}}`;
  if(/^#[0-9a-f]{6}$/i.test(b.primaryColor||''))css+=`.cta{background:${b.primaryColor};color:${b.buttonTextColor||'#ffffff'}}.intro a{border-color:${b.primaryColor}}`;
  return css;
}
export async function readDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});}
export async function importFont(file,{family,weight='400',style='normal'}){
  if(!file||file.size>2*1024*1024)throw new Error('Choose a font file smaller than 2 MB. WOFF2 is recommended.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const signature=String.fromCharCode(...bytes.slice(0,4));
  const format=signature==='wOF2'?'woff2':signature==='wOFF'?'woff':signature==='OTTO'?'opentype':bytes[0]===0&&bytes[1]===1&&bytes[2]===0&&bytes[3]===0?'truetype':null;
  if(!format)throw new Error('This is not a supported WOFF2, WOFF, TTF, or OTF font.');
  const mime={woff2:'font/woff2',woff:'font/woff',truetype:'font/ttf',opentype:'font/otf'}[format];
  const original=await readDataURL(file);const font={id:crypto.randomUUID(),family:(family.trim()||file.name.replace(/\.[^.]+$/,'')).slice(0,80),src:`data:${mime};base64,${original.split(',')[1]}`,format,weight,style};
  await new FontFace(cssFontName(font),`url("${font.src}")`,{weight,style}).load();
  return font;
}
