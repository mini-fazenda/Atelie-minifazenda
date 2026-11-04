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
 compactStyle.textContent=`@media(max-width:700px){
 html,body{overflow:hidden!important;max-height:100dvh}
 body{padding:3px!important;font-size:11px!important}
 .box{padding:6px!important;border-width:2px!important;border-radius:10px!important;box-shadow:none!important}
 h1{font-size:17px!important;margin:0 0 4px!important}
 .grid{display:grid!important;grid-template-columns:minmax(0,32%) minmax(0,1fr)!important;gap:5px!important}
 .grid>*{min-width:0!important}
 .preview{width:100%!important;max-width:135px!important;padding:2px!important;border-width:1px!important;border-radius:8px!important;margin:0 auto!important}
 .palette-line{gap:3px!important;margin:1px 0!important;font-size:10px!important}
 .swatches{gap:2px!important}.swatches button{width:16px!important;height:16px!important;min-width:16px!important;padding:0!important}
 #options{height:min(46dvh,275px)!important;min-height:100px!important;overflow-y:auto!important;overscroll-behavior:contain}
 .group{padding:4px!important;border-width:1px!important;border-radius:7px!important}
 .group h3{font-size:12px!important;margin:2px 0 4px!important}
 .opts{grid-template-columns:repeat(auto-fill,minmax(54px,1fr))!important;gap:3px!important}
 .opts>button{min-height:58px!important;padding:3px!important;border-width:1px!important;border-radius:6px!important;font-size:10px!important}
 .opts img{width:40px!important;height:40px!important}
 #genders button,#poses button,.category-tabs button,.export-footer button{padding:4px 6px!important;border-width:1px!important;border-radius:7px!important;font-size:11px!important}
 .buttons,.category-tabs{gap:3px!important}.export-footer{margin-top:5px!important;padding-top:5px!important;border-width:1px!important}
 .purchase-price{font-size:9px!important;min-height:15px!important;padding:1px 3px!important;border-width:1px!important}
 #msg{font-size:10px!important;margin-top:3px!important}
 }`;
 document.head.append(compactStyle);
 const version=api()?.catalog?.catalogVersion||null;
 window.parent.postMessage({type:'mf-character-ready',catalogVersion:version},'*');
 refresh();
})();
