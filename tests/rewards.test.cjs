const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../menu-bridge.js','utf8');
function fixture(){
 const made=[],listeners={};
 class Element{
  constructor(){this.children=[];this.dataset={};this.style={};this.classList={add(){}};made.push(this);}
  append(...nodes){this.children.push(...nodes)} replaceChildren(...nodes){this.children=nodes}
  setAttribute(k,v){this[k]=v} addEventListener(){} remove(){} querySelectorAll(){return []}
  querySelector(sel){return this.children.find(x=>sel==='.'+x.className)||null}
 }
 const option=new Element();option.dataset={k:'clothes',id:'casaco'};
 const options=new Element(),msg=new Element(),selection={gender:'homem',selected:{clothes:'casaco'}},piece={id:'casaco',rewardOnly:true,unlockId:'casaco',purchasable:false,price:0};
 const api={catalog:{catalogVersion:'test',characters:{homem:{items:{clothes:[piece]}}}},get:()=>selection,load(){}};
 const document={querySelector:()=>null,querySelectorAll:sel=>sel.includes('data-id')?[option]:[],getElementById:id=>id==='options'?options:id==='msg'?msg:null,createElement:()=>new Element(),head:new Element()};
 const parent={postMessage(){}},window={parent,__mfEditorInternal:api,addEventListener:(k,cb)=>listeners[k]=cb};
 vm.runInNewContext(source,{window,document,MutationObserver:class{observe(){}},queueMicrotask:fn=>fn(),Set,Number,Array,Math,String});
 const init=unlocked=>listeners.message({source:parent,origin:'https://game.example',data:{type:'mf-character-init',appearance:selection,balance:999999,owned:['casaco'],unlocked}});
 return {init,option,msg,save:made.find(x=>x.id==='mf-save')};
}
test('ponte bloqueia recompensa mesmo com saldo e ID na lista de compras; libera só com direito recebido',()=>{const f=fixture();f.init([]);assert.equal(f.option.disabled,true);assert.equal(f.save.disabled,true);assert.match(f.msg.textContent,/conquistada/);f.init(['casaco']);assert.equal(f.option.disabled,false);assert.equal(f.save.disabled,false);});
test('editor salva modo recompensa para os dois gêneros de uma roupa unissex',async()=>{
 const source=fs.readFileSync(__dirname+'/../index.html','utf8'),start=source.indexOf('function mfPurchaseEditor('),end=source.indexOf('function renderItems(',start);
 const chars={homem:{items:{clothes:[{id:'casaco',name:'Casaco',purchasable:true,price:100}]}},mulher:{items:{clothes:[{id:'casaco',name:'Casaco',purchasable:true,price:100}]}}};
 const card={children:[],append(...v){this.children.push(...v)}},document={createElement:()=>({children:[],style:{},append(...v){this.children.push(...v)},setAttribute(){}})};
 const ctx={document,state:{characters:chars},mfPrice:it=>it.price||0,mfCurrency:()=> 'coins',mfCoin:String,persist:async()=>{},renderItems(){},status(){}};
 vm.createContext(ctx);vm.runInContext(source.slice(start,end)+';this.edit=mfPurchaseEditor;',ctx);
 ctx.edit('clothes',chars.homem.items.clothes[0],card);
 const select=card.children[0].children[0];assert.ok(select.children.some(x=>x.value==='reward'));
 select.value='reward';await select.onchange();
 for(const char of Object.values(chars)){const it=char.items.clothes[0];assert.equal(it.rewardOnly,true);assert.equal(it.purchasable,false);assert.equal(it.price,0);assert.equal(it.unlockId,'casaco');}
});
