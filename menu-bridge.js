/* Mini Fazenda / menu exportado. A compra é decidida pelo jogo, nunca por este iframe. */
(()=>{'use strict';
 const api=()=>window.__mfEditorInternal;
 const categories=['hair','clothes','eyes','eyebrows','mouths','accessories'];
 const footer=document.querySelector('.export-footer');
 const originalButtons=footer?.querySelectorAll('button')||[];
 originalButtons.forEach(b=>b.remove());
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Descartar alterações';cancel.id='mf-discard';
 const total=document.createElement('span');total.id='mf-cost';total.style.cssText='margin-left:auto;display:inline-flex;gap:5px;align-items:center;font-size:15px';
 const save=document.createElement('button');save.type='button';save.id='mf-save';save.textContent='SALVAR';
 footer?.append(cancel,total,save);
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
 function refresh(){
  const q=quote(),enough=q.valid&&q.totals.coins<=balance&&q.totals.miniGrana<=miniBalance;
  total.textContent='🪙 '+money(q.totals.coins)+'  ·  💵 '+money(q.totals.miniGrana);
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
 `;
 document.head.append(compactStyle);
 const version=api()?.catalog?.catalogVersion||null;
 window.parent.postMessage({type:'mf-character-ready',catalogVersion:version},'*');
 refresh();
})();
