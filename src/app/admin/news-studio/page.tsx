'use client';
import {useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
type Format='square'|'portrait'|'landscape'|'wide'|'story'|'custom';
type Skin='forest'|'ink'|'ivory'|'navy'|'olive'|'stone'|'rose'|'charcoal'|'midnight'|'burgundy'|'cobalt'|'teal'|'sand'|'white'|'slate'|'plum'|'emerald'|'terracotta'|'custom';
type Mode='news'|'urgent'|'statement'|'quote';
type Align='right'|'center';
type Weight=300|400|500|700;
type PhotoPosition='left'|'right'|'top'|'background';
type PhotoFit='cover'|'contain';
type PhotoShape='square'|'rounded'|'circle'|'oval'|'hexagon'|'angled'|'mixed'|'fade';
type SourcePlacement='before-summary'|'after-summary';
type PhotoCreditPlacement='inside'|'below';
type FontChoice='tajarib'|'sans';
type LogoVariant='color'|'dark'|'light';
type HeadlineRow={text:string;left:number;right:number;y:number};
type PhotoRect={x:number;y:number;w:number;h:number};
type StudioElementId='headline'|'summary'|'photo';
type StudioElement={id:StudioElementId;label:string;x:number;y:number;width:number;height:number};
type ResizeHandle='nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w';
type StudioGesture={id:StudioElementId;mode:'move'|'resize';handle?:ResizeHandle;startX:number;startY:number;element:StudioElement;headlineDX:number;headlineDY:number;summaryDX:number;summaryDY:number;imageDX:number;imageDY:number;titleScale:number;summarySize:number;photoFrameWidth:number;photoFrameHeight:number};
type StudioPreset={name:string;mode:Mode;format:Format;customWidth?:number;customHeight?:number;titleSize?:number;bodyWeight?:300|400;textWeight?:Weight;align?:Align;underline?:boolean;vertical?:'top'|'center'|'bottom';skin:Skin;customBg?:string;customFg?:string;customAccent?:string;customDim?:string;marginLeft?:number;marginRight?:number;photoZoom?:number;photoPanX?:number;photoPanY?:number;photoFrameWidth?:number;photoFrameHeight?:number;headlineFont?:FontChoice;summaryFont?:FontChoice;metaFont?:FontChoice;logoVariant?:LogoVariant;photoPosition:PhotoPosition;photoFit:PhotoFit;imageShape:PhotoShape;photoScale:number;imageRadius:number;imageBorder:number;photoOpacity:number;titleScale:number;textSize:number;lineSpacing:number;summaryLineSpacing:number;detailSpacing:number;headlineInset:number;headlineDX:number;headlineDY:number;summarySize:number;summaryInset:number;summaryDX:number;summaryDY:number;imageInset:number;imageDX:number;imageDY:number;sourcePlacement:SourcePlacement;sourceDX:number;sourceDY:number;wrapHeadline:boolean;showWeekday:boolean;showPath:boolean;sideMargin:number;topPadding:number;bottomPadding:number};
type NewsGeometry={rows:HeadlineRow[];photo:PhotoRect|null;summaryLines:string[];summaryY:number;summaryRight:number;summaryWidth:number;summaryFont:number;summaryLineHeight:number;source:string;sourceY:number|null;sourceRight:number;locationText:string;locationY:number|null;creditBelowY:number|null;continuationTitle?:string};
type Page={lines:string[];news?:NewsGeometry};
type KnowledgePath={dossier:string;issue:string;event:string};
const sizes:Record<Format,{w:number;h:number;label:string}>={square:{w:1080,h:1080,label:'مربع 1080 × 1080'},portrait:{w:1080,h:1350,label:'عمودي 1080 × 1350'},landscape:{w:1200,h:675,label:'أفقي 1200 × 675'},wide:{w:1600,h:900,label:'عريض 1600 × 900'},story:{w:1080,h:1920,label:'ستوري 1080 × 1920'},custom:{w:1080,h:1350,label:'مقاس مخصص'}};
const skins:Record<Skin,{bg:string,fg:string,accent:string,dim:string}>={forest:{bg:'#092d28',fg:'#fffefa',accent:'#d6ee91',dim:'#d3e3dc'},ink:{bg:'#182730',fg:'#ffffff',accent:'#e8b5a8',dim:'#cbd4d8'},ivory:{bg:'#faf9f3',fg:'#183833',accent:'#396a53',dim:'#526860'},navy:{bg:'#142a42',fg:'#fffdf6',accent:'#b7d3ee',dim:'#cdd9e3'},olive:{bg:'#333d27',fg:'#fffefa',accent:'#d8dd9b',dim:'#e2e4d0'},stone:{bg:'#eeeae1',fg:'#29322c',accent:'#758778',dim:'#505d52'},rose:{bg:'#f6e9e4',fg:'#412e33',accent:'#a85b6d',dim:'#775c63'},charcoal:{bg:'#202326',fg:'#f7f7f2',accent:'#f2c879',dim:'#c4c8c6'},midnight:{bg:'#101b2d',fg:'#f5f7fb',accent:'#79b8d8',dim:'#c0ccd8'},burgundy:{bg:'#421f2b',fg:'#fff8f4',accent:'#e8a6a6',dim:'#dfc9ca'},cobalt:{bg:'#183b78',fg:'#ffffff',accent:'#f6d365',dim:'#d5e1f6'},teal:{bg:'#073f43',fg:'#f4ffff',accent:'#82d8c6',dim:'#c2e5df'},sand:{bg:'#e9dfcb',fg:'#342d25',accent:'#9c6b3f',dim:'#6e6253'},white:{bg:'#ffffff',fg:'#1e2c2a',accent:'#2f765e',dim:'#65736e'},slate:{bg:'#dce2e6',fg:'#26323a',accent:'#587b91',dim:'#53616a'},plum:{bg:'#34213f',fg:'#fff9ff',accent:'#d8b4ec',dim:'#d6c9dc'},emerald:{bg:'#064b3b',fg:'#f5fff9',accent:'#a7efc1',dim:'#c5e6d3'},terracotta:{bg:'#a94f38',fg:'#fff9f1',accent:'#f7d7a8',dim:'#f0d9c8'},custom:{bg:'#092d28',fg:'#fffefa',accent:'#d6ee91',dim:'#d3e3dc'}};
const modes:Record<Mode,string>={news:'خبر',urgent:'عاجل',statement:'بيان رسمي',quote:'تصريح / اقتباس'};
type Config={mode:Mode;format:Format;customWidth:number;customHeight:number;customBg:string;customFg:string;customAccent:string;customDim:string;marginLeft:number;marginRight:number;photoZoom:number;photoPanX:number;photoPanY:number;photoFrameWidth:number;photoFrameHeight:number;headlineFont:FontChoice;summaryFont:FontChoice;metaFont:FontChoice;logoVariant:LogoVariant;topPadding:number;bottomPadding:number;detailSpacing:number;summaryLineSpacing:number;skin:Skin;title:string;body:string;issuer:string;date:string;logo:HTMLImageElement|null;issuerLogo:HTMLImageElement|null;path:KnowledgePath;bodyWeight:300|400;titleSize:number;showPath:boolean;sourceUrl:string;sourceName:string;showSource:boolean;textSize:number;textWeight:Weight;align:Align;underline:boolean;sideMargin:number;lineSpacing:number;vertical:'top'|'center'|'bottom';summary:string;location:string;showLocation:boolean;quoteName:string;quoteRole:string;personImage:HTMLImageElement|null;mapImage:HTMLImageElement|null;newsImage:HTMLImageElement|null;photoPosition:PhotoPosition;photoFit:PhotoFit;photoScale:number;photoOpacity:number;photoRounded:boolean;titleScale:number;hidePathOnBackground:boolean;showWeekday:boolean;sourcePlacement:SourcePlacement;sourcePrefix:string;headlineDX:number;headlineDY:number;headlineInset:number;summaryDX:number;summaryDY:number;summaryInset:number;summarySize:number;sourceDX:number;sourceDY:number;imageDX:number;imageDY:number;imageInset:number;imageShape:PhotoShape;imageRadius:number;imageBorder:number;imageCredit:string;showImageCredit:boolean;imageCreditPlacement:PhotoCreditPlacement;wrapHeadline:boolean};
function dimensions(cfg:Config){return cfg.format==='custom'?{w:cfg.customWidth,h:cfg.customHeight}:sizes[cfg.format]}
function fontStack(choice:FontChoice){return choice==='tajarib'?'"Tajarib Taweel",sans-serif':'"Thmanyah Sans",sans-serif'}
const serif='"Tajarib Taweel",sans-serif';
const sans='"Thmanyah Sans",sans-serif';
function toLines(ctx:CanvasRenderingContext2D,text:string,maxWidth:number):string[]{
 const output:string[]=[];
 for(const paragraph of text.replace(/\r/g,'').split('\n')){
  if(!paragraph.trim()){output.push('');continue}
  let line='';
  for(const word of paragraph.trim().split(/\s+/)){
   const candidate=line?line+' '+word:word;
   if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue}
   if(line)output.push(line);
   line='';
   for(const ch of Array.from(word)){
    if(ctx.measureText(line+ch).width>maxWidth&&line){output.push(line);line=ch}else line+=ch;
   }
  }
  if(line)output.push(line);
 }
 return output;
}
function plan(cfg:Config,ctx:CanvasRenderingContext2D):{pages:Page[];font:number;lineHeight:number;error:string;top:number;heading:string[];taxonomy:string[]}{
 const {w,h}=dimensions(cfg);const statement=cfg.mode==='statement';const margin=cfg.sideMargin;const width=w-margin*2-cfg.marginLeft-cfg.marginRight;const empty={pages:[] as Page[],font:0,lineHeight:0,error:'',top:0,heading:[] as string[],taxonomy:[] as string[]};
 if(w<600||h<600||w>2400||h>3000)return {...empty,error:'الأبعاد المطلوبة خارج النطاق المسموح (600–2400 عرضًا، 600–3000 ارتفاعًا)'};
 if(!cfg.title.trim()||(statement&&!cfg.body.trim()))return {...empty,error:'أدخل العنوان والنص المطلوب'};
 if(/https?:\/\/|www\./i.test(cfg.title))return {...empty,error:'العنوان يحتوي على رابط إلكتروني. انقل الرابط إلى حقل المصدر، واترك العنوان نصًا خبريًا فقط.'};
 const showClassification=cfg.showPath&&!(cfg.newsImage&&cfg.photoPosition==='background'&&cfg.hidePathOnBackground&&(cfg.mode==='news'||cfg.mode==='urgent'));
 const categories=(showClassification?[cfg.path.dossier,cfg.path.issue,cfg.path.event]:[]).map(x=>x.trim()).filter(Boolean);
 ctx.font='500 27px '+fontStack(cfg.metaFont);
 const taxonomy=categories.length?toLines(ctx,categories.join(' ← '),width):[];
 if(taxonomy.length>3)return {...empty,error:'مسار التصنيف طويل؛ اختصر التسميات إلى ثلاثة أسطر كحد أقصى'};
 const taxBottom=taxonomy.length?cfg.topPadding+100+taxonomy.length*40+28:cfg.topPadding+93;
 ctx.font='700 '+cfg.titleSize+'px '+fontStack(cfg.headlineFont);
 const heading=statement?toLines(ctx,cfg.title,width):[];
 if(heading.length>2)return {...empty,error:'عنوان البيان أطول من سطرين؛ اختصر العنوان فقط'};
 const issuerArea=statement?(cfg.issuerLogo?185:55):0;
 const headerStart=statement?(cfg.issuerLogo?taxBottom+170:taxBottom+14):taxBottom;
 const titleBottom=headerStart+heading.length*(cfg.titleSize*1.32);
 const top=statement?titleBottom+issuerArea+(cfg.issuerLogo?0:25):Math.max(cfg.topPadding+140,taxBottom+35);
 const footerTop=h-cfg.bottomPadding-150;
 const bottom=statement?footerTop-(sourceText(cfg)?85:20):cfg.mode==='quote'?footerTop-(sourceText(cfg)?85:45):footerTop-45;
 let font=cfg.textSize;
 let lineHeight=font*cfg.lineSpacing;
 if(bottom-top<36)return {...empty,error:'المساحة المتاحة ضيقة؛ خفف الهوامش أو اختر ارتفاعًا أكبر'};
 if(statement){
   ctx.font=cfg.bodyWeight+' '+font+'px '+fontStack(cfg.summaryFont);
   const lines=toLines(ctx,cfg.body.trim(),width);
   const capacity=Math.floor((bottom-top)/lineHeight);
   if(capacity<2)return {...empty,error:'المساحة المتاحة للبيان غير كافية'};
   const pages:Page[]=[];
   for(let i=0;i<lines.length;i+=capacity)pages.push({lines:lines.slice(i,i+capacity)});
   return {pages,font,lineHeight,error:'',top,heading,taxonomy};
 }
 if(cfg.mode==='quote'){
  const qwidth=cfg.personImage?Math.floor(width*.58):width;
  font=Math.min(font,57);ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);
  let lines=toLines(ctx,cfg.title.trim(),qwidth);lineHeight=font*cfg.lineSpacing;
  while(font>30&&lines.length*lineHeight>bottom-top-90){font-=2;ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);lines=toLines(ctx,cfg.title.trim(),qwidth);lineHeight=font*cfg.lineSpacing}
  if(lines.length*lineHeight>bottom-top-90)return {...empty,error:'الاقتباس طويل جدًا؛ اختصره ليناسب البطاقة'};
  return {pages:[{lines}],font,lineHeight,error:'',top,heading,taxonomy};
 }
 // Build headline/photo geometry once, then paginate long summaries without dropping text.
 let layout:NewsGeometry|null=null;
 font=Math.min(font,Math.round(((cfg.newsImage&&(cfg.photoPosition==='left'||cfg.photoPosition==='right'))?Math.max(32,w*.046):cfg.newsImage&&cfg.photoPosition==='background'?Math.max(36,w*.057):Math.max(42,w*.065))*cfg.titleScale/100));
 while(font>=26){
  ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);lineHeight=font*cfg.lineSpacing;
  layout=newsGeometry({...cfg,summary:''},ctx,top,bottom,font);
  if(layout)break;font-=2;
 }
 if(!layout)return {...empty,error:'العنوان أو الصورة لا يتسعان للمقاس الحالي. زد الارتفاع أو خفف حجم الصورة والهوامش.'};
 if(!cfg.summary.trim())return {pages:[{lines:layout.rows.map(row=>row.text),news:layout}],font,lineHeight,error:'',top,heading,taxonomy};

 const summaryWidth=w-2*(margin+cfg.marginLeft+cfg.marginRight+cfg.summaryInset);
 if(summaryWidth<100)return {...empty,error:'عرض الموجز غير كافٍ؛ خفف الهوامش.'};
 const summaryFont=Math.max(18,cfg.summarySize);
 ctx.font='400 '+summaryFont+'px '+fontStack(cfg.summaryFont);
 const allSummaryLines=toLines(ctx,cfg.summary.trim(),summaryWidth);
 const summaryLineHeight=summaryFont*cfg.summaryLineSpacing;
 const headlineBottom=layout.rows.length?layout.rows[layout.rows.length-1].y+lineHeight:top;
 const photoBottom=layout.photo?layout.photo.y+layout.photo.h+(cfg.showImageCredit&&cfg.imageCredit.trim()&&cfg.imageCreditPlacement==='below'?31:0):0;
 const mediaBottom=Math.max(headlineBottom,photoBottom);
 const source=sourceText(cfg);
 const locationText=cfg.showLocation&&cfg.location.trim()?'الموقع: '+cfg.location.trim():'';
 const summaryRight=w-margin-cfg.marginRight-cfg.summaryInset+cfg.summaryDX;
 const firstSummaryY=mediaBottom+cfg.detailSpacing+(source&&cfg.sourcePlacement==='before-summary'?44:0);
 const continuationY=top+112;
 const firstReserve=(source&&cfg.sourcePlacement==='before-summary'?0:source?90:0)+(locationText?34:0);
 const continuationReserve=(source?90:0)+(locationText?34:0);
 const firstCapacity=Math.floor((bottom-firstSummaryY-firstReserve)/summaryLineHeight);
 const continuationCapacity=Math.floor((bottom-continuationY-continuationReserve)/summaryLineHeight);
 if(firstCapacity<1||continuationCapacity<1)return {...empty,error:'المساحة المتاحة للموجز غير كافية. اختر مقاسًا أطول أو خفف حجم الصورة والهوامش.'};
 const chunks:string[][]=[];let offset=0;
 const firstChunk=allSummaryLines.slice(0,firstCapacity);chunks.push(firstChunk);offset=firstChunk.length;
 while(offset<allSummaryLines.length){const chunk=allSummaryLines.slice(offset,offset+continuationCapacity);chunks.push(chunk);offset+=chunk.length;}
 const pages:Page[]=chunks.map((chunk,index)=>{
  const last=index===chunks.length-1,continued=index>0,summaryY=continued?continuationY:firstSummaryY;
  let sourceY:number|null=null,locationY:number|null=null;
  if(source&&((cfg.sourcePlacement==='before-summary'&&index===0)||(cfg.sourcePlacement==='after-summary'&&last))){
   sourceY=cfg.sourcePlacement==='before-summary'?mediaBottom+cfg.detailSpacing:summaryY+chunk.length*summaryLineHeight+18;
  }
  if(locationText&&last)locationY=sourceY!==null?sourceY+42:summaryY+chunk.length*summaryLineHeight+18;
  const news:NewsGeometry={
   ...layout!,
   rows:continued?[]:layout!.rows,
   photo:continued?null:layout!.photo,
   summaryLines:chunk,summaryY,summaryRight,summaryWidth,summaryFont,summaryLineHeight,
   source:sourceY!==null?source:'',
   sourceY,sourceRight:layout!.sourceRight,
   locationText:last?locationText:'',locationY,
   creditBelowY:continued?null:layout!.creditBelowY,
   continuationTitle:continued?cfg.title:'',
  };
  return {lines:news.rows.map(row=>row.text),news};
 });
 return {pages,font,lineHeight,error:'',top,heading,taxonomy};
}
function photoBox(cfg:Config,w:number,h:number,margin:number){
 if(!cfg.newsImage)return null;
 const width=w-2*margin-cfg.marginLeft-cfg.marginRight;
 const scale=cfg.photoScale/100;const frameW=cfg.photoFrameWidth/100,frameH=cfg.photoFrameHeight/100;
 if(cfg.photoPosition==='background')return {x:margin+cfg.marginLeft+cfg.imageInset,y:cfg.topPadding+105,w:(width-2*cfg.imageInset)*frameW,h:Math.max(100,h-cfg.topPadding-cfg.bottomPadding-310)*frameH};
 if(cfg.photoPosition==='top')return {x:margin+cfg.marginLeft+cfg.imageInset,y:0,w:(width-2*cfg.imageInset)*frameW,h:Math.max(115,Math.min(280,Math.round(h*.22*scale)))*frameH};
 const photoW=Math.round(Math.min(width*.46,width*.38*scale)*frameW);
 const photoH=Math.max(110,Math.min(470,Math.round(h*.36*scale)))*frameH;
 return {x:cfg.photoPosition==='left'?margin+cfg.marginLeft:w-margin-cfg.marginRight-photoW,y:0,w:photoW,h:photoH};
}
function photoPath(ctx:CanvasRenderingContext2D,box:PhotoRect,shape:PhotoShape,radius:number){
 const {x,y,w,h}=box;ctx.beginPath();
 if(shape==='circle'){const r=Math.min(w,h)/2;ctx.arc(x+w/2,y+h/2,r,0,Math.PI*2)}
 else if(shape==='oval'){ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2)}
 else if(shape==='hexagon'){
  ctx.moveTo(x+w*.25,y);ctx.lineTo(x+w*.75,y);ctx.lineTo(x+w,y+h*.5);
  ctx.lineTo(x+w*.75,y+h);ctx.lineTo(x+w*.25,y+h);ctx.lineTo(x,y+h*.5);ctx.closePath();
 }else if(shape==='angled'){
  ctx.moveTo(x+w*.12,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w*.9,y+h);
  ctx.lineTo(x,y+h);ctx.lineTo(x,y+h*.16);ctx.closePath();
 }else if(shape==='mixed')ctx.roundRect(x,y,w,h,[Math.min(radius,Math.min(w,h)/2),0,Math.min(radius,Math.min(w,h)/2),0]);
 else ctx.roundRect(x,y,w,h,shape==='square'?0:radius);
}
function paintPhoto(ctx:CanvasRenderingContext2D,img:HTMLImageElement,box:PhotoRect,fit:PhotoFit,rounded:boolean,opacity:number,shape:PhotoShape='rounded',radius=18,border=0,color='#fff',zoom=100,panX=0,panY=0){
 const {x,y,w,h}=box;if(w<=0||h<=0)return;
 const actualShape=shape==='rounded'&&!rounded?'square':shape;
 ctx.save();ctx.globalAlpha=opacity;
 if(actualShape!=='fade'){photoPath(ctx,box,actualShape,radius);ctx.clip()}
 ctx.fillStyle='#faf9f3';if(actualShape!=='fade')ctx.fillRect(x,y,w,h);
 const factor=(fit==='cover'?Math.max(w/img.width,h/img.height):Math.min(w/img.width,h/img.height))*zoom/100;
 const iw=img.width*factor,ih=img.height*factor;
 const drawX=x+(w-iw)/2+(iw>w?(iw-w)*panX/200:0);
 const drawY=y+(h-ih)/2+(ih>h?(ih-h)*panY/200:0);
 if(actualShape==='fade'){
  const layer=document.createElement('canvas');layer.width=Math.ceil(w);layer.height=Math.ceil(h);
  const p=layer.getContext('2d');
  if(p){p.drawImage(img,drawX-x,drawY-y,iw,ih);p.globalCompositeOperation='destination-in';
   const gradient=p.createRadialGradient(w/2,h/2,Math.min(w,h)*.15,w/2,h/2,Math.max(w,h)*.68);
   gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(.70,'rgba(0,0,0,1)');gradient.addColorStop(1,'rgba(0,0,0,0)');
   p.fillStyle=gradient;p.fillRect(0,0,w,h);ctx.drawImage(layer,x,y)}
 }else ctx.drawImage(img,drawX,drawY,iw,ih);
 ctx.restore();
 if(border>0&&actualShape!=='fade'){ctx.save();photoPath(ctx,box,actualShape,radius);ctx.strokeStyle=color;ctx.lineWidth=border;ctx.stroke();ctx.restore()}
}
function photoCredit(ctx:CanvasRenderingContext2D,cfg:Config,photo:PhotoRect,belowY:number|null,dim:string){
 if(!cfg.showImageCredit||!cfg.imageCredit.trim())return;
 ctx.save();ctx.direction='rtl';ctx.font='400 19px '+sans;ctx.textBaseline='top';
 const value=ellipsis(ctx,'الصورة: '+cfg.imageCredit.trim(),Math.max(60,photo.w-24));
 if(belowY!==null){ctx.fillStyle=dim;ctx.textAlign='right';ctx.fillText(value,photo.x+photo.w,belowY)}
 else{
  const width=Math.min(photo.w-12,ctx.measureText(value).width+20);
  ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(photo.x+photo.w-width-6,photo.y+photo.h-31,width,26);
  ctx.textAlign='right';ctx.fillStyle='#fff';ctx.fillText(value,photo.x+photo.w-15,photo.y+photo.h-29)
 }
 ctx.restore()
}

function clamp(value:number,min:number,max:number){return Math.max(min,Math.min(max,value))}
function sourceText(cfg:Config){
 const value=cfg.sourceName.trim()||sourceLabel(cfg.sourceUrl);
 return cfg.showSource&&value?cfg.sourcePrefix+' '+value:'';
}
function calendarDate(value:string,showWeekday:boolean){
 const match=new RegExp('^([0-9]{4})/([0-9]{2})/([0-9]{2})$').exec(value.trim());
 if(!match)return value;
 const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
 const d=new Date(Date.UTC(year,month-1,day));
 if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month-1||d.getUTCDate()!==day)return value;
 return showWeekday?['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.getUTCDay()]+'  '+value:value;
}
function newsGeometry(cfg:Config,ctx:CanvasRenderingContext2D,top:number,bottom:number,font:number):NewsGeometry|null{
 const {w,h}=dimensions(cfg),margin=cfg.sideMargin,leftMargin=margin+cfg.marginLeft,rightMargin=margin+cfg.marginRight,fullWidth=w-leftMargin-rightMargin;
 const hasPhoto=Boolean(cfg.newsImage),background=hasPhoto&&cfg.photoPosition==='background';
 const side=hasPhoto&&(cfg.photoPosition==='left'||cfg.photoPosition==='right');
 const topPhoto=hasPhoto&&cfg.photoPosition==='top';
 const frame=hasPhoto?photoBox(cfg,w,h,margin):null;
 const creditBelow=Boolean(hasPhoto&&cfg.showImageCredit&&cfg.imageCredit.trim()&&cfg.imageCreditPlacement==='below'&&!background);
 const creditH=creditBelow?31:0;
 const pad=(background||topPhoto)?0:cfg.imageInset;
 const photoW=frame&&!background?Math.min(frame.w,fullWidth-pad*2):0;
 const photoH=frame&&!background?frame.h:0;
 const gap=36;
 const photoX=frame?clamp(frame.x+cfg.imageDX,leftMargin+pad,w-rightMargin-pad-frame.w):0;
 const photoY=cfg.imageDY;
 const titleFont=font,lh=titleFont*cfg.lineSpacing;
 const dy=topPhoto?Math.max(cfg.headlineDY+photoH+cfg.detailSpacing,photoY+photoH+creditH+20):cfg.headlineDY;
 const words=cfg.title.trim().match(/\S+/g)??[];
 const rows:HeadlineRow[]=[];
 const spare=cfg.headlineInset;
 const baseLeft=leftMargin+spare,baseRight=w-rightMargin-spare;
 const photoRight=cfg.photoPosition==='right';
 for(let index=0;words.length&&index<90;index++){
  const lineY=dy+index*lh;
  const intersects=side&&Boolean(frame)&&(
   !cfg.wrapHeadline || (lineY<photoY+photoH+creditH+16&&lineY+lh>photoY-16)
  );
  let left=baseLeft,right=baseRight;
  if(intersects){if(photoRight)right=Math.min(right,photoX-gap);else left=Math.max(left,photoX+photoW+gap)}
  const maxWidth=right-left;
  if(maxWidth<95)return null;
  let line='';
  while(words.length){
   const word=words[0];
   if(word===undefined){words.shift();continue}
   const candidate=line?line+' '+word:word;
   if(ctx.measureText(candidate).width<=maxWidth){line=candidate;words.shift();continue}
   if(line)break;
   const chars=Array.from(word);let used=0,chunk='';
   for(const ch of chars){if(ctx.measureText(chunk+ch).width>maxWidth&&chunk)break;chunk+=ch;used++}
   if(!chunk)return null;
   line=chunk;if(used===chars.length)words.shift();else words[0]=chars.slice(used).join('');
   break;
  }
  if(!line)return null;
  rows.push({text:line,left:left+cfg.headlineDX,right:right+cfg.headlineDX,y:lineY});
 }
 if(words.length)return null;
 const titleBottom=rows.length?rows[rows.length-1].y+lh:dy;
 const photoBottom=side?photoY+photoH+creditH:topPhoto?photoY+photoH+creditH:0;
 const mediaBottom=Math.max(titleBottom,photoBottom);
 const source=sourceText(cfg);
 const sourceH=source?32:0;
 let summaryFont=cfg.summarySize,summaryLineHeight=summaryFont*cfg.summaryLineSpacing;
 const sumSpace=cfg.summaryInset;
 const summaryRight=w-rightMargin-sumSpace+cfg.summaryDX;
 const summaryWidth=fullWidth-2*sumSpace;
 if(summaryWidth<100)return null;
 let summaryLines:string[]=[],summaryY=0,sourceY:number|null=null,next=0,locationY:number|null=null;
 const locationText=cfg.showLocation&&cfg.location.trim()?'الموقع: '+cfg.location.trim():'';
 for(;summaryFont>=14;summaryFont-=2){
  ctx.font='400 '+summaryFont+'px '+fontStack(cfg.summaryFont);
  summaryLines=cfg.summary.trim()?toLines(ctx,cfg.summary.trim(),summaryWidth):[];
  summaryLineHeight=summaryFont*cfg.summaryLineSpacing;
  const summaryH=summaryLines.length*summaryLineHeight;
  next=mediaBottom+(summaryLines.length||source?cfg.detailSpacing:0);sourceY=null;summaryY=0;locationY=null;
  if(source&&cfg.sourcePlacement==='before-summary'){sourceY=next+Math.max(-12,cfg.sourceDY);next=Math.max(next,sourceY)+sourceH+12;}
  if(summaryLines.length){summaryY=next+Math.max(-12,cfg.summaryDY);next=Math.max(next,summaryY)+summaryH;}
  if(source&&cfg.sourcePlacement==='after-summary'){sourceY=next+(summaryLines.length?18:0)+Math.max(-12,cfg.sourceDY);next=Math.max(next,sourceY)+sourceH;}
  locationY=locationText?next+18:null;if(locationY!==null)next=locationY+30;
  const lowTry=Math.min(0,dy,frame&&!background?photoY:0,summaryLines.length?summaryY:0,sourceY??0);
  const highTry=Math.max(titleBottom,photoBottom,next,0);
  if(highTry-lowTry+12<=bottom-top)break;
 }
 if(summaryFont<14)return null;
 const low=Math.min(0,dy,frame&&!background?photoY:0,summaryLines.length?summaryY:0,sourceY??0);
 const high=Math.max(titleBottom,photoBottom,next,0);
 const total=high-low+12;
 if(total>bottom-top)return null;
 const free=bottom-top-total;
 const origin=cfg.vertical==='top'?top-low:cfg.vertical==='bottom'?top+free-low:top+free/2-low;
 for(const row of rows)row.y+=origin;
 const imageRect=frame?background
 ?{x:clamp(frame.x+cfg.imageDX,leftMargin+pad,w-rightMargin-pad-frame.w),y:clamp(top+10+cfg.imageDY,top,bottom-95),w:frame.w,h:Math.max(80,bottom-clamp(top+10+cfg.imageDY,top,bottom-95)-12)}
 :{x:photoX,y:origin+photoY,w:frame.w,h:photoH}:null;
 return {rows,photo:imageRect,summaryLines,summaryY:origin+summaryY,summaryRight,summaryWidth,summaryFont,summaryLineHeight,
 source,sourceY:sourceY===null?null:origin+sourceY,sourceRight:clamp(w-rightMargin-40+cfg.sourceDX,leftMargin+150,w-rightMargin),
 locationText,locationY:locationY===null?null:origin+locationY,
 creditBelowY:creditBelow&&imageRect?imageRect.y+imageRect.h+5:null};
}
function sourceLabel(raw:string):string{
 if(!raw.trim())return '';
 try{
  const parsed=new URL(raw.trim());
  if(!['https:','http:'].includes(parsed.protocol))return '';
  return parsed.hostname.replace(/^www\./,'')+parsed.pathname.replace(/\/$/,'');
 }catch{return ''}
}
function ellipsis(ctx:CanvasRenderingContext2D,value:string,maxWidth:number):string{
 if(ctx.measureText(value).width<=maxWidth)return value;
 const characters=Array.from(value);let low=0,high=characters.length;
 while(low<high){const middle=Math.ceil((low+high)/2);if(ctx.measureText(characters.slice(0,middle).join('')+'…').width<=maxWidth)low=middle;else high=middle-1}
 return characters.slice(0,low).join('')+'…';
}
function drawText(ctx:CanvasRenderingContext2D,line:string,x:number,y:number,underlined:boolean){
 ctx.fillText(line,x,y);
 if(underlined&&line){const width=ctx.measureText(line).width;const from=ctx.textAlign==='center'?x-width/2:x-width;ctx.beginPath();ctx.moveTo(from,y+Number.parseInt(ctx.font.match(/(\d+)px/)?.[1]??'40',10)*1.09);ctx.lineTo(from+width,y+Number.parseInt(ctx.font.match(/(\d+)px/)?.[1]??'40',10)*1.09);ctx.lineWidth=2;ctx.strokeStyle=ctx.fillStyle as string;ctx.stroke()}
}
function draw(canvas:HTMLCanvasElement,cfg:Config,index:number):{total:number;error:string;elements?:StudioElement[]}{
 const {w,h}=dimensions(cfg);canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');if(!ctx)return {total:0,error:'تعذر فتح محرك الرسم'};
 const {pages,font,lineHeight,error,top,heading,taxonomy}=plan(cfg,ctx);
 const margin=cfg.sideMargin;
 if(error)return {total:0,error};
 const p=pages[Math.min(index,pages.length-1)];const c=cfg.skin==='custom'?{bg:cfg.customBg,fg:cfg.customFg,accent:cfg.customAccent,dim:cfg.customDim}:skins[cfg.skin];
 ctx.fillStyle=c.bg;ctx.fillRect(0,0,w,h);
 // A restrained editorial accent, not a wide decorative stripe.
 ctx.fillStyle=c.accent;ctx.fillRect(w-12,0,12,h);
 ctx.direction='rtl';ctx.textAlign='right';ctx.textBaseline='top';
 ctx.fillStyle=c.accent;ctx.font='700 34px '+fontStack(cfg.metaFont);
 ctx.fillText(modes[cfg.mode],w-margin-cfg.marginRight,cfg.topPadding);
 ctx.strokeStyle=c.accent;ctx.globalAlpha=.52;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(margin+cfg.marginLeft,cfg.topPadding+74);ctx.lineTo(w-margin-cfg.marginRight,cfg.topPadding+74);ctx.stroke();ctx.globalAlpha=1;
 let yy=cfg.topPadding+100;
 if(taxonomy.length){
  ctx.fillStyle=c.dim;ctx.font='500 27px '+fontStack(cfg.metaFont);
  for(const line of taxonomy){ctx.fillText(line,w-margin-cfg.marginRight,yy);yy+=40}
 }
 if(cfg.mode==='statement'){
  const taxEnd=taxonomy.length?yy+28:cfg.topPadding+93;
  if(cfg.issuerLogo){
   const bw=176,bh=151,bx=(w-bw)/2,by=taxEnd+5;
   ctx.fillStyle='#faf9f3';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,15);ctx.fill();
   const factor=Math.min((bw-25)/cfg.issuerLogo.width,(bh-25)/cfg.issuerLogo.height);
   const iw=cfg.issuerLogo.width*factor,ih=cfg.issuerLogo.height*factor;
   ctx.drawImage(cfg.issuerLogo,bx+(bw-iw)/2,by+(bh-ih)/2,iw,ih);
  }
  const headY=cfg.issuerLogo?taxEnd+180:taxEnd+18;
  ctx.fillStyle=c.fg;ctx.font='700 '+cfg.titleSize+'px '+fontStack(cfg.headlineFont);
  heading.forEach((line,j)=>ctx.fillText(line,w-margin-cfg.marginRight,headY+j*cfg.titleSize*1.32));
  const issuerY=headY+heading.length*cfg.titleSize*1.32+14;
  ctx.fillStyle=c.dim;ctx.font='500 27px '+fontStack(cfg.metaFont);
  const issuerLines=toLines(ctx,cfg.issuer||'الجهة المصدرة غير محددة',w-margin*2-cfg.marginLeft-cfg.marginRight);
  if(issuerLines.length>2)return {total:pages.length,error:'اسم الجهة طويل؛ اختصر الاسم'};
  issuerLines.forEach((line,j)=>ctx.fillText(line,w-margin-cfg.marginRight,issuerY+j*38));
  ctx.fillStyle=c.fg;ctx.font=cfg.bodyWeight+' '+font+'px '+fontStack(cfg.summaryFont);ctx.textAlign=cfg.align;
  const x=cfg.align==='center'?(margin+cfg.marginLeft+w-margin-cfg.marginRight)/2:w-margin-cfg.marginRight;
  p.lines.forEach((line,j)=>{if(line)drawText(ctx,line,x,top+j*lineHeight,cfg.underline)});ctx.textAlign='right';
 }else if(cfg.mode==='quote'){
  if(cfg.personImage){
   const px=margin,py=top+32,pw=Math.floor((w-margin*2)*.36),ph=Math.min(430,h-355-top);
   if(ph>90){ctx.save();ctx.beginPath();ctx.roundRect(px,py,pw,ph,22);ctx.clip();const image=cfg.personImage;const ratio=Math.max(pw/image.width,ph/image.height);const iw=image.width*ratio,ih=image.height*ratio;ctx.drawImage(image,px+(pw-iw)/2,py+(ph-ih)/2,iw,ih);ctx.restore()}
  }
  const right=w-margin;const quoteWidth=cfg.personImage?(w-margin*2)*.58:w-margin*2;
  ctx.fillStyle=c.accent;ctx.font='700 35px '+serif;ctx.fillText('❝',right,top-20);
  ctx.fillStyle=c.fg;ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);
  p.lines.forEach((line,j)=>drawText(ctx,line,right,top+35+j*lineHeight,cfg.underline));
  const qBottom=top+40+p.lines.length*lineHeight;
  ctx.fillStyle=c.accent;ctx.fillRect(right-110,qBottom+5,110,5);
  ctx.fillStyle=c.fg;ctx.font='700 32px '+serif;ctx.fillText(ellipsis(ctx,cfg.quoteName||'المتحدث',quoteWidth),right,qBottom+25);
  if(cfg.quoteRole){ctx.fillStyle=c.dim;ctx.font='400 24px '+sans;const roles=toLines(ctx,cfg.quoteRole,quoteWidth).slice(0,2);roles.forEach((line,j)=>ctx.fillText(line,right,qBottom+68+j*34))}
 }else{
  const news=p.news;if(!news)return {total:0,error:'فشل تخطيط الخبر'};
  const sceneElements:StudioElement[]=[];
  if(news.photo)sceneElements.push({id:'photo',label:'الصورة',x:news.photo.x,y:news.photo.y,width:news.photo.w,height:news.photo.h});
  if(news.rows.length){
   ctx.direction='rtl';ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);
   const bounds=news.rows.map(row=>{const width=ctx.measureText(row.text).width,anchor=cfg.align==='center'?(row.left+row.right)/2:row.right;return {x:cfg.align==='center'?anchor-width/2:anchor-width,y:row.y,width,height:font*cfg.lineSpacing}});
   const left=Math.min(...bounds.map(item=>item.x)),top=Math.min(...bounds.map(item=>item.y));
   const right=Math.max(...bounds.map(item=>item.x+item.width)),bottom=Math.max(...bounds.map(item=>item.y+item.height));
   sceneElements.push({id:'headline',label:'العنوان',x:left,y:top,width:right-left,height:bottom-top});
  }
  if(news.summaryLines.length)sceneElements.push({id:'summary',label:'الموجز',x:news.summaryRight-news.summaryWidth,y:news.summaryY,width:news.summaryWidth,height:news.summaryLines.length*news.summaryLineHeight});
  if(news.continuationTitle){
   ctx.direction='rtl';ctx.textAlign='right';ctx.fillStyle=c.accent;ctx.font='500 26px '+fontStack(cfg.metaFont);
   ctx.fillText('استكمال الموجز',w-margin-cfg.marginRight,cfg.topPadding+100);
   ctx.fillStyle=c.fg;ctx.font='700 34px '+fontStack(cfg.headlineFont);
   ctx.fillText(ellipsis(ctx,news.continuationTitle,w-2*margin-cfg.marginLeft-cfg.marginRight),w-margin-cfg.marginRight,cfg.topPadding+145);
   ctx.strokeStyle=c.accent;ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(margin+cfg.marginLeft,cfg.topPadding+198);ctx.lineTo(w-margin-cfg.marginRight,cfg.topPadding+198);ctx.stroke();ctx.globalAlpha=1;
  }
  if(news.photo&&cfg.newsImage&&cfg.photoPosition==='background'){
   paintPhoto(ctx,cfg.newsImage,news.photo,cfg.photoFit,cfg.photoRounded,cfg.photoOpacity/100,cfg.imageShape,cfg.imageRadius,cfg.imageBorder,c.accent,cfg.photoZoom,cfg.photoPanX,cfg.photoPanY);
   ctx.fillStyle=c.bg;ctx.globalAlpha=(cfg.skin==='ivory'||cfg.skin==='stone'||cfg.skin==='rose') ? .62 : .52;
   ctx.fillRect(news.photo.x,news.photo.y,news.photo.w,news.photo.h);ctx.globalAlpha=1;
  }
  if(news.photo&&cfg.newsImage&&cfg.photoPosition!=='background')
   paintPhoto(ctx,cfg.newsImage,news.photo,cfg.photoFit,cfg.photoRounded,1,cfg.imageShape,cfg.imageRadius,cfg.imageBorder,c.accent,cfg.photoZoom,cfg.photoPanX,cfg.photoPanY);
  ctx.font=cfg.textWeight+' '+font+'px '+fontStack(cfg.headlineFont);ctx.direction='rtl';ctx.fillStyle=c.fg;ctx.textAlign=cfg.align;
  for(const line of news.rows){
   const x=cfg.align==='center'?(line.left+line.right)/2:line.right;
   drawText(ctx,line.text,x,line.y,cfg.underline);
  }
  if(news.summaryLines.length){
   ctx.direction='rtl';ctx.textAlign='right';ctx.font='400 '+news.summaryFont+'px '+fontStack(cfg.summaryFont);ctx.fillStyle=c.dim;
   ctx.save();ctx.beginPath();ctx.rect(margin+cfg.marginLeft,news.summaryY-2,w-2*margin-cfg.marginLeft-cfg.marginRight,Math.max(0,h-cfg.bottomPadding-150-news.summaryY));ctx.clip();
   for(let j=0;j<news.summaryLines.length;j++)ctx.fillText(news.summaryLines[j],news.summaryRight,news.summaryY+j*news.summaryLineHeight);ctx.restore();
  }
  if(news.source&&news.sourceY!==null){
   ctx.direction='rtl';ctx.textAlign='right';ctx.font='500 25px '+sans;ctx.fillStyle=c.accent;
   ctx.fillText(ellipsis(ctx,news.source,Math.max(120,news.sourceRight-margin-15)),news.sourceRight,news.sourceY);
  }
  if(news.locationY!==null){ctx.fillStyle=c.accent;ctx.font='500 23px '+sans;ctx.direction='rtl';ctx.textAlign='right';ctx.fillText(ellipsis(ctx,news.locationText,w-2*margin-cfg.marginLeft-cfg.marginRight),w-margin-cfg.marginRight-20,news.locationY)}
  if(news.photo&&cfg.newsImage)photoCredit(ctx,cfg,news.photo,news.creditBelowY,c.dim);
 }

 const foot=h-cfg.bottomPadding-150;
 ctx.strokeStyle=c.accent;ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(72,foot);ctx.lineTo(w-76,foot);ctx.stroke();ctx.globalAlpha=1;
 // The source logo is dark ink: always place it on a fully opaque pale surface.
 const badgeW=260,badgeH=122,badgeX=w-76-badgeW,badgeY=foot+14;
 ctx.fillStyle='#faf9f3';ctx.beginPath();ctx.roundRect(badgeX,badgeY,badgeW,badgeH,15);ctx.fill();
 if(cfg.logo){
  const ratio=Math.min((badgeW-28)/cfg.logo.width,(badgeH-18)/cfg.logo.height);
  const iw=cfg.logo.width*ratio,ih=cfg.logo.height*ratio;
  ctx.drawImage(cfg.logo,badgeX+(badgeW-iw)/2,badgeY+(badgeH-ih)/2,iw,ih);
 }else{
  ctx.fillStyle='#183833';ctx.font='700 30px '+sans;ctx.textAlign='center';ctx.fillText('ساس',badgeX+badgeW/2,badgeY+42);ctx.textAlign='right';
 }
 if(cfg.mode!=='news'&&cfg.mode!=='urgent'&&cfg.showLocation&&cfg.location.trim()){ctx.fillStyle=c.accent;ctx.font='500 24px '+serif;ctx.direction='rtl';ctx.textAlign='right';ctx.fillText(ellipsis(ctx,'الموقع: '+cfg.location,w-margin*2),w-margin,foot-47)}
 ctx.fillStyle=c.dim;ctx.font='400 24px '+sans;ctx.direction='ltr';ctx.textAlign='left';
 ctx.fillText(calendarDate(cfg.date,cfg.showWeekday),margin,foot+88);
 if(cfg.mode==='statement')ctx.fillText(String(index+1)+' / '+String(pages.length),margin,foot+115);
 if((cfg.mode==='statement'||cfg.mode==='quote')&&sourceText(cfg)){
  ctx.fillStyle=c.accent;ctx.font='500 24px '+serif;ctx.direction='rtl';ctx.textAlign='right';
  ctx.fillText(ellipsis(ctx,sourceText(cfg),w-margin*2),w-margin,foot-68);
 }
 return {total:pages.length,error:'',elements:cfg.mode==='news'||cfg.mode==='urgent'?sceneElements:[]};
}
async function getLogo(variant:LogoVariant):Promise<HTMLImageElement|null>{
 const sources:Record<LogoVariant,string>={color:'/brand/logos/sas-logo-1.svg',dark:'/brand/logos/sas-logo.svg',light:'/brand/logos/sas-logo-for%20white%20background.png'};
 return await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=sources[variant]});
}
export default function Studio(){
 const [mode,setMode]=useState<Mode>('news');
 const [format,setFormat]=useState<Format>('portrait');
 const [customWidth,setCustomWidth]=useState(1080);
 const [customHeight,setCustomHeight]=useState(1350);
 const [topPadding,setTopPadding]=useState(63);
 const [bottomPadding,setBottomPadding]=useState(12);
 const [detailSpacing,setDetailSpacing]=useState(32);
 const [summaryLineSpacing,setSummaryLineSpacing]=useState(1.5);
 const [skin,setSkin]=useState<Skin>('forest');
 const [customBg,setCustomBg]=useState('#092d28');
 const [customFg,setCustomFg]=useState('#fffefa');
 const [customAccent,setCustomAccent]=useState('#d6ee91');
 const [customDim,setCustomDim]=useState('#d3e3dc');
 const [marginLeft,setMarginLeft]=useState(0),[marginRight,setMarginRight]=useState(0);
 const [photoZoom,setPhotoZoom]=useState(100),[photoPanX,setPhotoPanX]=useState(0),[photoPanY,setPhotoPanY]=useState(0);
 const [photoFrameWidth,setPhotoFrameWidth]=useState(100),[photoFrameHeight,setPhotoFrameHeight]=useState(100);
 const [headlineFont,setHeadlineFont]=useState<FontChoice>('tajarib'),[summaryFont,setSummaryFont]=useState<FontChoice>('sans'),[metaFont,setMetaFont]=useState<FontChoice>('sans');
 const [logoVariant,setLogoVariant]=useState<LogoVariant>('color');
 const [bodyWeight,setBodyWeight]=useState<300|400>(300);
 const [titleSize,setTitleSize]=useState(60);
 const [showPath,setShowPath]=useState(true);
  const [title,setTitle]=useState('');
 const [sourceUrl,setSourceUrl]=useState('');
 const [sourceName,setSourceName]=useState('');
 const [showSource,setShowSource]=useState(true);
 const [textSize,setTextSize]=useState(78);
 const [textWeight,setTextWeight]=useState<Weight>(700);
 const [align,setAlign]=useState<Align>('right');
 const [underline,setUnderline]=useState(false);
 const [sideMargin,setSideMargin]=useState(76);
 const [lineSpacing,setLineSpacing]=useState(1.45);
 const [vertical,setVertical]=useState<'top'|'center'|'bottom'>('center');
 const [body,setBody]=useState('');
 const [summary,setSummary]=useState('');
 const [location,setLocation]=useState('');
 const [showLocation,setShowLocation]=useState(true);
 const [quoteName,setQuoteName]=useState('');
 const [quoteRole,setQuoteRole]=useState('');
 const [personImage,setPersonImage]=useState<HTMLImageElement|null>(null);
 const [mapImage,setMapImage]=useState<HTMLImageElement|null>(null);
 const [newsImage,setNewsImage]=useState<HTMLImageElement|null>(null);
 const [photoPosition,setPhotoPosition]=useState<PhotoPosition>('left');
 const [photoFit,setPhotoFit]=useState<PhotoFit>('cover');
 const [photoScale,setPhotoScale]=useState(85);
 const [photoOpacity,setPhotoOpacity]=useState(40);
 const [photoRounded,setPhotoRounded]=useState(true);
 const [titleScale,setTitleScale]=useState(100);
 const [hidePathOnBackground,setHidePathOnBackground]=useState(true);
 const [showWeekday,setShowWeekday]=useState(true);
 const [sourcePlacement,setSourcePlacement]=useState<SourcePlacement>('after-summary');
 const [sourcePrefix,setSourcePrefix]=useState('المصدر:');
 const [headlineDX,setHeadlineDX]=useState(0),[headlineDY,setHeadlineDY]=useState(0),[headlineInset,setHeadlineInset]=useState(15);
 const [summaryDX,setSummaryDX]=useState(0),[summaryDY,setSummaryDY]=useState(0),[summaryInset,setSummaryInset]=useState(15),[summarySize,setSummarySize]=useState(29);
 const [sourceDX,setSourceDX]=useState(0),[sourceDY,setSourceDY]=useState(0);
 const [imageDX,setImageDX]=useState(0),[imageDY,setImageDY]=useState(0),[imageInset,setImageInset]=useState(12);
 const [imageShape,setImageShape]=useState<PhotoShape>('rounded'),[imageRadius,setImageRadius]=useState(18),[imageBorder,setImageBorder]=useState(0);
 const [imageCredit,setImageCredit]=useState(''),[showImageCredit,setShowImageCredit]=useState(true),[imageCreditPlacement,setImageCreditPlacement]=useState<PhotoCreditPlacement>('inside');
 const [wrapHeadline,setWrapHeadline]=useState(true);
 const [presetName,setPresetName]=useState('');
 const [presets,setPresets]=useState<StudioPreset[]>([]);
 const [presetError,setPresetError]=useState('');
 const [mediaError,setMediaError]=useState('');
 const [issuer,setIssuer]=useState('');
 const [issuerLogo,setIssuerLogo]=useState<HTMLImageElement|null>(null);
 const [issuerLogoError,setIssuerLogoError]=useState('');
 const [path,setPath]=useState<KnowledgePath>({dossier:'',issue:'',event:''});
 const [date,setDate]=useState(()=>{const p=new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn',{timeZone:'Asia/Aden',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(type:string)=>p.find(x=>x.type===type)?.value??'';return get('year')+'/'+get('month')+'/'+get('day')});
 const [page,setPage]=useState(0);const [count,setCount]=useState(0);
 const [error,setError]=useState('');const [logo,setLogo]=useState<HTMLImageElement|null>(null);
 const [scene,setScene]=useState<StudioElement[]>([]);const [selectedElement,setSelectedElement]=useState<StudioElementId|null>(null);const gesture=useRef<StudioGesture|null>(null);
 const [exporting,setExporting]=useState(false);const canvas=useRef<HTMLCanvasElement>(null);
 const cfg=useMemo(()=>({mode,format,customWidth,customHeight,customBg,customFg,customAccent,customDim,marginLeft,marginRight,photoZoom,photoPanX,photoPanY,photoFrameWidth,photoFrameHeight,headlineFont,summaryFont,metaFont,logoVariant,topPadding,bottomPadding,detailSpacing,summaryLineSpacing,skin,title,body,issuer,date,logo,issuerLogo,path,bodyWeight,titleSize,showPath,sourceUrl,sourceName,showSource,textSize,textWeight,align,underline,sideMargin,lineSpacing,vertical,summary,location,showLocation,quoteName,quoteRole,personImage,mapImage,newsImage,photoPosition,photoFit,photoScale,photoOpacity,photoRounded,titleScale,hidePathOnBackground,showWeekday,sourcePlacement,sourcePrefix,headlineDX,headlineDY,headlineInset,summaryDX,summaryDY,summaryInset,summarySize,sourceDX,sourceDY,imageDX,imageDY,imageInset,imageShape,imageRadius,imageBorder,imageCredit,showImageCredit,imageCreditPlacement,wrapHeadline}),[mode,format,customWidth,customHeight,customBg,customFg,customAccent,customDim,marginLeft,marginRight,photoZoom,photoPanX,photoPanY,photoFrameWidth,photoFrameHeight,headlineFont,summaryFont,metaFont,logoVariant,topPadding,bottomPadding,detailSpacing,summaryLineSpacing,skin,title,body,issuer,date,logo,issuerLogo,path,bodyWeight,titleSize,showPath,sourceUrl,sourceName,showSource,textSize,textWeight,align,underline,sideMargin,lineSpacing,vertical,summary,location,showLocation,quoteName,quoteRole,personImage,mapImage,newsImage,photoPosition,photoFit,photoScale,photoOpacity,photoRounded,titleScale,hidePathOnBackground,showWeekday,sourcePlacement,sourcePrefix,headlineDX,headlineDY,headlineInset,summaryDX,summaryDY,summaryInset,summarySize,sourceDX,sourceDY,imageDX,imageDY,imageInset,imageShape,imageRadius,imageBorder,imageCredit,showImageCredit,imageCreditPlacement,wrapHeadline]);
 useEffect(()=>{
  try{const parsed:unknown=JSON.parse(window.localStorage.getItem('sas-studio-presets-v3')||'[]');
   if(Array.isArray(parsed))setPresets(parsed.filter((item:unknown):item is StudioPreset=>
    typeof item==='object'&&item!==null&&typeof (item as StudioPreset).name==='string'&&
    typeof (item as StudioPreset).titleScale==='number'&&typeof (item as StudioPreset).photoScale==='number'
   ).slice(0,15));
  }catch{setPresetError('تعذر قراءة قوالبك المحفوظة؛ لم تُحذف')}
 },[]);
 function snapshot(name:string):StudioPreset{
  return {name,mode,format,customWidth,customHeight,titleSize,bodyWeight,textWeight,align,underline,vertical,skin,customBg,customFg,customAccent,customDim,marginLeft,marginRight,photoZoom,photoPanX,photoPanY,photoFrameWidth,photoFrameHeight,headlineFont,summaryFont,metaFont,logoVariant,photoPosition,photoFit,imageShape,photoScale,imageRadius,imageBorder,photoOpacity,titleScale,textSize,lineSpacing,summaryLineSpacing,detailSpacing,headlineInset,headlineDX,headlineDY,summarySize,summaryInset,summaryDX,summaryDY,imageInset,imageDX,imageDY,sourcePlacement,sourceDX,sourceDY,wrapHeadline,showWeekday,showPath,sideMargin,topPadding,bottomPadding};
 }
 function applyPreset(p:StudioPreset){
  setMode(p.mode);setFormat(p.format);setCustomWidth(p.customWidth||1080);setMarginLeft(p.marginLeft||0);setMarginRight(p.marginRight||0);setPhotoZoom(p.photoZoom||100);setPhotoPanX(p.photoPanX||0);setPhotoPanY(p.photoPanY||0);setPhotoFrameWidth(p.photoFrameWidth||100);setPhotoFrameHeight(p.photoFrameHeight||100);setHeadlineFont(p.headlineFont||'tajarib');setSummaryFont(p.summaryFont||'sans');setMetaFont(p.metaFont||'sans');setLogoVariant(p.logoVariant||'color');setCustomHeight(p.customHeight||1350);setTitleSize(p.titleSize||60);setBodyWeight(p.bodyWeight||300);setTextWeight(p.textWeight||700);setAlign(p.align||'right');setUnderline(p.underline||false);setVertical(p.vertical||'center');setSkin(p.skin);setCustomBg(p.customBg||'#092d28');setCustomFg(p.customFg||'#fffefa');setCustomAccent(p.customAccent||'#d6ee91');setCustomDim(p.customDim||'#d3e3dc');setPhotoPosition(p.photoPosition);setPhotoFit(p.photoFit);setImageShape(p.imageShape);
  setPhotoScale(p.photoScale);setImageRadius(p.imageRadius);setImageBorder(p.imageBorder);setPhotoOpacity(p.photoOpacity);
  setTitleScale(p.titleScale);setTextSize(p.textSize);setLineSpacing(p.lineSpacing);setSummaryLineSpacing(p.summaryLineSpacing);
  setDetailSpacing(p.detailSpacing);setHeadlineInset(p.headlineInset);setHeadlineDX(p.headlineDX);setHeadlineDY(p.headlineDY);
  setSummarySize(p.summarySize);setSummaryInset(p.summaryInset);setSummaryDX(p.summaryDX);setSummaryDY(p.summaryDY);
  setImageInset(p.imageInset);setImageDX(p.imageDX);setImageDY(p.imageDY);setSourcePlacement(p.sourcePlacement);
  setSourceDX(p.sourceDX);setSourceDY(p.sourceDY);setWrapHeadline(p.wrapHeadline);setShowWeekday(p.showWeekday);
  setShowPath(p.showPath);setSideMargin(p.sideMargin);setTopPadding(p.topPadding);setBottomPadding(p.bottomPadding);
  setPage(0);setPresetError('');
 }
 function savePreset(){
  const name=presetName.trim();if(!name){setPresetError('اكتب اسم القالب أولًا');return}
  const item=snapshot(name);const list=[...presets.filter(p=>p.name!==name),item].slice(-15);
  try{window.localStorage.setItem('sas-studio-presets-v3',JSON.stringify(list));setPresets(list);setPresetError('');}
  catch{setPresetError('تعذر حفظ القالب على هذا المتصفح')}
 }
 function deletePreset(name:string){
  const list=presets.filter(p=>p.name!==name);
  try{window.localStorage.setItem('sas-studio-presets-v3',JSON.stringify(list));setPresets(list);setPresetName('');setPresetError('')}
  catch{setPresetError('تعذر تعديل القوالب المحفوظة')}
 }
 useEffect(()=>{let live=true;void getLogo(logoVariant).then(img=>{if(live)setLogo(img)});return()=>{live=false}},[logoVariant]);
 useEffect(()=>{let live=true;const id=setTimeout(()=>{void (async()=>{
  if(!canvas.current)return;
  try{const headlineFace=fontStack(cfg.headlineFont),summaryFace=fontStack(cfg.summaryFont),metaFace=fontStack(cfg.metaFont);await Promise.all([document.fonts.load('300 43px '+headlineFace),document.fonts.load('500 51px '+headlineFace),document.fonts.load('700 86px '+headlineFace),document.fonts.load('400 43px '+summaryFace),document.fonts.load('500 27px '+metaFace)]);
   if(!live)return;const result=draw(canvas.current,cfg,page);
   if(live){setError(result.error);setCount(result.total);setScene(result.elements??[]);setSelectedElement(current=>(result.elements??[]).some(item=>item.id===current)?current:null);if(page>=result.total&&result.total>0)setPage(result.total-1)}
  }catch{if(live)setError('فشل تحميل الخطوط أو الرسم')}
 })()},120);return()=>{live=false;clearTimeout(id)}},[cfg,page]);
 async function loadMedia(file:File|undefined,kind:'person'|'map'|'news'){
  const setter=kind==='person'?setPersonImage:kind==='map'?setMapImage:setNewsImage;
  if(!file){setter(null);setMediaError('');return}
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){setMediaError('الصورة يجب أن تكون PNG أو JPEG أو WebP بحجم حتى 5MB');return}
  const url=URL.createObjectURL(file);
  try{const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('invalid'));img.src=url});setter(image);setMediaError('');setPage(0)}catch{setMediaError('تعذر قراءة ملف الصورة')}finally{URL.revokeObjectURL(url)}
 }
 async function setIssuerImage(file:File|undefined){
  if(!file){setIssuerLogo(null);setIssuerLogoError('');return}
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){setIssuerLogoError('يجب رفع صورة PNG أو JPEG أو WebP بحجم لا يتجاوز 5MB');return}
  const url=URL.createObjectURL(file);
  try{
   const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('invalid image'));img.src=url});
   setIssuerLogo(image);setIssuerLogoError('');setPage(0);
  }catch{setIssuerLogoError('تعذر قراءة الصورة المختارة')}
  finally{URL.revokeObjectURL(url)}
 }
 function pointerPoint(event:ReactPointerEvent<SVGSVGElement>){
  const rect=event.currentTarget.getBoundingClientRect(),size=dimensions(cfg);
  return {x:(event.clientX-rect.left)*(size.w/Math.max(1,rect.width)),y:(event.clientY-rect.top)*(size.h/Math.max(1,rect.height))};
 }
 function beginGesture(event:ReactPointerEvent<SVGRectElement>,element:StudioElement,mode:'move'|'resize',handle?:ResizeHandle){
  event.preventDefault();event.stopPropagation();
  const svg=event.currentTarget.ownerSVGElement;if(!svg)return;
  const rect=svg.getBoundingClientRect(),size=dimensions(cfg);
  const startX=(event.clientX-rect.left)*(size.w/Math.max(1,rect.width)),startY=(event.clientY-rect.top)*(size.h/Math.max(1,rect.height));
  gesture.current={id:element.id,mode,handle,startX,startY,element,headlineDX,headlineDY,summaryDX,summaryDY,imageDX,imageDY,titleScale,summarySize,photoFrameWidth,photoFrameHeight};
  setSelectedElement(element.id);svg.setPointerCapture(event.pointerId);
 }
 function moveGesture(event:ReactPointerEvent<SVGSVGElement>){
  const active=gesture.current;if(!active)return;
  const point=pointerPoint(event),dx=point.x-active.startX,dy=point.y-active.startY;
  if(active.mode==='move'){
   const size=dimensions(cfg),moveX=clamp(dx,-active.element.x,size.w-active.element.x-active.element.width),moveY=clamp(dy,-active.element.y,size.h-active.element.y-active.element.height);
   if(active.id==='headline'){setHeadlineDX(active.headlineDX+moveX);setHeadlineDY(active.headlineDY+moveY)}
   else if(active.id==='summary'){setSummaryDX(active.summaryDX+moveX);setSummaryDY(active.summaryDY+moveY)}
   else{setImageDX(active.imageDX+moveX);setImageDY(active.imageDY+moveY)}
   return;
  }
  const handle=active.handle??'se';
  const xSign=handle.includes('e')?1:handle.includes('w')?-1:0;
  const ySign=handle.includes('s')?1:handle.includes('n')?-1:0;
  const horizontal=xSign?Math.max(.35,1+(dx*xSign)/Math.max(60,active.element.width)):1;
  const vertical=ySign?Math.max(.35,1+(dy*ySign)/Math.max(60,active.element.height)):1;
  const factor=xSign&&ySign?(horizontal+vertical)/2:xSign?horizontal:vertical;
  if(active.id==='headline')setTitleScale(clamp(active.titleScale*factor,55,180));
  else if(active.id==='summary')setSummarySize(clamp(active.summarySize*factor,18,72));
  else{
   if(xSign)setPhotoFrameWidth(clamp(active.photoFrameWidth*horizontal,55,150));
   if(ySign)setPhotoFrameHeight(clamp(active.photoFrameHeight*vertical,55,150));
  }
 }
 function endGesture(){gesture.current=null}
 async function exportPages(){
  if(exporting||!canvas.current)return;
  setExporting(true);
  try{
   await document.fonts.ready;
   if(!logo){setError('لم يكتمل تحميل الشعار الرسمي؛ لا يمكن تصدير الصورة');return}
   const temp=document.createElement('canvas');const first=draw(temp,cfg,0);
   if(first.error){setError(first.error);return}
   for(let i=0;i<first.total;i++){
    const result=draw(temp,cfg,i);if(result.error){setError(result.error);return}
    const blob=await new Promise<Blob|null>(resolve=>temp.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('فشل إنشاء الصورة');
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SAS-'+mode+'-'+String(i+1).padStart(2,'0')+'-of-'+first.total+'.png';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    if(first.total>1)await new Promise(resolve=>setTimeout(resolve,180));
   }
  }catch{setError('تعذر التصدير؛ تحقق من إعدادات تنزيل الملفات المتعددة')}finally{setExporting(false)}
 }
 const activeSceneElement=scene.find(item=>item.id===selectedElement)??null;
 const resizeHandles:ResizeHandle[]=['nw','n','ne','e','se','s','sw','w'];
 return <div className="studio-page">
 <header className="knowledge-hero"><span className="eyebrow">استوديو ساس · V3-C.3</span><h1>استوديو المنتجات البصرية</h1><p>معاينة وتصدير محلي دون نشر آلي أو تعديل تلقائي للبيان.</p></header>
 <div className="studio-layout"><section className="admin-panel studio-fields">
 <h2>إعداد المادة</h2>
 <label>نوع التصميم<select value={mode} onChange={e=>{const next=e.target.value as Mode;setMode(next);setTextSize(next==='statement'?43:78);setSideMargin(next==='statement'?120:76);setLineSpacing(next==='statement'?1.65:1.45);setPage(0)}}>{(Object.keys(modes) as Mode[]).map(k=><option key={k} value={k}>{modes[k]}</option>)}</select></label>
 <label>{mode==='statement'?'عنوان البيان (حتى 120 حرفًا)':mode==='quote'?'نص التصريح أو الاقتباس':'عنوان الخبر'}<textarea rows={3} maxLength={mode==='statement'?120:900} value={title} onChange={e=>{setTitle(e.target.value);setPage(0)}}/></label>
 {(mode==='news'||mode==='urgent')&&<div className="studio-summary-editor"><label>موجز الخبر — حتى 250 كلمة<textarea rows={7} value={summary} onChange={e=>{const next=e.target.value;const words=next.trim().match(/\S+/g)||[];setSummary(words.length<=250?next:words.slice(0,250).join(' '));setPage(0)}} placeholder="اكتب موجزًا تحريريًا مفصلًا. سيُوزع تلقائيًا على صفحات متتابعة عند الحاجة."/></label><p className="studio-word-count">{(summary.trim().match(/\S+/g)||[]).length} / 250 كلمة</p><p className="studio-note">لن يُحذف النص عند زيادة المحتوى على مساحة البطاقة؛ سيُستكمل في صفحات إضافية تحمل العنوان والهوية نفسيهما.</p></div>}
 <details className="studio-options" open><summary>مقاس مساحة التصميم</summary>
 <div className="studio-size-grid">{([{value:'portrait',label:'منشور رأسي',dims:'1080 × 1350',ratio:'4 / 5'},{value:'square',label:'مربع',dims:'1080 × 1080',ratio:'1 / 1'},{value:'landscape',label:'أفقي',dims:'1200 × 675',ratio:'16 / 9'},{value:'wide',label:'عريض',dims:'1600 × 900',ratio:'16 / 9'},{value:'story',label:'قصة / ريلز',dims:'1080 × 1920',ratio:'9 / 16'},{value:'custom',label:'مخصص',dims:'عرض وارتفاع',ratio:'1 / 1'}] as const).map(item=><button type="button" key={item.value} className={format===item.value?'studio-size-card selected':'studio-size-card'} onClick={()=>{setFormat(item.value);setPage(0)}}><span className="studio-size-shape" style={{aspectRatio:item.ratio}}/><strong>{item.label}</strong><small>{item.dims}</small></button>)}</div>
 {format==='custom'&&<div className="studio-custom-size"><label>العرض بالبكسل<input type="number" min={600} max={2400} step={10} value={customWidth} onChange={e=>setCustomWidth(Math.max(600,Math.min(2400,Number(e.target.value)||600)))}/></label><label>الارتفاع بالبكسل<input type="number" min={600} max={3000} step={10} value={customHeight} onChange={e=>setCustomHeight(Math.max(600,Math.min(3000,Number(e.target.value)||600)))}/></label></div>}
 <p className="studio-note">المقاسات مخصصة للتصدير النهائي بالبكسل. يمكنك تغييرها في أي وقت دون إعادة كتابة المحتوى.</p>
 </details>
 <details className="studio-options"><summary>قوالب التكوين السريعة</summary><div className="studio-layout-templates">
 <button type="button" onClick={()=>{setMode('news');setFormat('portrait');setSkin('forest');setPhotoPosition('left');setTextSize(78);setSideMargin(76);setPage(0)}}><strong>خبر تحريري</strong><small>عنوان وموجز وصورة جانبية</small></button>
 <button type="button" onClick={()=>{setMode('news');setFormat('portrait');setSkin('ivory');setPhotoPosition('top');setTextSize(72);setSideMargin(76);setPage(0)}}><strong>خبر بصري</strong><small>صورة علوية ومساحة نص</small></button>
 <button type="button" onClick={()=>{setMode('urgent');setFormat('landscape');setSkin('burgundy');setPhotoPosition('background');setTextSize(88);setSideMargin(72);setPage(0)}}><strong>عاجل</strong><small>مساحة أفقية وخلفية قوية</small></button>
 <button type="button" onClick={()=>{setMode('quote');setFormat('square');setSkin('ivory');setTextSize(70);setSideMargin(76);setPage(0)}}><strong>اقتباس</strong><small>بطاقة مربعة هادئة</small></button>
 <button type="button" onClick={()=>{setMode('statement');setFormat('portrait');setSkin('white');setTextSize(43);setSideMargin(120);setLineSpacing(1.65);setPage(0)}}><strong>بيان رسمي</strong><small>نص متعدد الصفحات</small></button>
 </div></details>
 <details className="studio-options"><summary>لوحات الألوان</summary><div className="studio-palette-grid">{(Object.keys(skins) as Skin[]).filter(k=>k!=='custom').map(k=><button type="button" key={k} className={skin===k?'studio-palette-swatch selected':'studio-palette-swatch'} onClick={()=>setSkin(k)} title={k} aria-label={'اختيار لوحة '+k}><span style={{background:skins[k].bg}}/><span style={{background:skins[k].accent}}/><small>{({forest:'أخضر ساس',ink:'حبر',ivory:'عاجي',navy:'كحلي',olive:'زيتي',stone:'حجري',rose:'وردي',charcoal:'فحمي',midnight:'ليل',burgundy:'خمري',cobalt:'أزرق ملكي',teal:'فيروزي',sand:'رملي',white:'أبيض',slate:'رمادي مزرق',plum:'برقوقي',emerald:'زمردي',terracotta:'طوبي'} as Record<string,string>)[k]}</small></button>)}
 <button type="button" className={skin==='custom'?'studio-palette-swatch selected':'studio-palette-swatch'} onClick={()=>setSkin('custom')}><span style={{background:customBg}}/><span style={{background:customAccent}}/><small>ألوان مخصصة</small></button></div>
 {skin==='custom'&&<div className="studio-custom-colors"><label>لون الخلفية<input type="color" value={customBg} onChange={e=>setCustomBg(e.target.value)}/></label><label>لون النص<input type="color" value={customFg} onChange={e=>setCustomFg(e.target.value)}/></label><label>اللون المميز<input type="color" value={customAccent} onChange={e=>setCustomAccent(e.target.value)}/></label><label>لون النص الثانوي<input type="color" value={customDim} onChange={e=>setCustomDim(e.target.value)}/></label></div>}
 </details>
 <details className="studio-options"><summary>قوالبك المحفوظة</summary><div className="studio-saved-presets">{presets.length?presets.map(p=><div key={p.name}><button type="button" onClick={()=>applyPreset(p)}>{p.name}</button><button type="button" className="studio-delete-preset" aria-label={'حذف '+p.name} onClick={()=>deletePreset(p.name)}>×</button></div>):<p className="studio-note">لم تحفظ قوالب بعد. اضبط التصميم ثم احفظه باسم.</p>}</div><label>اسم القالب<input value={presetName} maxLength={40} placeholder="مثلاً: خبر حضرموت – أخضر" onChange={e=>setPresetName(e.target.value)}/></label><button type="button" onClick={savePreset}>حفظ إعدادات التصميم الحالية</button>{presetError&&<p role="alert" className="studio-note">{presetError}</p>}</details>

 <details className="studio-options"><summary>ضبط النص والمساحات</summary>
 <label>حجم العنوان: {textSize}px<input type="range" min={32} max={120} step={2} value={textSize} onChange={e=>setTextSize(Number(e.target.value))}/></label>
 <label>حجم عنوان البيان: {titleSize}px<input type="range" min={36} max={100} step={2} value={titleSize} onChange={e=>setTitleSize(Number(e.target.value))}/></label>
 <label>حجم الملخص: {summarySize}px<input type="range" min={18} max={48} step={1} value={summarySize} onChange={e=>setSummarySize(Number(e.target.value))}/></label>
 <label>الهامش الأساسي: {sideMargin}px<input type="range" min={30} max={220} step={2} value={sideMargin} onChange={e=>setSideMargin(Number(e.target.value))}/></label>
 <label>هامش إضافي يمينًا: {marginRight}px<input type="range" min={0} max={240} step={4} value={marginRight} onChange={e=>setMarginRight(Number(e.target.value))}/></label>
 <label>هامش إضافي يسارًا: {marginLeft}px<input type="range" min={0} max={240} step={4} value={marginLeft} onChange={e=>setMarginLeft(Number(e.target.value))}/></label>
 <label>خط العنوان<select value={headlineFont} onChange={e=>setHeadlineFont(e.target.value as FontChoice)}><option value="tajarib">تجاريب طويل</option><option value="sans">ثمانية سانس</option></select></label>
 <label>خط الملخص<select value={summaryFont} onChange={e=>setSummaryFont(e.target.value as FontChoice)}><option value="sans">ثمانية سانس</option><option value="tajarib">تجاريب طويل</option></select></label>
 <label>خط البيانات والتصنيف<select value={metaFont} onChange={e=>setMetaFont(e.target.value as FontChoice)}><option value="sans">ثمانية سانس</option><option value="tajarib">تجاريب طويل</option></select></label>
 <label>نسخة شعار ساس<select value={logoVariant} onChange={e=>setLogoVariant(e.target.value as LogoVariant)}><option value="color">النسخة الملونة</option><option value="dark">النسخة الداكنة</option><option value="light">النسخة الفاتحة</option></select></label>
 <label>تباعد الأسطر: {lineSpacing.toFixed(2)}<input type="range" min={1.1} max={2.1} step={0.05} value={lineSpacing} onChange={e=>setLineSpacing(Number(e.target.value))}/></label>
 <label>المسافة بين العنوان والتفاصيل: {detailSpacing}px<input type="range" min={0} max={110} step={2} value={detailSpacing} onChange={e=>setDetailSpacing(Number(e.target.value))}/></label>
 <label>محاذاة العنوان<select value={align} onChange={e=>setAlign(e.target.value as Align)}><option value="right">يمين</option><option value="center">وسط</option></select></label>
 <label>موضع المحتوى رأسيًا<select value={vertical} onChange={e=>setVertical(e.target.value as 'top'|'center'|'bottom')}><option value="top">أعلى</option><option value="center">وسط</option><option value="bottom">أسفل</option></select></label>
 <label>وزن الخط<select value={textWeight} onChange={e=>setTextWeight(Number(e.target.value) as Weight)}><option value={300}>نحيف</option><option value={400}>عادي</option><option value={500}>متوسط</option><option value={700}>عريض</option></select></label>
 <label><input type="checkbox" checked={underline} onChange={e=>setUnderline(e.target.checked)}/> وضع خط تحت العنوان</label>
 <label>موضع المصدر<select value={sourcePlacement} onChange={e=>setSourcePlacement(e.target.value as SourcePlacement)}><option value="after-summary">بعد الملخص</option><option value="before-summary">قبل الملخص</option></select></label>
 </details>

 {(mode==='news'||mode==='urgent')&&<details className="studio-options"><summary>الصورة الرئيسية للخبر أو العاجل</summary>
 <label>إضافة صورة رئيسية<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void loadMedia(e.target.files?.[0],'news')}/></label>
 {newsImage&&<><button type="button" onClick={()=>setNewsImage(null)}>حذف الصورة الرئيسية</button>
 <label>موضع الصورة<select value={photoPosition} onChange={e=>setPhotoPosition(e.target.value as PhotoPosition)}><option value="left">يسار النص</option><option value="right">يمين النص</option><option value="top">أعلى العنوان</option><option value="background">خلفية خافتة</option></select></label>
 <label>طريقة العرض<select value={photoFit} onChange={e=>setPhotoFit(e.target.value as PhotoFit)}><option value="cover">قص لملء المساحة</option><option value="contain">احتواء الصورة كاملة</option></select></label>
 <label>حجم إطار الصورة: {photoScale}%<input type="range" min={45} max={130} step={5} value={photoScale} onChange={e=>setPhotoScale(Number(e.target.value))}/></label>
 <label>عرض الإطار: {photoFrameWidth}%<input type="range" min={55} max={150} step={5} value={photoFrameWidth} onChange={e=>setPhotoFrameWidth(Number(e.target.value))}/></label>
 <label>ارتفاع الإطار: {photoFrameHeight}%<input type="range" min={55} max={150} step={5} value={photoFrameHeight} onChange={e=>setPhotoFrameHeight(Number(e.target.value))}/></label>
 <label>تكبير الصورة داخل الإطار: {photoZoom}%<input type="range" min={70} max={220} step={5} value={photoZoom} onChange={e=>setPhotoZoom(Number(e.target.value))}/></label>
 <label>تحريك الصورة أفقيًا: {photoPanX}<input type="range" min={-100} max={100} step={2} value={photoPanX} onChange={e=>setPhotoPanX(Number(e.target.value))}/></label>
 <label>تحريك الصورة رأسيًا: {photoPanY}<input type="range" min={-100} max={100} step={2} value={photoPanY} onChange={e=>setPhotoPanY(Number(e.target.value))}/></label>
 {photoPosition==='background'&&<label><input type="checkbox" checked={hidePathOnBackground} onChange={e=>setHidePathOnBackground(e.target.checked)}/> إخفاء مسار التصنيف فوق الصورة الخلفية</label>}
 {photoPosition==='background'&&<label>شفافية الخلفية: {photoOpacity}%<input type="range" min={15} max={80} step={5} value={photoOpacity} onChange={e=>setPhotoOpacity(Number(e.target.value))}/></label>}
 <label><input type="checkbox" checked={photoRounded} onChange={e=>setPhotoRounded(e.target.checked)}/> تفعيل الاستدارة عند اختيار إطار مستدير</label> <label>شكل إطار الصورة<select value={imageShape} onChange={e=>setImageShape(e.target.value as PhotoShape)}>
 <option value="square">مستطيل حاد</option><option value="rounded">زوايا مستديرة</option><option value="mixed">زوايا مختلطة</option><option value="circle">دائرة</option><option value="oval">بيضاوي</option><option value="hexagon">سداسي</option><option value="angled">غير منتظم</option><option value="fade">حواف متلاشية</option></select></label>
 {(imageShape==='rounded'||imageShape==='mixed')&&<label>استدارة الحواف {imageRadius}px<input type="range" min={0} max={80} step={5} value={imageRadius} onChange={e=>setImageRadius(Number(e.target.value))}/></label>}
 <label>سمك إطار الصورة {imageBorder}px<input type="range" min={0} max={10} step={1} value={imageBorder} onChange={e=>setImageBorder(Number(e.target.value))}/></label>
 <label>مصدر الصورة / حقوقها<input value={imageCredit} maxLength={150} placeholder="تصوير: منصة ساس / © الجهة المصورة" onChange={e=>setImageCredit(e.target.value)}/></label>
 <label><input type="checkbox" checked={showImageCredit} onChange={e=>setShowImageCredit(e.target.checked)}/> إظهار حقوق الصورة</label>
 {showImageCredit&&imageCredit.trim()&&<label>مكان حقوق الصورة<select value={imageCreditPlacement} onChange={e=>setImageCreditPlacement(e.target.value as PhotoCreditPlacement)}><option value="inside">داخل الصورة</option><option value="below">أسفل الصورة</option></select></label>}
 </>}
 </details>}
 {mode==='quote'&&<><label>اسم المتحدث<input value={quoteName} maxLength={100} onChange={e=>setQuoteName(e.target.value)}/></label><label>صفة المتحدث<input value={quoteRole} maxLength={150} onChange={e=>setQuoteRole(e.target.value)}/></label><label>صورة المتحدث (اختيارية، حتى 5MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void loadMedia(e.target.files?.[0],'person')}/></label>{personImage&&<button type="button" onClick={()=>setPersonImage(null)}>حذف صورة المتحدث</button>}</>}
 {(mode==='news'||mode==='urgent'||mode==='quote')&&<details className="studio-options"><summary>السياق الجغرافي (تمهيد لمحرك الخرائط)</summary><label>المنطقة أو المحافظة<input value={location} maxLength={120} placeholder="حضرموت" onChange={e=>setLocation(e.target.value)}/></label><label><input type="checkbox" checked={showLocation} onChange={e=>setShowLocation(e.target.checked)}/> إظهار اسم الموقع في البطاقة</label></details>}
 {mediaError&&<p role="alert" className="admin-feedback">{mediaError}</p>}
 <label>اسم المصدر (اختياري)<input value={sourceName} maxLength={120} placeholder="وكيل حضرموت الإخباري" onChange={e=>setSourceName(e.target.value)}/></label>
 <label>رابط المصدر (اختياري)<input dir="ltr" type="url" placeholder="https://..." value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)}/></label>
 {(sourceUrl||sourceName)&&<p className="studio-note">المصدر جزء من المادة التحريرية، ويظهر داخل منطقة المحتوى لا في تذييل الشعار والتاريخ.</p>}
 {mode==='statement'&&<><label>الجهة المصدرة<input value={issuer} maxLength={160} onChange={e=>setIssuer(e.target.value)}/></label>
 <label>شعار الجهة (اختياري · PNG/JPEG/WebP · 5MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void setIssuerImage(e.target.files?.[0])}/></label>
 {issuerLogo&&<button type="button" onClick={()=>{setIssuerLogo(null);setIssuerLogoError('')}}>حذف شعار الجهة</button>}
 {issuerLogoError&&<p role="alert" className="admin-feedback">{issuerLogoError}</p>}
 <label>متن البيان الكامل<textarea rows={12} value={body} onChange={e=>{setBody(e.target.value);setPage(0)}} placeholder="الصق البيان بكامل فقراته. سيُقسم إلى صفحات تلقائيًا." /></label></>}
 <p className="studio-note">سيُربط مسار الملف والقضية والحدث بالمادة التحريرية في مرحلة تكامل لاحقة. هذه النسخة مخصصة لمحرك التصميم والتصدير.</p>
 <label><input type="checkbox" checked={showWeekday} onChange={e=>setShowWeekday(e.target.checked)}/> إظهار اسم اليوم مع التاريخ</label>
 <label>التاريخ<input dir="ltr" value={date} onChange={e=>setDate(e.target.value)} pattern="[0-9]{4}/[0-9]{2}/[0-9]{2}"/></label>
 {error&&<p role="alert" className="admin-feedback">{error}</p>}
 <button type="button" onClick={()=>void exportPages()} disabled={exporting||!!error||!count||!logo}>{exporting?'جارٍ التصدير…':count>1?'تصدير جميع الصفحات PNG':'تصدير PNG'}</button>
 <p className="studio-note">الشعار دائمًا على أرضية فاتحة. في البيان الرسمي يُقسّم المتن تلقائيًا مع بقاء النص كاملًا في المحرر. راجع ترتيب الصفحات قبل النشر.</p>
 </section>
 <section className="studio-preview"><div className="studio-preview-header"><h2>معاينة التصميم</h2><span>{count>0?'صفحة '+(page+1)+' من '+count:'بانتظار النص'}</span></div>
 <div className="studio-canvas-stage" style={{aspectRatio:dimensions(cfg).w+'/'+dimensions(cfg).h}}>
  <canvas ref={canvas} role="img" aria-label="معاينة صفحة صورة الخبر"/>
  {(mode==='news'||mode==='urgent')&&scene.length>0&&<svg className="studio-interaction-layer" viewBox={'0 0 '+dimensions(cfg).w+' '+dimensions(cfg).h} preserveAspectRatio="none" role="group" aria-label="تحديد عناصر التصميم" onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture}>
   {scene.map(element=>{const selected=selectedElement===element.id,points:Record<ResizeHandle,{x:number;y:number}>={nw:{x:element.x,y:element.y},n:{x:element.x+element.width/2,y:element.y},ne:{x:element.x+element.width,y:element.y},e:{x:element.x+element.width,y:element.y+element.height/2},se:{x:element.x+element.width,y:element.y+element.height},s:{x:element.x+element.width/2,y:element.y+element.height},sw:{x:element.x,y:element.y+element.height},w:{x:element.x,y:element.y+element.height/2}};return <g key={element.id}>
    <rect className={selected?'studio-interaction-target is-selected':'studio-interaction-target'} x={element.x} y={element.y} width={Math.max(1,element.width)} height={Math.max(1,element.height)} onPointerDown={event=>beginGesture(event,element,'move')}><title>{element.label} – انقر للتحديد واسحب للتحريك</title></rect>
    {selected&&resizeHandles.map(handle=>{const point=points[handle],size=18;return <rect key={handle} className={'studio-resize-handle handle-'+handle} x={point.x-size/2} y={point.y-size/2} width={size} height={size} rx={3} onPointerDown={event=>beginGesture(event,element,'resize',handle)}><title>تحجيم {element.label}</title></rect>})}
   </g>})}
  </svg>}
 </div>
 <div className="studio-selection-status"><span>{activeSceneElement?'العنصر المحدد: '+activeSceneElement.label:'انقر على العنوان أو الموجز أو الصورة لتحديده، ثم اسحبه للتحريك'}</span>{activeSceneElement&&<button type="button" onClick={()=>setSelectedElement(null)}>إلغاء التحديد</button>}</div>
 {count>1&&<div className="studio-pager"><button type="button" disabled={page===0} onClick={()=>setPage(v=>v-1)}>السابقة</button><span>{page+1} / {count}</span><button type="button" disabled={page===count-1} onClick={()=>setPage(v=>v+1)}>التالية</button></div>}
 </section></div></div>;
}
