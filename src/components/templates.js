import {initialProject} from './model';
import {photo,darkPhoto,lightPhoto} from './media';
const base=(type,text,extra={})=>({id:crypto.randomUUID(),type,label:({heading:'Heading',text:'Paragraph',button:'Button',image:'Image',navigation:'Navigation',shape:'Shape',section:'About',custom:'Feature cards'})[type]||'Section',text,color:'#252923',background:'#faf9f6',padding:24,fontSize:36,radius:0,animation:'None',...extra});
const positioned=(type,text,x,y,width,height,extra={})=>base(type,text,{x,y,width,height,...extra});
export const templates=[
 {id:'studio',name:'Studio North',category:'Business',description:'A warm, editorial home for an interior studio.',color:'#ded8c9',tag:'Auto layout'},
 {id:'orbit',name:'Orbit',category:'Landing page',description:'A bold product launch, with room to make it yours.',color:'#e8e1ff',tag:'Free canvas'},
 {id:'portfolio',name:'Form & Field',category:'Portfolio',description:'A personal portfolio with a confident point of view.',color:'#f3e9dd',tag:'Free canvas'},
 {id:'cafe',name:'Sunday Club',category:'Business',description:'A welcoming place for a café, restaurant, or local business.',color:'#e9e7d7',tag:'Auto layout'},
 {id:'architecture',name:'Atelier',category:'Portfolio',description:'Space, material, and thoughtful architectural work.',color:'#dededc',tag:'Auto layout'},
 {id:'blank',name:'Blank canvas',category:'Blank',description:'An open artboard. Every possibility is yours.',color:'#f5f3ff',tag:'Free canvas'},
];
export function createTemplate(id,name){
 const p=initialProject();p.name=name?.trim()||templates.find(t=>t.id===id)?.name||'Untitled project';p.customCode=null;p.layout='flow';p.canvasColor='#faf9f6';
 if(id==='orbit'){
  p.layout='freeform';p.artboardHeight=1330;p.canvasColor='#f7f5ff';
  p.nodes=[
   positioned('navigation','orbit.',0,0,1080,80,{background:'#f7f5ff',padding:28,color:'#302347'}),
   positioned('shape','Lavender backdrop',600,130,420,550,{background:'#e4dbff',radius:200}),
   positioned('text','THE NEXT CHAPTER OF YOUR WORK',52,150,540,55,{fontSize:12,color:'#7653be',background:'#f7f5ff',padding:8}),
   positioned('heading','Big ideas.\nLess busywork.',52,222,570,230,{fontSize:76,fontFamily:'sans',background:'#f7f5ff',padding:8,color:'#302347'}),
   positioned('text','A calmer workspace for ambitious teams. Bring your projects, people, and possibilities into one beautiful place.',52,465,510,110,{fontSize:18,padding:8,background:'#f7f5ff',color:'#76668e'}),
   positioned('button','Find your focus',52,595,255,92,{fontSize:15,padding:8,background:'#f7f5ff',href:'#features'}),
   positioned('custom','Product preview',640,245,350,380,{padding:22,radius:18,background:'#fff',html:'<div style="font:14px Arial;color:#503e76"><div style="display:flex;justify-content:space-between;border-bottom:1px solid #ede8f5;padding-bottom:20px"><b>Your space, in sync.</b><span>✦</span></div><p style="margin:22px 0 10px">THIS WEEK</p><h2 style="font:38px Arial">Make good things.</h2><div style="padding:16px;background:#eae2ff;border-radius:9px;margin:12px 0">● Brand launch <small style="float:right">In progress</small></div><div style="padding:16px;background:#f4f2f9;border-radius:9px;margin:12px 0">○ A new direction</div><div style="padding:16px;background:#f4f2f9;border-radius:9px">○ Room to grow</div></div>'}),
   positioned('heading','Built for your next big thing.',52,840,976,100,{fontSize:44,fontFamily:'sans',padding:8,background:'#f7f5ff'}),
   ...['Everything in one place','Find your flow','Grow together'].map((t,i)=>positioned('custom',t,52+i*330,985,310,245,{background:'#fff',radius:16,padding:28,html:`<div id="${i===0?'features':'feature-'+i}" style="color:#7962a0;font:12px Arial">0${i+1} / LESS FRICTION</div><h2 style="font:25px Arial;margin:24px 0 18px">${t}</h2><p>Thoughtful tools that make every day a little clearer. Simple, flexible, and built around you.</p>`})),
  ];
 }
 if(id==='portfolio'){
  p.layout='freeform';p.artboardHeight=1420;p.canvasColor='#f4eee6';
  p.nodes=[positioned('navigation','FORM & FIELD',0,0,1080,90,{background:'#f4eee6'}),positioned('text','INDEPENDENT DESIGNER / COPENHAGEN',50,160,620,55,{background:'#f4eee6',fontSize:12,padding:8}),positioned('heading','A little curious.\nAlways creating.',50,235,900,240,{fontSize:86,padding:8,background:'#f4eee6'}),positioned('image','A study in quiet details',610,565,410,550,{src:darkPhoto,padding:0,radius:8}),positioned('heading','Objects. Spaces.\nNew perspectives.',50,625,510,160,{fontSize:48,padding:8,background:'#f4eee6'}),positioned('text','I’m Alex, a multidisciplinary designer working at the intersection of the everyday and the unexpected. Here’s a little of what I’ve been making.',50,815,470,145,{fontSize:17,padding:8,background:'#f4eee6'}),positioned('button','Let’s make something',50,1000,300,85,{href:'mailto:hello@example.com',padding:8,background:'#f4eee6'}),positioned('text','AVAILABLE FOR SELECT PROJECTS · 2026',50,1240,900,70,{fontSize:12,padding:8,background:'#f4eee6'})];
 }
 if(id==='cafe'){
  p.canvasColor='#f3f0e3';p.nodes[0].text='SUNDAY CLUB';p.nodes[0].background='#f3f0e3';p.nodes[1]={...p.nodes[1],text:'Slow mornings.\nGood company.',subtitle:'Your neighborhood spot for coffee, conversation,\nand a little something delicious.',button:'Come on in',eyebrow:'YOUR DAILY DOSE OF SOMETHING GOOD',location:'OPEN EVERY DAY · 8AM—5PM',fontSize:70};p.nodes[2]={...p.nodes[2],text:'Stay a little\nlonger.',subtitle:'Good coffee is only the beginning. We’re a gathering place for the neighborhood, with seasonal plates, fresh bakes, and a seat with your name on it.',background:'#f3f0e3'};p.nodes[3]={...p.nodes[3],text:'A few of our favorite corners.',background:'#e7eadc'};
 }
 if(id==='architecture'){
  p.canvasColor='#efefec';p.nodes=[base('navigation','ATELIER / 01',{background:'#efefec'}),base('section','Spaces shaped\nby possibility.',{fontSize:65,padding:60,subtitle:'An architecture and design practice exploring how we live. Honest materials, considered details, and an enduring sense of place.',background:'#efefec'}),base('image','Light, form, and a slower way to live.',{src:lightPhoto,padding:0}),{...p.nodes[3],text:'Selected spaces, considered details.',background:'#e4e5e1'},base('section','Let’s build\nsomething lasting.',{subtitle:'Have a project in mind? We would love to hear your story. From homes to workspaces, every project starts with a conversation.',background:'#efefec',padding:60,fontSize:52})];
 }
 if(id==='blank'){
  p.layout='freeform';p.artboardHeight=1000;p.canvasColor='#ffffff';p.nodes=[positioned('heading','Make something\nthat matters.',80,160,850,220,{fontSize:78,padding:8,background:'#ffffff'}),positioned('text','This is your space. Drag, resize, and explore.',80,435,720,90,{fontSize:20,padding:8,background:'#ffffff'}),positioned('button','Start your next chapter',80,575,350,90,{padding:8,background:'#ffffff'})];
 }
 p.seo={...p.seo,title:p.name+' — '+(p.nodes.find(n=>n.type==='heading'||n.type==='hero')?.text||'Welcome').replaceAll('\n',' '),description:templates.find(t=>t.id===id)?.description||p.seo.description};
 return p;
}
