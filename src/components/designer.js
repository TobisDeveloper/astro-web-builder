// Exported layout rules are independent of the editor's interaction runtime.
export function layoutCSS(project) {
  const free = project.layout === 'freeform';
  return `.forma-page{position:relative;background:${project.canvasColor || '#faf9f6'};${free ? `height:${project.artboardHeight || 1200}px;overflow:hidden;` : 'min-height:400px;'}}
.node{box-sizing:border-box;${free ? 'position:absolute;left:var(--x,0%);top:var(--y,0px);width:var(--w,100%);height:var(--h,auto);' : 'position:relative;width:var(--w,100%);height:var(--h,auto);'}}
.node h1,.node h2,.node>p{font-weight:var(--font-weight,400)}.node[data-hidden="true"]{display:none}.node[style*="--h:"] .hero{min-height:0}.node> :first-child{max-width:100%;box-sizing:border-box;height:100%;}
${free ? '.node .hero{min-height:0}.node>h2,.node>p{margin:0}.node img,.node video{height:100%;object-fit:cover}.node .cta{margin-top:0}.node .intro{gap:24px}.node[data-type="shape"]>div{height:100%}' : ''}
@media(max-width:600px){.forma-page{height:auto!important;min-height:600px;overflow:hidden}.forma-page .node{position:relative!important;left:auto!important;top:auto!important;width:100%!important;height:auto!important;min-height:0!important}.forma-page .node[data-type="shape"]{display:none}.forma-page .node[data-type="hero"] .hero{min-height:520px}.forma-page .node[data-type="image"] img{height:300px}.forma-page .node[data-type="heading"] h2{font-size:40px!important}.forma-page .node[data-type="heading"],.forma-page .node[data-type="text"]{padding:12px 20px}.forma-page .node[data-type="button"]{padding:8px 20px 24px}.forma-page .node[data-type="custom"]{min-height:100px}}`;
}
export const designerCSS = `
.forma-page{touch-action:none}.forma-grid{background-image:linear-gradient(#8881 1px,transparent 1px),linear-gradient(90deg,#8881 1px,transparent 1px);background-size:8px 8px}
[data-node]{cursor:move;outline-offset:-1px}[data-node]:hover{outline:1px solid #9a8bea!important}[data-node][data-locked="true"]{cursor:not-allowed}.node.selected{outline:1px solid #8265ee!important}.node{animation:none!important}
#forma-selection{position:absolute;pointer-events:none;border:1.5px solid #8265ee;z-index:2147483640;box-sizing:border-box;color:#fff;user-select:none}
#forma-selection[hidden]{display:none}#forma-selection .handle{position:absolute;width:10px;height:10px;border:1.5px solid #8265ee;background:#fff;pointer-events:auto;padding:0;border-radius:1px;touch-action:none}
.handle[data-handle=nw]{left:-6px;top:-6px;cursor:nwse-resize}.handle[data-handle=ne]{right:-6px;top:-6px;cursor:nesw-resize}.handle[data-handle=sw]{left:-6px;bottom:-6px;cursor:nesw-resize}.handle[data-handle=se]{right:-6px;bottom:-6px;cursor:nwse-resize}.handle[data-handle=e]{right:-6px;top:calc(50% - 5px);cursor:ew-resize}.handle[data-handle=s]{bottom:-6px;left:calc(50% - 5px);cursor:ns-resize}
.selection-label{position:absolute;bottom:100%;left:-1px;background:#8265ee;padding:5px 8px;white-space:nowrap;font:11px Arial,sans-serif;border-radius:3px 3px 0 0}.selection-size{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#8265ee;padding:4px 7px;font:10px Arial,sans-serif;border-radius:3px;white-space:nowrap}
.forma-guide{position:absolute;z-index:2147483639;pointer-events:none;background:#f179bd}.forma-guide.vertical{width:1px;top:0;bottom:0}.forma-guide.horizontal{height:1px;left:0;right:0}.forma-drop-guide{position:absolute;left:0;right:0;height:3px;background:#8265ee;pointer-events:none;z-index:2147483639}.node.forma-dragging{opacity:.5;outline:2px dashed #8265ee!important}[contenteditable]{cursor:text!important;outline:2px solid #8265ee!important;user-select:text!important}
`;
// This function is serialized into the isolated iframe. Keep it self contained.
function editorRuntime(config) {
  const send = (data) => parent.postMessage(data, '*');
  const board = document.querySelector('.forma-page');
  const free = config.layout === 'freeform' && innerWidth > 600;
  const overlay = document.createElement('div');
  overlay.id = 'forma-selection';
  overlay.hidden = true;
  overlay.innerHTML = '<span class="selection-label"></span><span class="selection-size"></span>' + ['nw','ne','sw','se','e','s'].map(h=>'<button aria-label="Resize '+h+'" class="handle" data-handle="'+h+'"></button>').join('');
  document.body.append(overlay);
  let selected = null, operation = null, editing = null, suppressClick = false;
  const guides = [];
  function clearGuides() { guides.splice(0).forEach(g=>g.remove()); }
  function guide(axis,value) {const g=document.createElement('div');g.className='forma-guide '+(axis==='x'?'vertical':'horizontal');g.style[axis==='x'?'left':'top']=value+'px';board.append(g);guides.push(g);}
  function box(n) {const r=n.getBoundingClientRect(),b=board.getBoundingClientRect();return {x:r.left-b.left,y:r.top-b.top,width:r.width,height:r.height};}
  function displaySelection() {
    if(!selected||selected.dataset.hidden==='true'||!selected.isConnected){overlay.hidden=true;return;}
    const r=selected.getBoundingClientRect();overlay.hidden=false;
    Object.assign(overlay.style,{left:(r.left+scrollX)+'px',top:(r.top+scrollY)+'px',width:r.width+'px',height:r.height+'px'});
    overlay.querySelector('.selection-label').textContent=selected.dataset.label||'Element';
    overlay.querySelector('.selection-size').textContent=Math.round(r.width)+' × '+Math.round(r.height);
    overlay.querySelectorAll('.handle').forEach(h=>h.hidden=selected.dataset.locked==='true'||innerWidth<=600);
  }
  function select(n) { selected=n;document.querySelectorAll('[data-node]').forEach(x=>x.classList.toggle('selected',x===n));displaySelection(); }
  function snap(value,size,axis,id) {
    if(!config.snap)return value;
    const targets=axis==='x'?[0,board.clientWidth/2,board.clientWidth]:[0];
    document.querySelectorAll('[data-node]').forEach(n=>{if(n.dataset.node===id||n.dataset.hidden==='true')return;const r=box(n),p=axis==='x'?r.x:r.y,s=axis==='x'?r.width:r.height;targets.push(p,p+s/2,p+s);});
    let best=7,result=value,target;
    for(const edge of [0,size/2,size])for(const t of targets){const distance=Math.abs(value+edge-t);if(distance<best){best=distance;result=t-edge;target=t;}}
    if(target!==undefined)guide(axis,target);return result;
  }
  function start(e,n,handle) {
    if(e.button!==0||editing||n.dataset.locked==='true')return;
    e.preventDefault();select(n);send({type:'select-node',id:n.dataset.node});
    const r=box(n);operation={n,handle,startX:e.clientX,startY:e.clientY,original:r,current:{...r},moved:false,target:null};
    // Keep the original target for click/double-click semantics. Live movement never rerenders the iframe.
    e.target.setPointerCapture(e.pointerId);
  }
  document.addEventListener('pointerdown',e=>{
    const handle=e.target.closest('[data-handle]');if(handle&&selected){start(e,selected,handle.dataset.handle);return;}
    const n=e.target.closest('[data-node]');if(n&&!e.target.closest('[contenteditable]'))start(e,n,null);
  });
  document.addEventListener('pointermove',e=>{
    if(!operation)return;const o=operation,dx=e.clientX-o.startX,dy=e.clientY-o.startY;
    if(Math.hypot(dx,dy)<3&&!o.moved)return;o.moved=true;clearGuides();
    if(o.handle){
      let {x,y,width,height}=o.original;const h=o.handle;
      if(h.includes('e'))width+=dx;if(h.includes('s'))height+=dy;
      if(h.includes('w')){width-=dx;x+=dx;}if(h.includes('n')){height-=dy;y+=dy;}
      width=Math.max(48,Math.min(board.clientWidth,width));height=Math.max(32,height);
      x=Math.max(0,Math.min(board.clientWidth-width,x));y=Math.max(0,y);
      o.current={x,y,width,height};o.n.style.setProperty('--w',(width/board.clientWidth*100)+'%');o.n.style.setProperty('--h',height+'px');
      if(free){o.n.style.setProperty('--x',(x/board.clientWidth*100)+'%');o.n.style.setProperty('--y',y+'px');}
    } else if(free) {
      let x=o.original.x+dx,y=o.original.y+dy;
      if(e.shiftKey){if(Math.abs(dx)>Math.abs(dy))y=o.original.y;else x=o.original.x;}
      if(!e.altKey){x=snap(x,o.original.width,'x',o.n.dataset.node);y=snap(y,o.original.height,'y',o.n.dataset.node);}
      x=Math.max(0,Math.min(board.clientWidth-o.original.width,x));y=Math.max(0,Math.min(board.clientHeight-o.original.height,y));
      o.current={...o.original,x,y};o.n.style.setProperty('--x',(x/board.clientWidth*100)+'%');o.n.style.setProperty('--y',y+'px');
    } else {
      o.n.classList.add('forma-dragging');const nodes=[...board.querySelectorAll('[data-node]')].filter(n=>n!==o.n&&n.dataset.hidden!=='true');
      const target=nodes.find(n=>e.clientY<n.getBoundingClientRect().bottom)||nodes.at(-1);o.target=target;
      if(target){const g=document.createElement('div');g.className='forma-drop-guide';g.style.top=box(target).y+'px';board.append(g);guides.push(g);}
    }
    displaySelection();
  });
  function finish(cancelled=false) {
    if(!operation)return;const o=operation;operation=null;clearGuides();o.n.classList.remove('forma-dragging');
    if(cancelled){const r=o.original;o.n.style.setProperty('--x',r.x/board.clientWidth*100+'%');o.n.style.setProperty('--y',r.y+'px');o.n.style.setProperty('--w',r.width/board.clientWidth*100+'%');o.n.style.setProperty('--h',r.height+'px');displaySelection();return;}
    if(!o.moved)return;suppressClick=true;setTimeout(()=>suppressClick=false,100);
    if(free||o.handle){const r=o.current;const changes=o.handle?{width:Math.round(r.width/board.clientWidth*1080),height:Math.round(r.height)}:{};if(free){changes.x=Math.round(r.x/board.clientWidth*1080);changes.y=Math.round(r.y);}send({type:'transform-node',id:o.n.dataset.node,changes});}
    else if(o.target)send({type:'reorder-node',from:o.n.dataset.node,to:o.target.dataset.node});
  }
  document.addEventListener('pointerup',()=>finish());
  document.addEventListener('pointercancel',()=>finish(true));
  document.addEventListener('click',e=>{if(e.target.closest('[data-node]')&&!editing)e.preventDefault();if(suppressClick)e.stopPropagation();});
  document.addEventListener('dblclick',e=>{
    const n=e.target.closest('[data-node]'),t=e.target.closest('h1,h2,p,nav b');if(!n||!t||n.dataset.locked==='true'||n.dataset.type==='custom')return;
    finish(true);editing=t;t.setAttribute('contenteditable','plaintext-only');t.focus();const range=document.createRange();range.selectNodeContents(t);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
    t.addEventListener('blur',()=>{t.removeAttribute('contenteditable');editing=null;send({type:'edit-text',id:n.dataset.node,key:t.tagName==='P'&&['hero','section'].includes(n.dataset.type)?'subtitle':'text',value:t.innerText});},{once:true});
  });
  // Native DnD is retained for incoming blocks and layer-to-canvas drops.
  document.querySelectorAll('img,a').forEach(n=>n.draggable=false);
  document.addEventListener('dragstart',e=>{const n=e.target.closest('[data-node]');if(n)e.dataTransfer.setData('node-id',n.dataset.node);});
  document.addEventListener('dragover',e=>e.preventDefault());
  document.addEventListener('drop',e=>{e.preventDefault();const block=e.dataTransfer.getData('block'),n=e.target.closest('[data-node]'),from=e.dataTransfer.getData('node-id');if(block)send({type:'add-block',block,x:e.clientX,y:e.clientY});else if(n&&from)send({type:'reorder-node',from,to:n.dataset.node});});
  document.addEventListener('keydown',e=>{
    if(e.target.closest('input,textarea,[contenteditable]')){if(e.key==='Escape')e.target.blur();return;}
    if(e.key==='Escape'){finish(true);select(null);send({type:'select-node',id:null});return;}
    const mod=e.ctrlKey||e.metaKey;let command;
    if(mod&&e.key.toLowerCase()==='z')command=e.shiftKey?'redo':'undo';
    else if(mod&&e.key.toLowerCase()==='y')command='redo';
    else if(mod&&e.key.toLowerCase()==='d')command='duplicate';
    else if(e.key==='Delete'||e.key==='Backspace')command='delete';
    else if(e.key.startsWith('Arrow'))command=e.key;
    else if(e.key.toLowerCase()==='h')command='hand-tool';
    else if(e.key.toLowerCase()==='v')command='select-tool';
    if(command){e.preventDefault();send({type:'designer-command',command,shift:e.shiftKey});}
  });
  window.addEventListener('message',e=>{
    if(e.source!==parent)return;
    if(e.data.type==='select')select(document.querySelector('[data-node="'+CSS.escape(e.data.id||'')+'"]'));
    if(e.data.type==='capture-layout')send({type:'captured-layout',height:board.getBoundingClientRect().height,nodes:[...board.querySelectorAll('[data-node]')].map(n=>({id:n.dataset.node,...box(n)}))});
    if(e.data.type==='align-node'&&selected&&selected.dataset.locked!=='true'){
      const r=box(selected),alignment=e.data.alignment;
      const x=alignment==='left'?0:alignment==='right'?board.clientWidth-r.width:(board.clientWidth-r.width)/2;
      send({type:'transform-node',id:selected.dataset.node,changes:{x:Math.round(x/board.clientWidth*1080)}});
    }
  });
  const observer=new ResizeObserver(()=>{if(!operation)displaySelection();});observer.observe(board);
  window.addEventListener('resize',displaySelection);
  board.classList.toggle('forma-grid',!!config.grid);
}
export function designerScript(options) { return `(${editorRuntime.toString()})(${JSON.stringify(options)});`; }
