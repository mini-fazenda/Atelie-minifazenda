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
 const version=api()?.catalog?.catalogVersion||null;
 window.parent.postMessage({type:'mf-character-ready',catalogVersion:version},'*');
 refresh();
})();
