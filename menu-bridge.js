/* Mini Fazenda / menu exportado. A compra é decidida pelo jogo, nunca por este iframe. */
(()=>{'use strict';
 const api=()=>window.__mfEditorInternal;
 const categories=['hair','clothes','eyes','eyebrows','mouths','accessories'];
 const footer=document.querySelector('.export-footer');
 const originalButtons=footer?.querySelectorAll('button')||[];
 originalButtons.forEach(b=>b.remove());
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Descartar alterações';cancel.id='mf-discard';
 const total=document.createElement('div');total.id='mf-cost';total.setAttribute('aria-live','polite');total.setAttribute('aria-label','Total da personalização');
 const save=document.createElement('button');save.type='button';save.id='mf-save';save.textContent='SALVAR';
 const summary=document.createElement('div');summary.className='mf-price-summary';summary.innerHTML='<div class="mf-price-title">TOTAL DA PERSONALIZAÇÃO</div>';summary.append(total);const counter=document.createElement('div');counter.id='mf-items-count';summary.append(counter);footer?.append(cancel,summary,save);
 let parentOrigin=null,owned=new Set(),balance=0,miniBalance=0,original=null,busy=false;
 const msg=document.getElementById('msg');
 const state=()=>api()?.get?.();
 const money=v=>Math.max(0,Math.floor(Number(v)||0)).toLocaleString('pt-BR');
 function quote(){
  const v=state(),totals={coins:0,miniGrana:0},items=[],seen=new Set();
  if(!v)return {totals,items,valid:true};
  const c=api()?.catalog?.characters?.[v.gender];
  for(const cat of categories){
   const it=c?.items?.[cat]?.find(x=>x.id===v.selected?.[cat]);
   if(!it||!it.purchasable||owned.has(it.id)||seen.has(it.id))continue;
   const n=Number(it.price),currency=it.currency===undefined?'coins':it.currency;
   if(!Number.isSafeInteger(n)||n<1||n>1e9||!['coins','miniGrana'].includes(currency))return {totals,items:[],valid:false};
   totals[currency]+=n;if(!Number.isSafeInteger(totals[currency])||totals[currency]>1e9)return {totals,items:[],valid:false};
   items.push({id:it.id,name:it.name,price:n,currency});seen.add(it.id);
  }
  return {totals,items,valid:true};
 }
 function decoratePrices(){
 const c=api()?.catalog?.characters?.[state()?.gender];
 document.querySelectorAll('#options button[data-id]').forEach(b=>{
 const badge=b.querySelector('.purchase-price');if(!badge||badge.dataset.fixed)return;
 const it=c?.items?.[b.dataset.k]?.find(x=>x.id===b.dataset.id);
 if(!it||!it.purchasable||!Number.isSafeInteger(Number(it.price)))return;
 const mini=it.currency==='miniGrana',icon=document.createElement('span'),amount=document.createElement('span');
 icon.className='mf-item-money-icon '+(mini?'mf-icon-mini':'mf-icon-coin');icon.textContent=mini?'MG':'$';
 amount.textContent=money(it.price);amount.className='mf-item-price-value';
 badge.replaceChildren(icon,amount);badge.dataset.fixed='1';
 badge.setAttribute('aria-label',money(it.price)+(mini?' Mini Granas':' moedas'));
 });
 }
 function refresh(){
  decoratePrices();
  const q=quote(),enough=q.valid&&q.totals.coins<=balance&&q.totals.miniGrana<=miniBalance;
  total.replaceChildren();
  for(const [icon,amount,label] of [['🪙',q.totals.coins,'moedas'],['💵',q.totals.miniGrana,'Mini Granas']]){
   const line=document.createElement('div');line.className='mf-price-line';
   const ico=document.createElement('span');ico.className='mf-price-icon';ico.textContent=icon;
   const val=document.createElement('strong');val.textContent=money(amount);
   const unit=document.createElement('span');unit.textContent=label;
   line.append(ico,val,unit);total.append(line);
  }
  counter.textContent=q.items.length+' '+(q.items.length===1?'item pago selecionado':'itens pagos selecionados');
  save.disabled=busy||!parentOrigin||!enough;
  save.title=!q.valid?'Preço inválido':!enough?'Saldo insuficiente':q.items.length+' item(ns) novo(s)';
  if(msg)msg.textContent=!q.valid?'Preço inválido no catálogo.':!enough?'Saldo insuficiente para uma das moedas.':'Saldo: '+money(balance)+' moedas · '+money(miniBalance)+' Mini Grana.';
 }
 const observer=new MutationObserver(()=>queueMicrotask(refresh));
 if(document.getElementById('options'))observer.observe(document.getElementById('options'),{childList:true,subtree:false});
 if(document.getElementById('genders'))observer.observe(document.getElementById('genders'),{childList:true});
 if(document.getElementById('exportPalettes'))observer.observe(document.getElementById('exportPalettes'),{childList:true});
 const tell=data=>{if(parentOrigin)window.parent.postMessage(data,parentOrigin)};
 cancel.onclick=()=>tell({type:'mf-character-cancel'});
 save.onclick=()=>{const v=state(),q=quote();if(!v||busy||!q.valid||q.totals.coins>balance||q.totals.miniGrana>miniBalance)return;busy=true;refresh();tell({type:'mf-character-save',appearance:v});};
 window.addEventListener('message',event=>{
  if(event.source!==window.parent||!event.data||typeof event.data.type!=='string')return;
  const m=event.data;
  if(m.type==='mf-character-init'){
   if(parentOrigin&&event.origin!==parentOrigin)return;
   parentOrigin=event.origin;owned=new Set(Array.isArray(m.owned)?m.owned.filter(x=>typeof x==='string'):[]);balance=Math.max(0,Number(m.balance)||0);miniBalance=Math.max(0,Number(m.miniGrana)||0);original=m.appearance||null;
   if(original)api()?.load?.(original);refresh();
  }else if(event.origin===parentOrigin&&m.type==='mf-character-result'){
   busy=false;if(m.ok){if(msg)msg.textContent='Personagem salvo.';balance=Math.max(0,Number(m.balance)||balance);miniBalance=Math.max(0,Number(m.miniGrana)||0);for(const id of m.owned||[])owned.add(id);refresh();}
   else{if(msg)msg.textContent=String(m.reason||'Não foi possível salvar.');refresh();}
  }
 });
 // Reorganiza somente o menu embutido: não altera sprites, catálogo ou lógica de compra.
 const layoutGrid=document.querySelector('.grid');
 const rightPanel=layoutGrid?.children?.[1];
 const palette=document.querySelector('.color-box');
 if(rightPanel&&palette){
  rightPanel.insertBefore(palette,rightPanel.firstChild);
  palette.classList.add('mf-palette-top');
 }
 const title=document.querySelector('.box h1');
 if(title&&!document.getElementById('mf-subtitle')){
  const subtitle=document.createElement('div');subtitle.id='mf-subtitle';
  subtitle.textContent='Personalize o visual do seu avatar';
  title.insertAdjacentElement('afterend',subtitle);
 }
 const compactStyle=document.createElement('style');
 compactStyle.textContent=`
 /* Layout do menu incorporado: sempre duas colunas, independentemente do iframe. */
 html,body{height:100%;max-height:100%;overflow:hidden!important}
 body{padding:5px!important;font-size:12px!important}
 .box{width:100%!important;max-width:100%!important;height:100%!important;max-height:100%!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;padding:9px!important;border-width:2px!important;border-radius:12px!important;box-shadow:none!important}
 h1{font-size:clamp(15px,2.4vw,21px)!important;margin:0 0 6px!important;line-height:1.15!important;-webkit-text-stroke:1px var(--wood-edge)!important}
 #genders{margin-bottom:5px!important}
 #genders button,.category-tabs button,.export-footer button{padding:5px 8px!important;font-size:11px!important;border-width:1px!important;border-radius:7px!important;box-shadow:none!important}
 .buttons,.category-tabs{gap:4px!important}
 .color-box{padding:6px!important;margin-bottom:7px!important;gap:3px!important;border-width:1px!important;border-radius:9px!important;flex-shrink:0}
 .palette-line{display:flex!important;align-items:center!important;gap:7px!important;min-height:18px!important}
 .palette-line>span{font-size:10px!important;min-width:104px!important}
 .swatches{gap:5px!important}
 .swatch{width:17px!important;height:17px!important;border-width:1px!important;box-shadow:0 0 0 1px #8dbd67!important}
 .swatch.active{box-shadow:0 0 0 2px #5d8f38!important}
 .grid{display:grid!important;grid-template-columns:minmax(0,34%) minmax(0,1fr)!important;gap:8px!important;align-items:start!important;min-height:0!important;flex:1!important;overflow:hidden!important}
 .grid>div{min-width:0!important;min-height:0!important}
 .grid>div:first-child{display:flex!important;justify-content:flex-start!important;align-items:center!important;flex-direction:column!important}
 .preview{width:100%!important;max-width:190px!important;max-height:min(43dvh,235px)!important;aspect-ratio:360/440!important;padding:3px!important;border-width:1px!important;border-radius:9px!important;box-shadow:none!important;flex-shrink:1!important}
 .preview>#c{width:100%!important;height:100%!important;max-height:100%!important;object-fit:contain!important;border-radius:6px!important}
 #poses{display:none!important}
 .grid>div:last-child{display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}
 .category-tabs{flex-shrink:0!important;margin:0 0 5px!important}
 #options{height:auto!important;min-height:0!important;max-height:none!important;flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;padding-right:3px!important}
 #options::-webkit-scrollbar{width:5px!important}
 .group{padding:6px!important;border-width:1px!important;border-radius:8px!important;box-shadow:none!important}
 .group h3{font-size:14px!important;margin:0 0 5px!important;-webkit-text-stroke:1px var(--wood-edge)!important}
 .opts{grid-template-columns:repeat(auto-fill,minmax(66px,1fr))!important;gap:5px!important}
 .opts>button{min-height:78px!important;padding:4px 3px!important;gap:3px!important;border-width:1px!important;border-radius:8px!important;box-shadow:none!important;font-size:10px!important}
 .opts img{width:49px!important;height:49px!important;max-width:100%!important}
 .opts span{overflow-wrap:anywhere}
 .purchase-price{font-size:9px!important;min-height:15px!important;padding:1px 3px!important;border-width:1px!important}
 .export-footer{margin-top:5px!important;padding-top:5px!important;border-width:1px!important;flex-shrink:0!important}
 #msg{font-size:10px!important;margin-top:4px!important;line-height:1.2!important;flex-shrink:0!important}
 @media(max-width:520px){
  body{padding:2px!important;font-size:10px!important}
  .box{padding:5px!important;border-radius:8px!important}
  h1{font-size:15px!important}
  .grid{grid-template-columns:minmax(0,34%) minmax(0,1fr)!important;gap:4px!important}
  .preview{max-width:118px!important;max-height:min(36dvh,160px)!important}
  .palette-line{gap:3px!important}
  .palette-line>span{font-size:9px!important;min-width:70px!important}
  .swatches{gap:3px!important}
  .swatch{width:14px!important;height:14px!important}
  .opts{grid-template-columns:repeat(auto-fill,minmax(50px,1fr))!important;gap:3px!important}
  .opts>button{min-height:61px!important;font-size:9px!important;padding:2px!important}
  .opts img{width:36px!important;height:36px!important}
  .category-tabs button,#genders button,.export-footer button{font-size:10px!important;padding:3px 5px!important}
  .color-box{padding:4px!important;margin-bottom:4px!important}
  .group{padding:3px!important}
  .group h3{font-size:12px!important}
 }
 
 /* Aparência inspirada na referência, preservando as cores e os componentes existentes. */
 .box{background:#fff7ed!important;border-color:#d8b99e!important}
 .box h1{color:#633414!important}
 #mf-subtitle{font-size:11px;color:#98745e;margin:-2px 0 5px;flex-shrink:0}
 #genders{display:flex!important;justify-content:center!important;gap:8px!important}
 #genders button{min-width:75px!important}
 .grid{grid-template-columns:minmax(0,31%) minmax(0,1fr)!important;gap:9px!important}
 .grid>div:first-child{background:#fffaf4;border:1px solid #e2c7b2;border-radius:13px;padding:6px}
 .grid>div:last-child{background:#fffaf4;border:1px solid #e2c7b2;border-radius:13px;padding:6px}
 .preview{max-width:175px!important;max-height:min(42dvh,220px)!important;background:#fbefe4!important}
 .mf-palette-top{width:100%;margin:0 0 7px!important;display:flex!important;flex-direction:column!important}
 .category-tabs{display:flex!important;flex-wrap:wrap!important}
 .category-tabs button{background:#f9e8d9!important;color:#683a1e!important;border:1px solid #d9b69d!important}
 .category-tabs button.active{background:#65a52d!important;color:white!important}
 .export-footer{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:9px!important;background:#fff4e9!important;border:1px solid #e0c1a8!important;border-radius:12px!important;padding:8px!important}
 #mf-discard{background:transparent!important;color:#825b47!important;border:1px solid #d9b69d!important}
 #mf-save{background:linear-gradient(#80bd3b,#438a15)!important;color:white!important;font-weight:800!important;min-width:105px!important}
 .mf-price-summary{min-width:0;text-align:center;background:#fffdf7;border:2px solid #dfb88f;border-radius:10px;padding:5px 8px;box-shadow:0 2px 5px #8e60301b}
 .mf-price-title{font-size:10px;font-weight:900;color:#754323;letter-spacing:.045em;margin-bottom:3px}
 #mf-cost{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px 12px}
 .mf-price-line{display:flex;align-items:center;gap:4px;white-space:nowrap;color:#4d2b17;font-size:11px}
 .mf-price-line strong{font-size:17px;font-variant-numeric:tabular-nums}
 .mf-price-icon{font-size:16px}
 #mf-items-count{font-size:9px;color:#9b765c;margin-top:3px}
 @media(max-width:520px){
  .grid{grid-template-columns:minmax(0,30%) minmax(0,1fr)!important;gap:4px!important}
  .grid>div:first-child,.grid>div:last-child{padding:3px!important;border-radius:7px!important}
  .preview{max-width:108px!important;max-height:min(34dvh,145px)!important}
  .export-footer{grid-template-columns:auto minmax(0,1fr) auto!important;gap:3px!important;padding:3px!important;border-radius:7px!important}
  .mf-price-summary{padding:3px!important;border-width:1px!important}
  .mf-price-title{font-size:8px!important;letter-spacing:0!important}
  #mf-cost{gap:1px 5px!important}
  .mf-price-line{font-size:9px!important;gap:2px!important}
  .mf-price-line strong{font-size:12px!important}
  .mf-price-icon{font-size:11px!important}
  #mf-items-count{font-size:8px!important}
  #mf-discard,#mf-save{min-width:0!important;padding:4px!important;font-size:9px!important}
  #mf-subtitle{font-size:9px!important}
 }
 `;
 compactStyle.textContent+=".category-tabs button{color:#48240d!important;background:#fff0df!important;font-weight:900!important;text-shadow:none!important;-webkit-text-stroke:0!important}.category-tabs button.active{color:white!important;background:#4b8f1c!important}.group h3{color:#51290f!important;background:#ffefdb!important;padding:4px 7px!important;text-shadow:none!important;-webkit-text-stroke:0!important}.purchase-price{display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:center!important;gap:3px!important;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;width:max-content!important;max-width:100%!important;margin:3px auto!important;padding:2px 3px!important;background:#fff5d7!important;border:1px solid #d6b775!important;border-radius:12px!important;font-size:10px!important;line-height:1!important}.mf-price-line{display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;white-space:nowrap!important;gap:4px!important}#mf-cost{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:5px 12px!important}";
 compactStyle.textContent+="#mf-cost .mf-price-icon{font-size:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:18px!important;height:18px!important;flex:0 0 18px!important}#mf-cost .mf-price-line:first-child .mf-price-icon{background:linear-gradient(#ffe477,#dda019)!important;border:2px solid #b98218!important;border-radius:50%!important}#mf-cost .mf-price-line:last-child .mf-price-icon{background:linear-gradient(#83cb6c,#338d3c)!important;border:1px solid #287034!important;border-radius:4px!important}#mf-cost .mf-price-line:first-child .mf-price-icon:before{content:'$';font:bold 11px Arial;color:#80500b}#mf-cost .mf-price-line:last-child .mf-price-icon:before{content:'MG';font:bold 8px Arial;color:white}";
 compactStyle.textContent+=".mf-item-money-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 15px!important;width:15px!important;height:15px!important;font:bold 9px Arial!important}.mf-icon-coin{background:linear-gradient(#ffe477,#dda019)!important;color:#80500b!important;border:2px solid #b98218!important;border-radius:50%!important}.mf-icon-mini{background:linear-gradient(#83cb6c,#338d3c)!important;color:white!important;border:1px solid #287034!important;border-radius:4px!important;font-size:8px!important}.mf-item-price-value{white-space:nowrap!important;display:inline!important;overflow-wrap:normal!important;word-break:normal!important}@media(max-width:520px){.mf-item-money-icon{flex-basis:12px!important;width:12px!important;height:12px!important;font-size:7px!important;border-width:1px!important}}";
 compactStyle.textContent+="\n/* Mobile landscape and compact windows: keep categories and item list visible. */\n@media (max-height:700px), (max-width:650px){\n .box{padding:4px 6px!important;gap:2px!important}\n .box h1{font-size:15px!important;line-height:1!important;margin:0!important}\n #mf-subtitle{font-size:9px!important;margin:0 0 1px!important}\n #genders{margin:0 0 2px!important;gap:5px!important}\n #genders button{min-width:58px!important;padding:2px 7px!important;font-size:10px!important}\n .grid{display:grid!important;grid-template-columns:minmax(105px,27%) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;align-items:stretch!important;gap:5px!important;min-height:0!important;flex:1 1 0!important}\n .grid>div:first-child,.grid>div:last-child{min-height:0!important;overflow:hidden!important;padding:3px!important}\n .grid>div:last-child{display:flex!important;flex-direction:column!important}\n .preview{width:min(100%,155px)!important;max-width:155px!important;height:auto!important;max-height:none!important;aspect-ratio:360/440!important;flex:0 1 auto!important;overflow:hidden!important;padding:2px!important}\n .preview>#c{display:block!important;width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:360/440!important;object-fit:contain!important}\n .mf-palette-top{flex:0 0 auto!important;padding:3px 5px!important;margin:0 0 3px!important;gap:1px!important}\n .palette-line{min-height:16px!important;gap:4px!important}\n .palette-line>span{min-width:112px!important;font-size:10px!important}\n .swatches{gap:3px!important;flex-wrap:wrap!important}\n .swatch{width:16px!important;height:16px!important}\n .category-tabs{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin!important;min-height:30px!important;flex:0 0 auto!important;gap:3px!important;margin:0 0 3px!important;padding:1px!important}\n .category-tabs button{flex:0 0 auto!important;white-space:nowrap!important;padding:3px 6px!important;font-size:10px!important;min-height:25px!important}\n #options{display:block!important;flex:1 1 0!important;min-height:0!important;height:auto!important;overflow-y:auto!important;overflow-x:hidden!important}\n .opts{grid-template-columns:repeat(auto-fill,minmax(55px,1fr))!important;gap:3px!important}\n .opts>button{min-height:62px!important;padding:2px!important;font-size:9px!important}\n .opts img{width:34px!important;height:34px!important}\n .export-footer{flex:0 0 auto!important;grid-template-columns:minmax(0,95px) minmax(0,1fr) minmax(0,85px)!important;gap:4px!important;padding:3px 5px!important;margin-top:2px!important}\n .mf-price-summary{padding:2px 4px!important;border-width:1px!important}\n .mf-price-title{font-size:9px!important;margin-bottom:1px!important}\n .mf-price-line{font-size:10px!important;gap:2px!important}\n .mf-price-line strong{font-size:12px!important}\n #mf-items-count{font-size:8px!important;margin-top:1px!important}\n #mf-discard,#mf-save{min-width:0!important;padding:3px!important;font-size:9px!important}\n #msg{font-size:9px!important;margin:1px 0 0!important}\n}\n@media (max-width:480px){\n .grid{grid-template-columns:minmax(82px,29%) minmax(0,1fr)!important;gap:3px!important}\n .preview{width:min(100%,110px)!important}\n .palette-line>span{min-width:72px!important;font-size:9px!important}\n .swatch{width:13px!important;height:13px!important}\n .category-tabs button{font-size:9px!important;padding:2px 4px!important}\n .export-footer{grid-template-columns:minmax(0,65px) minmax(0,1fr) minmax(0,58px)!important}\n .mf-price-line{font-size:8px!important}\n .mf-price-line strong{font-size:10px!important}\n}\n";
 document.head.append(compactStyle);
 const version=api()?.catalog?.catalogVersion||null;
 window.parent.postMessage({type:'mf-character-ready',catalogVersion:version},'*');
 refresh();
})();
