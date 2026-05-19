let tipInterval=null;
function renderVentas(){
const frase=VENTAS_FRASES[Math.floor(Math.random()*VENTAS_FRASES.length)];
const tip=VENTAS_TIPS[Math.floor(Math.random()*VENTAS_TIPS.length)];
const desafio=DESAFIOS[new Date().getDate()%DESAFIOS.length];
let h=`<div class="ventas-hero"><div class="ventas-frase gradient-text">${frase}</div></div>`;
h+=`<div class="tip-card"><div class="tip-header">💡 Tip del Vendedor Pro</div><div class="tip-text" id="ventasTipText">${tip}</div></div>`;
h+=`<div class="desafio-card"><div class="desafio-header">🎯 DESAFÍO DE HOY</div><div class="desafio-text">${desafio}</div></div>`;
h+=`<h2 class="section-title">Secciones</h2><div class="ventas-sections">`;
h+=`<div class="action-btn" onclick="showVentasSeccion('estrategias')" style="padding:20px"><span class="action-icon">♟️</span><span>Estrategias</span><span style="font-size:11px;color:var(--text3)">8 técnicas pro</span></div>`;
h+=`<div class="action-btn" onclick="showVentasSeccion('objeciones')" style="padding:20px"><span class="action-icon">🛡️</span><span>Objection Killer</span><span style="font-size:11px;color:var(--text3)">10 objeciones</span></div>`;
h+=`<div class="action-btn" onclick="showVentasSeccion('detector')" style="padding:20px"><span class="action-icon">🎯</span><span>Detector</span><span style="font-size:11px;color:var(--text3)">Trámite → Producto</span></div>`;
h+=`<div class="action-btn" onclick="showVentasSeccion('frases')" style="padding:20px"><span class="action-icon">⚡</span><span>Frases de Cierre</span><span style="font-size:11px;color:var(--text3)">10 frases letales</span></div>`;
h+=`<div class="action-btn" onclick="showVentasSeccion('errores')" style="padding:20px"><span class="action-icon">❌</span><span>Errores Fatales</span><span style="font-size:11px;color:var(--text3)">Lo que NO hacer</span></div>`;
h+=`<div class="action-btn" onclick="navigateTo('simulador')" style="padding:20px"><span class="action-icon">🎭</span><span>Entrenamiento</span><span style="font-size:11px;color:var(--text3)">6 escenarios</span></div>`;
h+=`<div class="action-btn" onclick="navigateTo('quiz')" style="padding:20px"><span class="action-icon">🧠</span><span>Quiz</span><span style="font-size:11px;color:var(--text3)">Pon a prueba</span></div>`;
h+=`</div><div id="ventasSeccionContent"></div>`;
document.getElementById('ventasContent').innerHTML=h;
if(tipInterval)clearInterval(tipInterval);
tipInterval=setInterval(()=>{const el=document.getElementById('ventasTipText');if(el){el.style.opacity='0';setTimeout(()=>{el.textContent=VENTAS_TIPS[Math.floor(Math.random()*VENTAS_TIPS.length)];el.style.opacity='1';},300);}},30000);
}

function showVentasSeccion(sec){
let h='';
if(sec==='estrategias'){
h+=`<h2 class="section-title" style="margin-top:24px">Estrategias de Venta</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Toca cada una para expandirla.</p>`;
ESTRATEGIAS.forEach((e,i)=>{
let tipsHtml=e.tips?`<div class="estrategia-tips"><div class="estrategia-ejemplo-title">Tips del Experto:</div>${e.tips.map(t=>`<div class="estrategia-tip-item">→ ${t}</div>`).join('')}</div>`:'';
h+=`<div class="estrategia-card" onclick="this.classList.toggle('open')"><div class="estrategia-header"><div class="estrategia-num">${i+1}</div><div><div class="estrategia-nombre">${e.nombre}</div><div class="estrategia-cat">${e.categoria}</div></div><div class="estrategia-arrow">▼</div></div><div class="estrategia-body"><p class="estrategia-desc">${e.desc}</p><div class="estrategia-ejemplo"><div class="estrategia-ejemplo-title">Ejemplo en BancoEstado:</div><pre class="estrategia-ejemplo-text">${e.ejemplo}</pre></div>${tipsHtml}</div></div>`;
});
}
if(sec==='objeciones'){
h+=`<h2 class="section-title" style="margin-top:24px">Objection Killer</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Las 10 objeciones más comunes. Toca para ver las respuestas.</p>`;
OBJECIONES.forEach((o,i)=>{
h+=`<div class="estrategia-card" onclick="this.classList.toggle('open')"><div class="estrategia-header"><div class="estrategia-num" style="background:linear-gradient(135deg,#ff5a8a,#ff3366)">${i+1}</div><div><div class="estrategia-nombre">"${o.obj}"</div><div class="estrategia-cat">Objeción</div></div><div class="estrategia-arrow">▼</div></div><div class="estrategia-body">${o.resp.map((r,j)=>`<div class="objecion-resp"><div class="objecion-resp-num">Respuesta ${j+1}:</div><p style="font-size:13px;color:var(--text);line-height:1.6;margin:4px 0 12px">${r}</p></div>`).join('')}</div></div>`;
});
}
if(sec==='detector'){
h+=`<h2 class="section-title" style="margin-top:24px">Detector de Oportunidad</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Si el cliente viene a hacer X → ofrécele Y.</p>`;
DETECTOR.forEach(d=>{
h+=`<div class="detector-card"><div class="detector-tramite">${d.tramite}</div><div class="detector-arrow">→</div><div class="detector-producto">${d.producto}</div><div class="detector-porque">${d.porque}</div></div>`;
});
}
if(sec==='frases'){
h+=`<h2 class="section-title" style="margin-top:24px">Frases de Cierre Rápido</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Memorízalas y úsalas al momento de cerrar.</p>`;
FRASES_CIERRE.forEach((f,i)=>{
h+=`<div class="frase-card"><span class="frase-num">${i+1}</span><span class="frase-text">"${f}"</span></div>`;
});
}
if(sec==='errores'){
h+=`<h2 class="section-title" style="margin-top:24px">Errores Fatales del Vendedor</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Lo que NUNCA debes hacer. Toca para ver la corrección.</p>`;
ERRORES_FATALES.forEach((e,i)=>{
h+=`<div class="estrategia-card" onclick="this.classList.toggle('open')"><div class="estrategia-header"><div class="estrategia-num" style="background:linear-gradient(135deg,#ff3333,#cc0000)">${i+1}</div><div><div class="estrategia-nombre">${e.error}</div><div class="estrategia-cat" style="color:#ff3333">Error Fatal</div></div><div class="estrategia-arrow">▼</div></div><div class="estrategia-body"><p class="estrategia-desc"><strong>¿Por qué mata la venta?</strong><br>${e.porque}</p><div class="estrategia-ejemplo" style="border-left-color:#00c896"><div class="estrategia-ejemplo-title" style="color:#00c896">Solución:</div><p style="font-size:13px;color:var(--text);line-height:1.6;margin:0">${e.solucion}</p></div></div></div>`;
});
}
document.getElementById('ventasSeccionContent').innerHTML=h;
document.getElementById('ventasSeccionContent').scrollIntoView({behavior:'smooth'});
}
