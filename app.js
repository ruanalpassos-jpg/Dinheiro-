const $=s=>document.querySelector(s);
const KEY='fin_nu_v1';
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return{carry:0,saved:0,cur:{start:Date.now(),items:[]},hist:[]}}
let S=load(),tab='dia';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const brl=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dt=t=>new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tot(items){const r={i:0,o:0,d:0,w:0};items.forEach(x=>{if(x.t=='in')r.i+=x.v;else if(x.t=='out')r.o+=x.v;else if(x.t=='dep')r.d+=x.v;else r.w+=x.v});return r}
const bal=()=>{const t=tot(S.cur.items);return Math.round((S.carry+t.i-t.o-t.d+t.w)*100)/100};
const IC={in:'⬆️',out:'🛍️',dep:'🐷',wd:'💸'},SG={in:'+',out:'−',dep:'→ ',wd:'← '},CL={in:'in',out:'out',dep:'tr',wd:'tr'};
function itemRow(x,del){return`<div class="it"><div class="ic">${IC[x.t]}</div><div class="nm"><b>${esc(x.name)}</b><span>${dt(x.d)}${x.t=='dep'?' · guardado':x.t=='wd'?' · retirado':''}</span></div><div class="v ${CL[x.t]}">${SG[x.t]}${brl(x.v)}</div>${del?`<button class="x" onclick="del(${x.id})" aria-label="Apagar">×</button>`:''}</div>`}
function render(){
document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==tab));
const t=tot(S.cur.items),a=$('#app');
$('#sub').textContent='Quinzena aberta desde '+dt(S.cur.start);
if(tab=='dia'){
const its=S.cur.items.slice().reverse();
a.innerHTML=`<div class="card"><div class="lbl">Dinheiro do dia a dia</div><div class="big">${brl(bal())}</div>
<div class="row"><div class="mini"><span class="lbl">Recebido</span><b class="in">${brl(t.i)}</b></div><div class="mini"><span class="lbl">Gasto</span><b class="out">${brl(t.o)}</b></div></div>
${S.carry?`<p class="lbl" style="margin:10px 0 0">Inclui ${brl(S.carry)} que sobrou da quinzena anterior</p>`:''}
<div class="acts"><button class="btn" onclick="openAdd('dia','in')">Recebi</button><button class="btn" onclick="openAdd('dia','out')">Gastei</button></div></div>
<div class="card"><div class="lbl">Guardado agora</div><b style="font-size:20px">${brl(S.saved)}</b></div>
<h2>Lançamentos da quinzena</h2><div class="card">${its.length?its.map(x=>itemRow(x,true)).join(''):'<div class="vazio">Nada lançado ainda.</div>'}</div>
<button class="btn alt" onclick="askClose()">Finalizar quinzena</button>`}
else if(tab=='sv'){
const its=S.cur.items.filter(x=>x.t=='dep'||x.t=='wd').reverse();
a.innerHTML=`<div class="card"><div class="lbl">Dinheiro guardado</div><div class="big">${brl(S.saved)}</div>
<p class="lbl" style="margin:0">Guardar tira do dia a dia. Retirar devolve pro dia a dia.</p>
<div class="acts"><button class="btn" onclick="openAdd('sv','dep')">Guardar</button><button class="btn alt" onclick="openAdd('sv','wd')">Retirar</button></div></div>
<h2>Movimentos desta quinzena</h2><div class="card">${its.length?its.map(x=>itemRow(x,true)).join(''):'<div class="vazio">Nenhum movimento ainda.</div>'}</div>`}
else{
const h=S.hist.slice().reverse();
a.innerHTML=`<div class="card"><div class="lbl">Quinzenas finalizadas</div><div class="big">${S.hist.length}</div><p class="lbl" style="margin:0">Toque numa quinzena para ver todos os recibos.</p></div>`+
(h.length?h.map(q=>`<div class="card hc" onclick="openHist(${q.id})"><div class="lbl">${dt(q.start)} a ${dt(q.end)}</div><div class="big">${brl(q.saldo)}</div>
<div class="row"><div class="mini"><span class="lbl">Recebido</span><b class="in">${brl(q.t.i)}</b></div><div class="mini"><span class="lbl">Gasto</span><b class="out">${brl(q.t.o)}</b></div><div class="mini"><span class="lbl">Guardado</span><b class="tr">${brl(q.t.d-q.t.w)}</b></div></div></div>`).join(''):'<div class="vazio">Ainda não finalizou nenhuma quinzena.</div>')}
window.scrollTo(0,0)}
function sheet(h){closeSheet();const o=document.createElement('div');o.className='ov';o.id='ov';o.innerHTML='<div class="sh">'+h+'</div>';o.addEventListener('click',e=>{if(e.target===o)closeSheet()});document.body.appendChild(o)}
function closeSheet(){const o=$('#ov');if(o)o.remove()}
let cur={k:'',t:''};
function openAdd(k,t){cur={k,t};
const opts=k=='dia'?[['in','Recebi'],['out','Gastei']]:[['dep','Guardar'],['wd','Retirar']];
sheet(`<h3>${k=='dia'?'Novo lançamento':'Dinheiro guardado'}</h3><div class="seg">${opts.map(o=>`<button data-t="${o[0]}" class="${o[0]==t?'on':''}" onclick="pick('${o[0]}')">${o[1]}</button>`).join('')}</div>
<input id="fn" placeholder="${k=='dia'?'O que foi? (ex: mercado, salário)':'Nome (opcional)'}" maxlength="60" autocomplete="off">
<input id="fv" placeholder="Valor (R$)" inputmode="decimal" autocomplete="off">
<div class="err" id="er"></div><button class="btn" onclick="add()">Salvar</button>`);
setTimeout(()=>{const f=$('#fn');if(f)f.focus()},50)}
function pick(t){cur.t=t;document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.t==t))}
function add(){
const name=$('#fn').value.trim();
let v=parseFloat($('#fv').value.replace(/\./g,'').replace(',','.'));
if($('#fv').value.indexOf(',')<0)v=parseFloat($('#fv').value);
const er=m=>$('#er').textContent=m;
if(!(v>0))return er('Digite um valor maior que zero.');
v=Math.round(v*100)/100;
if(cur.k=='dia'&&!name)return er('Digite o nome do lançamento.');
if(cur.t=='dep'&&v>bal())return er('Você só tem '+brl(bal())+' no dia a dia pra guardar.');
if(cur.t=='wd'&&v>S.saved)return er('Você só tem '+brl(S.saved)+' guardado.');
const nm=name||(cur.t=='dep'?'Guardei':'Retirei');
S.cur.items.push({id:Date.now(),t:cur.t,name:nm,v,d:Date.now()});
if(cur.t=='dep')S.saved=Math.round((S.saved+v)*100)/100;
if(cur.t=='wd')S.saved=Math.round((S.saved-v)*100)/100;
save();closeSheet();render()}
function del(id){
const x=S.cur.items.find(i=>i.id==id);if(!x)return;
if(x.t=='dep'&&S.saved<x.v)return sheet('<h3>Não dá pra apagar</h3><p>Esse valor já foi retirado do guardado. Apague a retirada primeiro.</p><button class="btn" onclick="closeSheet()">Ok</button>');
sheet(`<h3>Apagar lançamento?</h3><p>${esc(x.name)} · ${brl(x.v)}</p><div class="acts"><button class="btn alt" onclick="closeSheet()">Cancelar</button><button class="btn" onclick="doDel(${id})">Apagar</button></div>`)}
function doDel(id){
const x=S.cur.items.find(i=>i.id==id);if(!x)return;
if(x.t=='dep')S.saved=Math.round((S.saved-x.v)*100)/100;
if(x.t=='wd')S.saved=Math.round((S.saved+x.v)*100)/100;
S.cur.items=S.cur.items.filter(i=>i.id!=id);save();closeSheet();render()}
function askClose(){
if(!S.cur.items.length)return sheet('<h3>Nada pra finalizar</h3><p>Lance pelo menos um recebimento ou gasto antes.</p><button class="btn" onclick="closeSheet()">Ok</button>');
sheet(`<h3>Finalizar quinzena?</h3><p>Ela vai pro histórico com todos os recibos. O saldo de ${brl(bal())} do dia a dia passa pra próxima, e o guardado continua.</p><div class="acts"><button class="btn alt" onclick="closeSheet()">Cancelar</button><button class="btn" onclick="doClose()">Finalizar</button></div>`)}
function doClose(){
S.hist.push({id:Date.now(),start:S.cur.start,end:Date.now(),carry:S.carry,items:S.cur.items,t:tot(S.cur.items),saldo:bal(),guardadoFim:S.saved});
S.carry=bal();S.cur={start:Date.now(),items:[]};save();closeSheet();tab='hist';render()}
function openHist(id){
const q=S.hist.find(h=>h.id==id);if(!q)return;
sheet(`<h3>${dt(q.start)} a ${dt(q.end)}</h3>
<div class="row" style="margin-bottom:8px"><div class="mini"><span class="lbl">Recebido</span><b class="in">${brl(q.t.i)}</b></div><div class="mini"><span class="lbl">Gasto</span><b class="out">${brl(q.t.o)}</b></div></div>
<div class="row" style="margin-bottom:8px"><div class="mini"><span class="lbl">Guardado</span><b class="tr">${brl(q.t.d)}</b></div><div class="mini"><span class="lbl">Retirado</span><b class="tr">${brl(q.t.w)}</b></div></div>
<div class="mini" style="margin-bottom:6px"><span class="lbl">Saldo final do dia a dia${q.carry?' (começou com '+brl(q.carry)+')':''}</span><b>${brl(q.saldo)}</b></div>
<h2 style="margin-left:0">Recibos</h2>${q.items.slice().reverse().map(x=>itemRow(x,false)).join('')}
<button class="btn alt" style="margin-top:14px;width:100%" onclick="closeSheet()">Fechar</button>`)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;render()});
render();
