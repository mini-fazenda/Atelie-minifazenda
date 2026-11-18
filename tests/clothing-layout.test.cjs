'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function individualItem(');
const end = html.indexOf('function modeMap(', start);
assert.ok(start >= 0 && end > start, 'Funcoes de layout individual do editor ausentes');

const helpers = new Function(`
 const cloneProject=x=>JSON.parse(JSON.stringify(x));
 const poseDirection=p=>p.endsWith('Back')?'back':'front';
 const clothingSelected=c=>c.items?.clothes?.find(it=>it.id===c.selected?.clothes)||null;
 const positionFor=(c,k,p)=>c.positions[k];
 ${html.slice(start,end)}
 return {individualPositionFor,effectivePositionFor,individualSlot};
`)();

function character(){
 return {
  positions:{body:{x:0,y:55,w:100,z:0}},
  individualParts:{
   idleFront_body:{x:2,y:72,w:75,z:0},
   idleBack_body:{x:4,y:65,w:78,z:0}
  },
  items:{clothes:[{id:'roupa-A'},{id:'roupa-B'}]},
  selected:{clothes:'roupa-A'}
 };
}

test('cada roupa tem seu proprio X, Y e escala, sem afetar a outra',()=>{
 const c=character();
 const a=helpers.individualPositionFor(c,'body','idleFront',true);
 assert.deepEqual([a.x,a.y,a.w],[2,72,75]);
 Object.assign(a,{x:20,y:10,w:140});
 c.selected.clothes='roupa-B';
 const b=helpers.individualPositionFor(c,'body','idleFront',true);
 assert.deepEqual([b.x,b.y,b.w],[2,72,75]);
 Object.assign(b,{x:-5,y:25,w:90});
 assert.deepEqual([a.x,a.y,a.w],[20,10,140]);
 assert.deepEqual([b.x,b.y,b.w],[-5,25,90]);
});

test('mesma roupa compartilha ajuste frontal entre parado/andando, mas costas sao independentes',()=>{
 const c=character();
 helpers.individualPositionFor(c,'body','idleFront',true).w=110;
 assert.equal(helpers.effectivePositionFor(c,'body','walkFront').w,110);
 assert.equal(helpers.effectivePositionFor(c,'body','idleBack').w,78);
 helpers.individualPositionFor(c,'body','idleBack',true).w=95;
 assert.equal(helpers.effectivePositionFor(c,'body','walkBack').w,95);
 assert.equal(helpers.effectivePositionFor(c,'body','idleFront').w,110);
});

test('ao remover a roupa, o corpo original recupera seus ajustes sem ser modificado',()=>{
 const c=character();
 helpers.individualPositionFor(c,'body','idleFront',true).w=200;
 c.selected.clothes=null;
 assert.deepEqual(helpers.effectivePositionFor(c,'body','idleFront'),{x:2,y:72,w:75,z:0});
 assert.equal(c.positions.body.w,100);
 assert.equal(c.individualParts.idleFront_body.w,75);
});

test('menu exportado usa layout da roupa quando desenha o corpo',()=>{
 assert.match(html,/const it=k==='body'\?a\.items\?\.clothes\?\.find\(x=>x\.id===sel\.clothes\)/);
 assert.match(html,/return it\?\.individualLayouts\?\.\[p\.endsWith\('Back'\)\?'back':'front'\]/);
});

test('cartao de roupa tem controle de ajuste individual',()=>{
 assert.match(html,/adjust\.textContent='Ajustar escala e posição'/);
 assert.match(html,/modeMap\('body','idleBack'\)\.body='individual'/);
});
