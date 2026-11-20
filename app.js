const PRODUCTS=[
  {id:'JL',img:'jabon.jpg',lx:47,ly:48,n:'Jabón lavatrastes',p:'Botella de 750 ml',c:'Limpieza',$:28},
  {id:'PH',img:'papel.jpg',lx:50,ly:52,n:'Papel higiénico',p:'Paquete de 12 rollos',c:'Limpieza',$:96},
  {id:'CL',img:'cloro.jpg',lx:49,ly:56,n:'Cloro',p:'Botella de 1 L · caja 12',c:'Limpieza',$:22},
  {id:'SV',img:'servilletas.jpg',lx:50,ly:58,n:'Servilletas',p:'Paquete de 100 piezas',c:'Limpieza',$:18},
  {id:'OL',img:'olla.jpg',lx:51,ly:28,n:'Olla de acero inoxidable',p:'Con tapa de vidrio',c:'Cocina',$:389},
  {id:'CA',img:'cacerola.jpg',lx:64,ly:40,n:'Cacerola con tapa',p:'Acero inoxidable',c:'Cocina',$:249},
  {id:'SA',img:'sarten.jpg',lx:45,ly:50,n:'Sartén antiadherente',p:'Acabado granito',c:'Cocina',$:329},
  {id:'LI',img:'licuadora.jpg',lx:40,ly:75,n:'Licuadora',p:'Vaso de vidrio',c:'Cocina',$:649},
  {id:'TE',img:'termo.jpg',lx:55,ly:20,n:'Termo',p:'Acero inoxidable',c:'Cocina',$:279},
  {id:'VA',img:'vajilla.jpg',lx:50,ly:38,n:'Vajilla',p:'Platos y tazones',c:'Cocina',$:459},
];
const STEPS=[
  ['Recibido','La solicitud quedó registrada con tu folio.'],
  ['En revisión','Se revisan cantidades y disponibilidad.'],
  ['Aceptado','El pedido puede surtirse con los ajustes indicados.'],
  ['En preparación','El equipo está localizando y preparando tu pedido.'],
  ['Listo para entrega','Te avisaremos cuando pase a este estado.'],
  ['Entregado','El cierre se registra con el mismo folio.'],
];
const DEMO={folio:'MB-2408',step:3,upd:'hace 18 min',adjust:'Un producto puede requerir cambio de presentación. Te avisaremos antes de cerrar la solicitud.'};
// shared by both pages: missing elements get an inert stand-in
const $=s=>document.querySelector(s)||{classList:{add(){},remove(){}},setAttribute(){},scrollIntoView(){}};
const money=n=>'$'+n.toLocaleString('es-MX');
const store={
  get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
let cart=store.get('mb-cart',{}), cat='Todos', term='', exclude='';

/* catalog */
const cats=['Todos',...new Set(PRODUCTS.map(p=>p.c))];
$('#chips').innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join('');
$('#chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.c;
  document.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));renderGrid()};
$('#q').oninput=e=>{term=e.target.value.trim().toLowerCase();renderGrid()};
function renderGrid(){
  const list=PRODUCTS.filter(p=>p.id!==exclude&&(cat==='Todos'||p.c===cat)&&(p.n+' '+p.p).toLowerCase().includes(term));
  $('#grid').innerHTML=list.map(p=>{const q=cart[p.id]||0;return `
  <article class="prod">
    <a class="prodlink" href="producto.html?id=${p.id}"><img class="shot" src="img/${p.img}" alt="${p.n}" loading="lazy"><span class="cat">${p.c.toUpperCase()}</span>
    <h3>${p.n}</h3><span class="pres">${p.p}</span></a>
    <div class="row"><span class="price">${money(p.$)}</span>
    ${q?`<div class="qty"><button data-d="-1" data-id="${p.id}" aria-label="Quitar uno">−</button><output>${q}</output><button data-d="1" data-id="${p.id}" aria-label="Agregar uno">+</button></div>`
       :`<button class="add" data-d="1" data-id="${p.id}">Agregar</button>`}</div>
  </article>`}).join('')||'<p class="empty">No encontramos productos con esa búsqueda.</p>';
}
function change(id,d){cart[id]=Math.max(0,(cart[id]||0)+d);if(!cart[id])delete cart[id];store.set('mb-cart',cart);renderAll()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(b)change(b.dataset.id,+b.dataset.d)});

/* cart */
const items=()=>PRODUCTS.filter(p=>cart[p.id]).map(p=>({...p,q:cart[p.id]}));
const total=()=>items().reduce((s,i)=>s+i.q*i.$,0);
const qtyHTML=i=>`<div class="qty"><button data-d="-1" data-id="${i.id}" aria-label="Quitar uno de ${i.n}">−</button><output>${i.q}</output><button data-d="1" data-id="${i.id}" aria-label="Agregar uno de ${i.n}">+</button></div>`;
// edit=true: drawer (editable); false: read-only summary inside the form
const lineHTML=(i,edit)=>`<div class="line"><img class="lthumb" src="img/${i.img}" alt="" loading="lazy">
  <div class="lmeta"><b>${i.n}</b><small>${i.p} · ${money(i.$)} c/u</small>${edit?qtyHTML(i):`<small>Cantidad: ${i.q}</small>`}</div>
  <div class="lsum">${money(i.q*i.$)}${edit?`<button class="rm" data-d="-${i.q}" data-id="${i.id}">Quitar</button>`:''}</div></div>`;
function renderCart(){
  const it=items(),n=it.reduce((s,i)=>s+i.q,0),art=n+(n===1?' artículo':' artículos');
  $('#count').textContent=n;
  const empty='<div class="emptycart"><img src="img/logo-icono.png" alt="" width="48"><p><b>Tu pedido está vacío</b>Agrega productos del catálogo para armar tu solicitud.</p><a class="btn alt" href="catalogo.html">Ver catálogo</a></div>';
  const tot=`<div class="total"><span>Total de referencia<small>${art} · se confirma al revisar</small></span><span>${money(total())}</span></div>`;
  $('#lines').innerHTML=it.length?'<p class="lhead">Tu pedido</p>'+it.map(i=>lineHTML(i,false)).join('')+tot:empty;
  $('#drawerBody').innerHTML=it.length?it.map(i=>lineHTML(i,true)).join(''):empty;
  $('#drawerFoot').innerHTML=it.length?tot:'';
  $('#toForm').classList[it.length?'remove':'add']('hide');
  $('#drawerCount').textContent=n?art:'';
}
/* product detail (producto.html?id=XX) */
const cur=PRODUCTS.find(p=>p.id===new URLSearchParams(location.search).get('id'));
// shortcut: views are crops of the one illustration, replace with real photos per product when they exist
const VIEWS=[{z:1,x:50,y:50,t:'Vista completa'},{z:2.1,x:cur?.lx??50,y:cur?.ly??62,t:'Detalle'}];
const packOf=p=>{const m=/caja (\d+)/.exec(p.p);return m?+m[1]:0};
let dq=1,gi=0,vi=0;
const view=(p,v)=>`<span class="vw"><img src="img/${p.img}" alt="${p.n} · ${v.t}" style="--z:${v.z};--ox:${v.x}%;--oy:${v.y}%"></span>`;
function renderDetail(){
  const box=document.querySelector('#detail');if(!box)return;
  if(!cur){box.innerHTML='<p class="empty">No encontramos ese producto. <a class="link" href="catalogo.html">Volver al catálogo</a></p>';return}
  const pack=packOf(cur),mult=vi?pack:1,inCart=cart[cur.id]||0;
  const opts=pack?[{l:'Pieza',pr:cur.$},{l:'Caja de '+pack,pr:cur.$*pack}]:[];
  const wa=WA(`Hola, quiero pedir ${dq*mult} × ${cur.n} (${cur.p}) en Distribuciones MB.`);
  box.innerHTML=`
  <nav class="crumbs" aria-label="Ruta"><a href="catalogo.html">Catálogo</a> › <a href="catalogo.html">${cur.c}</a> › <span>${cur.n}</span></nav>
  <div class="pd">
    <div class="gal">
      <div class="rail">${VIEWS.map((v,i)=>`<button class="th${i===gi?' on':''}" data-gi="${i}" aria-label="${v.t}">${view(cur,v)}</button>`).join('')}</div>
      <div class="gcol">
        <div class="gmain" id="gmain">${view(cur,VIEWS[gi])}
          <button class="arr l" data-g="-1" aria-label="Imagen anterior">‹</button><button class="arr r" data-g="1" aria-label="Imagen siguiente">›</button></div>
        <p class="cap">${gi+1} / ${VIEWS.length} · Pasa el mouse para acercar</p>
      </div>
    </div>
    <div class="pd-info">
      <h1>${cur.n}</h1>
      <p class="by">Vendido por <b>Distribuciones MB</b></p>
      ${pack?`<div class="sep"></div><p class="vl">Presentación: <b>${opts[vi].l}</b></p>
      <div class="opts">${opts.map((o,i)=>`<button class="opt${i===vi?' on':''}" data-vi="${i}"><b>${o.l}</b><span>${money(o.pr)}</span></button>`).join('')}</div>`:''}
      <div class="sep"></div>
      <h2 class="sub">Acerca de este producto</h2>
      <p class="about">${cur.n}, presentación ${cur.p.toLowerCase()}. Disponible para solicitud a domicilio o para recoger en tienda. Revisamos existencias antes de aceptar tu pedido.</p>
      <h2 class="sub">Detalles</h2>
      <table class="det"><tbody>
        <tr><th>Referencia</th><td>${cur.id}</td></tr>
        <tr><th>Categoría</th><td>${cur.c}</td></tr>
        <tr><th>Presentación</th><td>${cur.p}</td></tr>
        <tr><th>Precio de referencia</th><td>${money(cur.$)}</td></tr>
        <tr><th>Entrega</th><td>Domicilio o recoger en tienda</td></tr>
        <tr><th>Disponibilidad</th><td>Se confirma al revisar tu solicitud</td></tr>
      </tbody></table>
      <p class="fine" style="text-align:left;margin-top:12px">Precio y disponibilidad demostrativos.</p>
    </div>
    <aside class="buy" aria-label="Agregar al pedido">
      <div class="price" style="font-size:30px">${money(dq*mult*cur.$)}</div>
      <p class="pres">${dq*mult} × ${money(cur.$)} · precio de referencia</p>
      <dl class="mini"><dt>Vendido por</dt><dd>Distribuciones MB</dd><dt>Categoría</dt><dd>${cur.c}</dd></dl>
      <label for="dq">Cantidad${pack&&vi?' (cajas)':''}</label>
      <div class="qty big"><button data-dq="-1" aria-label="Quitar uno">−</button><output id="dq">${dq}</output><button data-dq="1" aria-label="Agregar uno">+</button></div>
      <button class="btn buybtn" data-addq>Agregar al pedido</button>
      <a class="btn wa" href="${wa}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      <button class="btn alt" id="seeCart">Ver mi pedido${inCart?' ('+inCart+' de este producto)':''}</button>
    </aside>
  </div>`;
  document.title=cur.n+' — Distribuciones MB';
  document.querySelector('#seeCart').onclick=()=>setOpen(true);
  cat=cur.c;exclude=cur.id;
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-g]'),t=e.target.closest('[data-gi]'),v=e.target.closest('[data-vi]'),q=e.target.closest('[data-dq]');
  if(g)gi=(gi+ +g.dataset.g+VIEWS.length)%VIEWS.length;
  else if(t)gi=+t.dataset.gi;
  else if(v)vi=+v.dataset.vi;
  else if(q)dq=Math.max(1,dq+ +q.dataset.dq);
  else if(e.target.closest('[data-addq]')){change(cur.id,dq*(vi?packOf(cur):1));dq=1;return}
  else return;
  renderDetail();renderGrid();
});
// hover zoom follows the pointer
document.addEventListener('mousemove',e=>{
  const m=e.target.closest('#gmain');if(!m)return;
  const r=m.getBoundingClientRect(),i=m.querySelector('img');
  i.style.setProperty('--ox',((e.clientX-r.left)/r.width*100)+'%');i.style.setProperty('--oy',((e.clientY-r.top)/r.height*100)+'%');
});
function renderAll(){renderDetail();renderGrid();renderCart()}
const setOpen=o=>{document.body.classList.toggle('open',o);$('#drawer').setAttribute('aria-hidden',!o)};
$('#openCart').onclick=()=>setOpen(true);$('#closeCart').onclick=$('#scrim').onclick=$('#toForm').onclick=()=>setOpen(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});

/* order */
const orders=store.get('mb-orders',{});
const WA=t=>'https://wa.me/?text='+encodeURIComponent(t);
$('#waGeneral').href=WA('Hola, quiero información sobre un pedido en Distribuciones MB.');
$('#form').onsubmit=e=>{
  e.preventDefault();
  const nombre=$('#nombre').value.trim(),tel=$('#tel').value.replace(/\D/g,'');
  const err=m=>($('#err').textContent=m,false);
  if(!items().length)return err('Agrega al menos un producto desde el catálogo.');
  if(!nombre)return err('Escribe tu nombre o el de tu negocio.');
  if(tel.length<10)return err('Escribe un teléfono de 10 dígitos.');
  if(!$('#priv').checked)return err('Acepta el aviso de privacidad y los términos para enviar tu solicitud.');
  $('#err').textContent='';
  const folio='MB-'+(2409+Object.keys(orders).length);
  const mod=document.querySelector('[name=mod]:checked').value;
  orders[folio]={step:0,mod,upd:'ahora',lines:items().map(i=>`${i.q} × ${i.n}`)};
  store.set('mb-orders',orders);
  $('#newFolio').textContent=folio;
  $('#doneLines').innerHTML=items().map(i=>`<li><span>${i.q} × ${i.n}</span><span>${money(i.q*i.$)}</span></li>`).join('')
    +`<li class="dt"><span>Total de referencia</span><span>${money(total())}</span></li><li class="dm"><span>Modalidad</span><span>${mod}</span></li>`;
  $('#wa').href=WA(`Hola, envié la solicitud ${folio} en Distribuciones MB.\n${orders[folio].lines.join('\n')}\nModalidad: ${mod}.`);
  $('#goTrack').onclick=()=>{$('#folioIn').value=folio;showOrder(folio)};
  cart={};store.set('mb-cart',cart);renderAll();
  $('#formView').classList.add('hide');$('#doneView').classList.remove('hide');
  $('#solicitud').scrollIntoView({behavior:'smooth'});
};

/* tracking */
function showOrder(folio){
  const o=folio===DEMO.folio?DEMO:orders[folio];
  if(!o){$('#result').classList.add('hide');$('#lerr').textContent='No encontramos ese folio. Revisa el número o escríbenos por WhatsApp.';return}
  $('#lerr').textContent='';
  const s=o.step;
  $('#result').innerHTML=`<small class="eyebrow">${folio}</small><h3>${STEPS[s][0]}</h3><p style="color:var(--ink2)">${STEPS[s][1]}</p>
    ${o.adjust?`<div class="adjust"><b>Ajuste a acordar</b>${o.adjust}</div>`:''}
    <div class="track" style="margin-top:26px">${STEPS.map((t,i)=>`<div class="step ${i<s?'done':i===s?'now':''}"><div class="dot">${i<s?'✓':''}</div><div><b>${t[0]}</b><span>${i<=s?t[1]:'Pendiente'}</span></div></div>`).join('')}</div>
    <p class="upd">Actualizado ${o.upd}</p>`;
  $('#result').classList.remove('hide');
}
$('#lookup').onsubmit=e=>{e.preventDefault();const f=$('#folioIn').value.trim().toUpperCase();
  if(!f){$('#lerr').textContent='Escribe tu folio, por ejemplo MB-2408.';return}showOrder(f)};

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
renderAll();
