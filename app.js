// Sales Command Center - App Logic
let DB=null,state={xp:0,level:1,streak:0,ventas:0,lastDay:null,activities:[],quizDone:[],logros:[],metaMensual:0};
const LEVELS=[{n:'Novato',xp:100},{n:'Aprendiz',xp:250},{n:'Vendedor',xp:500},{n:'Experto',xp:1000},{n:'Maestro',xp:2000},{n:'Leyenda',xp:5000}];
const TIPS=["El SONAP cuesta solo 0.16 UF/mes. 1 de cada 3 personas desarrollará cáncer. Úsalo como argumento.","El seguro de Pérdida Total es perfecto para autos viejos: bajo costo, alta protección.","Chile es país sísmico. Todo hogar DEBERÍA tener seguro de incendio con cobertura sísmica.","El Seguro Muerte Accidental con Ahorro: 50% de la prima se devuelve como ahorro. No es gasto, es inversión.","Sale Seguro Plus cubre hasta 20 UF si te asaltan en el cajero. Perfecto para clientes que retiran efectivo.","SOAP es venta segura: todo auto lo necesita por ley para circular.","Seguro Viaje: una noche de hospital en el extranjero puede costar millones. Este seguro lo cubre.","Para Pymes: ofrecer salud complementaria mejora retención de talento. Mínimo 5 trabajadores.","RCI obligatorio para viajar en auto a Argentina. Temporada alta = ventas masivas.","El Full Ambulatorio reembolsa 70% de consultas SIN deducible. Complementa FONASA/Isapre."];
const QUOTES=["No existe el vendedor perfecto, pero sí existe el vendedor que nunca deja de intentarlo. Hoy es tu día para demostrarlo.","Cada persona que se sienta frente a ti tiene una historia, un miedo y una familia que proteger. Tu trabajo es ayudarle a dar ese paso.","El éxito en ventas no se mide solo en números. Se mide en cuántas familias duermen tranquilas gracias a ti.","No viniste hasta acá para ser promedio. Viniste a romperla, a superarte, a ser la mejor versión de ti mismo cada día.","La diferencia entre un buen vendedor y uno extraordinario es simple: el extraordinario nunca deja de prepararse.","Hoy alguien necesita exactamente lo que tú ofreces. Solo tienes que encontrarlo, escucharlo y conectar con su necesidad.","Los grandes vendedores no nacen, se hacen. Se hacen con práctica, con estudio y con la convicción de que lo que ofrecen cambia vidas.","No vendas por vender. Vende porque genuinamente crees que tu producto puede hacer la diferencia en la vida de esa persona."];
const CTAS=["A romperla","Vamos con todo","A cerrar ventas","Hoy es el día","A conquistar","Dale con todo","Sin límites","A ganar"];

// Init
window.addEventListener('DOMContentLoaded',async()=>{loadState();await loadDB();initWelcomeScreen();setupNav();checkStreak();populateProductSelect();});

async function loadDB(){try{const r=await fetch('data/seguros.json');DB=await r.json();}catch(e){DB={categorias:[]};console.error(e);}}
function loadState(){const s=localStorage.getItem('salesCmdState');if(s)state=JSON.parse(s);}
function saveState(){localStorage.setItem('salesCmdState',JSON.stringify(state));}

// Welcome Screen
function initWelcomeScreen(){
  const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Santiago'}));
  const h=now.getHours();
  const timeStr=now.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',timeZone:'America/Santiago'});
  const dateStr=now.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',timeZone:'America/Santiago'});
  let greet='Buenas noches';
  if(h>=5&&h<12)greet='Buenos días';
  else if(h>=12&&h<20)greet='Buenas tardes';
  document.getElementById('splashTime').textContent=dateStr.charAt(0).toUpperCase()+dateStr.slice(1)+' • '+timeStr;
  document.getElementById('splashGreeting').textContent=greet;
  document.getElementById('splashQuote').textContent=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  document.getElementById('ctaText').textContent=CTAS[Math.floor(Math.random()*CTAS.length)];
}
function enterApp(){
  const splash=document.getElementById('splash');
  splash.style.transition='opacity 0.5s ease, transform 0.5s ease';
  splash.style.opacity='0';
  splash.style.transform='scale(1.05)';
  setTimeout(()=>{splash.classList.remove('active');splash.style='';document.getElementById('main').classList.add('active');renderHome();},500);
}

// Navigation
function navigateTo(p){document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));document.getElementById('page-'+p).classList.add('active');document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.toggle('active',b.dataset.page===p);});const renders={home:renderHome,productos:renderProductos,quiz:renderQuiz,simulador:renderSimulador,logros:renderLogros,perfil:renderPerfil,ventas:renderVentas};if(renders[p])renders[p]();document.getElementById('pages').scrollTop=0;}

// Ventas Module
const VENTAS_FRASES=["Vender no es convencer, es ayudar al cliente a tomar la mejor decisión para su vida.","El mejor vendedor no es el que más habla, sino el que mejor escucha.","No vendas productos, vende la solución a un problema que el cliente ni sabía que tenía.","Tu superpoder es transformar una atención rutinaria en una oportunidad.","Las ventas se cierran con confianza, no con presión."];
const ESTRATEGIAS=[
{nombre:"Los Dos SÍ Antes del Tercero",desc:"Esta es una de las técnicas más poderosas en ventas y está basada en psicología. La idea es simple: antes de hacer tu pregunta de cierre (la que importa), haz dos preguntas cuya respuesta sea obviamente SÍ. ¿Por qué funciona? Porque el cerebro humano entra en un patrón de aceptación. Cuando ya dijiste 'sí' dos veces, es mucho más difícil decir 'no' a la tercera.",ejemplo:"Tú: '¿Usted tiene hijos, cierto?'\nCliente: 'Sí, tengo dos.'\nTú: '¿Y le gustaría que ellos estén protegidos económicamente si a usted le llegara a pasar algo?'\nCliente: 'Sí, obvio.'\nTú: 'Perfecto. Justamente para eso tenemos el SONAP, que por menos de $6.000 al mes protege a su familia. ¿Se lo dejo activado?'",tips:["Las dos primeras preguntas deben ser obvias y emocionales, no técnicas","No hagas las 3 preguntas seguidas como robot. Conversa entre cada una","Si el cliente dice 'no' a la primera, cambia de tema y vuelve después"],categoria:"Cierre"},
{nombre:"El Espejo",desc:"Esta técnica viene de la negociación del FBI (libro: Never Split the Difference). Consiste en repetir las últimas 3-4 palabras que dijo el cliente, pero en forma de pregunta. Esto hace que el cliente sienta que lo estás escuchando de verdad, baja sus defensas y lo motiva a seguir hablando. Cuanto más habla el cliente, más información te da para cerrar la venta.",ejemplo:"Cliente: 'Es que la verdad ando corto de plata y me da miedo endeudarme más'\nTú: '¿Le da miedo endeudarme más?'\nCliente: 'Sí, es que tuve un mal año y...'\n(El cliente sigue hablando y te cuenta su situación real. Ahí detectas la oportunidad.)\nTú: 'Entiendo perfectamente. Y justamente por eso le conviene el SONAP: es tan barato que no va a sentirlo, pero si le pasa algo, le cambia la vida.'",tips:["No repitas como loro. Hazlo con tono de genuina curiosidad","Funciona especialmente bien cuando el cliente se resiste","Después de repetir, CÁLLATE. Deja que el silencio trabaje"],categoria:"Rapport"},
{nombre:"La Alternativa (Nunca Sí o No)",desc:"Error clásico de novato: preguntar '¿Quiere contratar el seguro?' Eso le da al cliente la opción fácil de decir 'no'. En vez de eso, dale dos opciones donde AMBAS son positivas para ti. El cerebro elige entre A o B, no entre SÍ o NO. Es como cuando tu mamá te preguntaba '¿Quieres bañarte antes o después de comer?' Nunca te preguntó si querías bañarte.",ejemplo:"MAL: '¿Quiere contratar el seguro?'\nBIEN: '¿Prefiere el plan de 300 UF o el de 500 UF?'\nBIEN: '¿Lo dejamos con cargo a la cuenta corriente o a la tarjeta?'\nBIEN: '¿Empezamos con el SONAP o prefiere el de hogar primero?'",tips:["Usa esta técnica SOLO cuando sientas que el cliente ya está interesado","Las dos opciones deben ser realmente diferentes para que no se sienta manipulado","Si el cliente dice 'ninguna', no insistas. Vuelve a la conversación"],categoria:"Cierre"},
{nombre:"SPIN: Descubre la Necesidad",desc:"SPIN es un método creado por Neil Rackham después de estudiar 35.000 ventas reales. Se basa en hacer 4 tipos de preguntas en orden: Situación (entender el contexto), Problema (que el cliente reconozca un problema), Implicación (que entienda las consecuencias de no actuar), y Necesidad (que él mismo pida la solución). La clave es que TÚ no le dices que necesita el seguro. ÉL llega solo a esa conclusión.",ejemplo:"S (Situación): '¿Usted tiene casa propia?'\nCliente: 'Sí, la estoy pagando todavía.'\nP (Problema): '¿Y qué pasaría si hay un terremoto fuerte y su casa se daña?'\nCliente: 'Uf, sería terrible...'\nI (Implicación): '¿Tendría que seguir pagando el dividendo de una casa que ya no puede usar?'\nCliente: 'Mmm, no había pensado en eso...'\nN (Necesidad): 'Para eso existe nuestro seguro de hogar. Cubre hasta 3.000 UF en daños por sismo. ¿Le gustaría proteger su inversión?'",tips:["No hagas las 4 preguntas como un interrogatorio. Intégralas en la conversación","La pregunta de Implicación es la más poderosa: hace que el cliente sienta urgencia","Practica primero con compañeros antes de usarla con clientes reales"],categoria:"Descubrimiento"},
{nombre:"El Caso Real (Storytelling)",desc:"Las historias venden más que los datos. ¿Por qué? Porque activan la emoción, y las decisiones de compra son 80% emocionales. Cuando le cuentas a un cliente la historia de otra persona que pasó por lo mismo, se identifica. Siente que eso le podría pasar a él. Y ahí nace la necesidad. No necesitas inventar historias: con el tiempo tendrás decenas de casos reales. Mientras tanto, usa ejemplos realistas.",ejemplo:"'Mire, le voy a contar algo que me pasó la semana pasada. Vino un cliente como usted, más o menos de la misma edad, y me dijo exactamente lo mismo: que no necesitaba seguro. Yo le expliqué el SONAP, le dije que costaba menos que un café al día, y lo contrató.\n\nDos meses después me llamó para agradecerme. Le habían encontrado algo en un examen de rutina, y el SONAP le cubrió todo. Me dijo: si usted no me hubiera insistido ese día, hoy estaría en un problema enorme.\n\nPor eso le insisto: por $6.000 al mes, la tranquilidad no tiene precio.'",tips:["Cuenta la historia con calma y emoción, no como un comercial","Si tienes un caso real propio, úsalo. Es 10 veces más poderoso","Después de la historia, haz silencio. Deja que el cliente procese"],categoria:"Emoción"},
{nombre:"Anclaje de Precio",desc:"El cerebro humano no sabe evaluar precios en abstracto. Necesita una referencia. Si le dices a alguien que algo cuesta $6.000 al mes, no sabe si es caro o barato. Pero si primero le muestras algo de $50.000 y luego algo de $6.000, automáticamente siente que $6.000 es baratísimo. Esto se llama 'anclaje'. Úsalo siempre: muestra primero el producto más caro y luego el que realmente quieres vender.",ejemplo:"'Mire, nuestro seguro Máxima Protección es el más completo, cubre hasta 6.000 UF por muerte accidental y 900 UF por enfermedades catastróficas. Ese tiene un costo de X al mes.\n\nAhora, si usted busca algo más accesible pero que igual lo proteja muy bien, el SONAP le da cobertura oncológica y por muerte accidental por solo 0.16 UF al mes... eso es menos de $6.000. Prácticamente el precio de un café.'",tips:["El ancla debe ser real, no inventada. No exageres el precio del producto caro","La comparación con algo cotidiano ('un café') es muy efectiva","Usa esta técnica cuando el cliente dice 'es que no tengo plata para eso'"],categoria:"Precio"},
{nombre:"Urgencia con Datos Reales",desc:"NUNCA inventes urgencia falsa ('es que esta oferta se acaba hoy'). Los clientes lo detectan y pierdes credibilidad. En vez de eso, usa estadísticas REALES que generen urgencia legítima. Los datos del cáncer en Chile, los terremotos, los robos... son reales y poderosos. Cuando usas datos reales, no estás presionando: estás informando.",ejemplo:"'¿Sabía usted que en Chile, cada 15 minutos una persona es diagnosticada con cáncer? 1 de cada 3 chilenos lo va a desarrollar en algún momento de su vida. Y aquí viene lo importante: los seguros oncológicos solo se pueden contratar cuando uno está SANO. Una vez que te diagnostican, ya ninguna compañía te acepta.\n\nEl SONAP cuesta $6.000 al mes. La pregunta no es si puede pagarlo. La pregunta es si puede darse el lujo de no tenerlo.'",tips:["Memoriza 3-4 estadísticas clave: cáncer, terremotos, robos de auto","Di los datos con seriedad, no con tono de vendedor","Esta técnica funciona mejor al final, como cierre, no al inicio"],categoria:"Urgencia"},
{nombre:"Resumen Inverso",desc:"Justo antes de cerrar, haz un resumen de todo lo que el cliente te dijo que le importaba y muestra cómo tu producto resuelve cada punto. Esto es poderoso porque el cliente no puede discutir contra sus propias palabras. Tú no estás imponiendo nada: simplemente le estás devolviendo lo que ÉL dijo.",ejemplo:"'A ver, déjeme hacer un resumen de lo que conversamos:\n\n1. Usted me dijo que le preocupa su familia si le pasa algo ✓\n2. Me dijo que quiere algo que no sea caro ✓\n3. Y que sea fácil de contratar, sin mucho papeleo ✓\n\nEl SONAP cubre exactamente esos 3 puntos: protege a su familia con hasta 1.200 UF, cuesta menos de $6.000 al mes, y lo activamos ahora mismo desde aquí sin ningún trámite extra.\n\n¿Lo dejamos activado?'",tips:["Anota mentalmente (o en un papel) lo que el cliente dice durante la conversación","Usa las MISMAS palabras que usó el cliente, no las tuyas","Esta técnica tiene una tasa de cierre altísima. Practícala"],categoria:"Cierre"}
];
const VENTAS_TIPS=["Nunca hables mal de la competencia. Habla bien de tu producto y deja que el cliente compare solo.","El 80% de las ventas se cierran después del 5to contacto. Si te rinden al primer 'no', estás dejando dinero en la mesa.","Usa el nombre del cliente al menos 3 veces durante la conversación. Psicológicamente, escuchar tu nombre activa la confianza.","Sonríe cuando hables por teléfono. Aunque no te vean, la sonrisa cambia el tono de tu voz y el cliente lo percibe.","El mejor momento para ofrecer un seguro es justo después de resolver el trámite por el que vino. El cliente está agradecido y receptivo.","Pregunta más de lo que afirmas. El que pregunta controla la conversación. El que solo habla, la pierde.","Regla de oro del cierre: después de hacer la pregunta de cierre, CÁLLATE. El primero que habla, pierde.","Los primeros 7 segundos son todo. Saluda con energía, mira a los ojos y sonríe. La primera impresión define el resto."];

function renderVentas(){
const frase=VENTAS_FRASES[Math.floor(Math.random()*VENTAS_FRASES.length)];
const tip=VENTAS_TIPS[Math.floor(Math.random()*VENTAS_TIPS.length)];
let h=`<div class="ventas-hero"><div class="ventas-frase gradient-text">${frase}</div></div>`;
h+=`<div class="tip-card"><div class="tip-header">💡 Tip del Vendedor Pro</div><div class="tip-text">${tip}</div></div>`;
h+=`<h2 class="section-title">Secciones</h2><div class="ventas-sections">`;
h+=`<div class="action-btn" onclick="showVentasSeccion('estrategias')" style="padding:20px"><span class="action-icon">♟️</span><span>Estrategias</span><span style="font-size:11px;color:var(--text3)">8 técnicas pro</span></div>`;
h+=`<div class="action-btn" onclick="navigateTo('simulador')" style="padding:20px"><span class="action-icon">🎭</span><span>Entrenamiento</span><span style="font-size:11px;color:var(--text3)">Practicar ventas</span></div>`;
h+=`<div class="action-btn" onclick="navigateTo('quiz')" style="padding:20px"><span class="action-icon">🧠</span><span>Quiz</span><span style="font-size:11px;color:var(--text3)">Pon a prueba</span></div>`;
h+=`</div>`;
h+=`<div id="ventasSeccionContent"></div>`;
document.getElementById('ventasContent').innerHTML=h;
}

function showVentasSeccion(sec){
let h='';
if(sec==='estrategias'){
h+=`<h2 class="section-title" style="margin-top:24px">Estrategias de Venta</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Cada estrategia incluye una explicación detallada, un ejemplo real aplicado a BancoEstado y tips de un vendedor experto. Toca cada una para expandirla.</p>`;
ESTRATEGIAS.forEach((e,i)=>{
let tipsHtml=e.tips?`<div class="estrategia-tips"><div class="estrategia-ejemplo-title">Tips del Experto:</div>${e.tips.map(t=>`<div class="estrategia-tip-item">→ ${t}</div>`).join('')}</div>`:'';
h+=`<div class="estrategia-card" onclick="this.classList.toggle('open')">
<div class="estrategia-header"><div class="estrategia-num">${i+1}</div><div><div class="estrategia-nombre">${e.nombre}</div><div class="estrategia-cat">${e.categoria}</div></div><div class="estrategia-arrow">▼</div></div>
<div class="estrategia-body"><p class="estrategia-desc">${e.desc}</p><div class="estrategia-ejemplo"><div class="estrategia-ejemplo-title">Ejemplo en BancoEstado:</div><pre class="estrategia-ejemplo-text">${e.ejemplo}</pre></div>${tipsHtml}</div>
</div>`;
});
}
document.getElementById('ventasSeccionContent').innerHTML=h;
document.getElementById('ventasSeccionContent').scrollIntoView({behavior:'smooth'});
}
function setupNav(){document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.page)));}

// Streak
function checkStreak(){const today=new Date().toDateString();if(state.lastDay===today)return;if(state.lastDay===new Date(Date.now()-86400000).toDateString()){state.streak++;}else if(state.lastDay!==today){state.streak=state.lastDay?0:1;}state.lastDay=today;saveState();}

// XP System
function addXP(amount){state.xp+=amount;let lvl=0;for(let i=0;i<LEVELS.length;i++){if(state.xp>=LEVELS[i].xp)lvl=i+1;}state.level=Math.max(1,lvl+1>LEVELS.length?LEVELS.length:lvl+1);saveState();renderXP();showToast('+'+amount+' XP');confetti();}
function renderXP(){const lv=Math.min(state.level,LEVELS.length)-1;const cur=LEVELS[lv];const prev=lv>0?LEVELS[lv-1].xp:0;const pct=Math.min(100,((state.xp-prev)/(cur.xp-prev))*100);document.getElementById('xpLevel').textContent=state.level;document.getElementById('xpText').textContent=state.xp+'/'+cur.xp+' XP';document.getElementById('xpFill').style.width=pct+'%';}

// Home
function renderHome(){const h=new Date().getHours();document.getElementById('greeting').textContent=h<12?'Buenos días':h<18?'Buenas tardes':'Buenas noches';document.getElementById('streakBadge').textContent='🔥 '+state.streak;document.getElementById('statVentas').textContent=state.ventas;document.getElementById('statMeta').textContent=Math.min(100,Math.round((state.ventas/30)*100))+'%';document.getElementById('statNivel').textContent=state.level;renderXP();document.getElementById('dailyTip').textContent=TIPS[Math.floor(Math.random()*TIPS.length)];renderActivities();}

function renderActivities(){const el=document.getElementById('activityList');if(!state.activities.length){el.innerHTML='<div class="empty-state">Sin actividad aún. ¡Registra tu primera venta!</div>';return;}el.innerHTML=state.activities.slice(-10).reverse().map(a=>`<div class="activity-item"><div class="activity-icon">${a.icon}</div><div class="activity-info"><div class="activity-title">${a.title}</div><div class="activity-time">${a.time}</div></div><div class="activity-xp">+${a.xp} XP</div></div>`).join('');}

// Products
function renderProductos(){if(!DB)return;const tabs=document.getElementById('categoryTabs');tabs.innerHTML='<div class="cat-tab active" onclick="filterCat(\'all\')">Todos</div>'+DB.categorias.map(c=>`<div class="cat-tab" onclick="filterCat('${c.id}')">${c.nombre}</div>`).join('');renderProductList('all');}
function filterCat(id){document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active');renderProductList(id);}
function renderProductList(catId){const el=document.getElementById('productList');let prods=[];DB.categorias.forEach(c=>{if(catId==='all'||c.id===catId){c.productos.forEach(p=>{prods.push({...p,catNombre:c.nombre,aseg:c.aseguradora,catId:c.id});});}});const q=(document.getElementById('searchInput').value||'').toLowerCase();if(q)prods=prods.filter(p=>(p.nombre+p.descripcion).toLowerCase().includes(q));el.innerHTML=prods.map(p=>`<div class="product-card" onclick="showDetail('${p.catId}','${p.id}')"><div class="product-card-header"><div class="product-name">${p.nombre}</div><div class="product-badge">${p.aseg}</div></div><div class="product-desc">${p.descripcion}</div><div class="product-tag">${p.catNombre}</div></div>`).join('')||'<div class="empty-state">No se encontraron productos</div>';}
function filterProducts(){const catTab=document.querySelector('.cat-tab.active');const catId=catTab?catTab.textContent==='Todos'?'all':DB.categorias.find(c=>c.nombre===catTab.textContent)?.id||'all':'all';renderProductList(catId);}

// Detail
function showDetail(catId,prodId){const cat=DB.categorias.find(c=>c.id===catId);if(!cat)return;const p=cat.productos.find(x=>x.id===prodId);if(!p)return;navigateTo('detalle');document.getElementById('detalleTitle').textContent=p.nombre;let h=`<p style="color:var(--text2);font-size:14px;line-height:1.6;margin-bottom:16px">${p.descripcion}</p>`;if(p.precio_desde||p.precio){h+=`<div class="detail-price"><div class="detail-price-label">Precio desde</div><div class="detail-price-value">${p.precio_desde||p.precio}</div></div>`;}
if(p.precios){h+=`<div class="detail-section"><div class="detail-section-title">💰 Precios</div><ul class="detail-list">`;Object.entries(p.precios).forEach(([k,v])=>{h+=`<li>${k.replace(/_/g,' ')}: ${v}</li>`;});h+=`</ul></div>`;}
if(p.coberturas){h+=`<div class="detail-section"><div class="detail-section-title">🛡️ Coberturas</div><ul class="detail-list">${p.coberturas.map(c=>`<li>${c}</li>`).join('')}</ul></div>`;}
if(p.requisitos){h+=`<div class="detail-section"><div class="detail-section-title">📋 Requisitos</div><ul class="detail-list req">${p.requisitos.map(r=>`<li>${r}</li>`).join('')}</ul></div>`;}
if(p.exclusiones){h+=`<div class="detail-section"><div class="detail-section-title">⚠️ Exclusiones</div><ul class="detail-list warn">${p.exclusiones.map(e=>`<li>${e}</li>`).join('')}</ul></div>`;}
if(p.planes&&Array.isArray(p.planes)&&typeof p.planes[0]==='object'){h+=`<div class="detail-section"><div class="detail-section-title">📊 Planes</div><ul class="detail-list">${p.planes.map(pl=>`<li>${pl.nombre}: ${pl.capital_uf} UF</li>`).join('')}</ul></div>`;}
if(p.deducibles_uf){h+=`<div class="detail-section"><div class="detail-section-title">💳 Deducibles disponibles</div><ul class="detail-list">${p.deducibles_uf.map(d=>`<li>${d} UF</li>`).join('')}</ul></div>`;}
if(p.tip_venta){h+=`<div class="detail-tip"><div class="detail-tip-title">🎯 TIP DE VENTA</div><div class="detail-tip-text">${p.tip_venta}</div></div>`;}
document.getElementById('detalleContent').innerHTML=h;addXP(5);}

// Quiz
const QUIZ=[
{q:"¿Cuánto cuesta el SONAP desde?",o:["0.50 UF/mes","0.16 UF/mes","1 UF/mes","0.30 UF/mes"],a:1},
{q:"¿Qué aseguradora respalda los seguros de hogar?",o:["MetLife","Mapfre","HDI Seguros","BCI Seguros"],a:2},
{q:"¿Hasta cuántas UF cubre el seguro de incendio hogar en estructura?",o:["1.000 UF","2.000 UF","3.000 UF","5.000 UF"],a:2},
{q:"¿Qué porcentaje de la prima se ahorra en Muerte Accidental con Ahorro?",o:["25%","30%","50%","75%"],a:2},
{q:"¿Edad máxima para contratar SONAP?",o:["65 años","70 años","78 años","80 años"],a:2},
{q:"¿Cuánto cubre Sale Seguro Plus por uso forzado en cajero?",o:["10 UF","15 UF","20 UF","30 UF"],a:2},
{q:"¿Antigüedad máxima del vehículo para seguro particular?",o:["10 años","15 años","20 años","25 años"],a:1},
{q:"¿Cuánto cuesta el SOAP personal desde?",o:["$5.990","$8.990","$12.990","$15.990"],a:1},
{q:"¿Qué seguro paga 2 UF/día por hospitalización?",o:["SONAP","Full Ambulatorio","Seguro a tu Medida","Máxima Protección"],a:2},
{q:"¿Mínimo de trabajadores para Salud Pyme?",o:["3","5","10","15"],a:1},
{q:"¿El seguro de Pérdida Total acepta autos de hasta cuántos años?",o:["10","15","20","25"],a:2},
{q:"¿Qué cubre el RCI?",o:["Robo de auto","Responsabilidad civil internacional","Seguro de vida","Daños por terremoto"],a:1},
{q:"¿Cuánto reembolsa el Full Ambulatorio en consultas?",o:["50%","60%","70%","80%"],a:2},
{q:"¿Capital máximo por muerte accidental en Máxima Protección?",o:["1.000 UF","3.000 UF","6.000 UF","10.000 UF"],a:2},
{q:"¿Se requiere inspección para seguro incendio hogar?",o:["Sí, siempre","Solo casas antiguas","No se requiere","Solo departamentos"],a:2}
];
let quizState={idx:0,score:0,answered:false,questions:[]};

function renderQuiz(){quizState={idx:0,score:0,answered:false,questions:shuffle([...QUIZ]).slice(0,10)};showQuizQuestion();}
function showQuizQuestion(){const c=document.getElementById('quizContainer');if(quizState.idx>=quizState.questions.length){const pct=Math.round((quizState.score/quizState.questions.length)*100);const msg=pct>=80?'¡Excelente! Eres un experto 🏆':pct>=60?'¡Muy bien! Sigue practicando 💪':'¡Ánimo! Revisa los productos 📚';const xp=quizState.score*15;addXP(xp);c.innerHTML=`<div class="quiz-result"><div class="quiz-score">${pct}%</div><div class="quiz-msg">${msg}</div><p style="color:var(--text2);margin-bottom:24px">${quizState.score}/${quizState.questions.length} correctas → +${xp} XP</p><button class="primary-btn" onclick="renderQuiz()">Intentar de Nuevo</button></div>`;return;}
const q=quizState.questions[quizState.idx];quizState.answered=false;c.innerHTML=`<div class="quiz-card"><div class="quiz-progress">Pregunta ${quizState.idx+1} de ${quizState.questions.length}</div><div class="quiz-question">${q.q}</div><div class="quiz-options">${q.o.map((o,i)=>`<div class="quiz-option" onclick="answerQuiz(${i})">${o}</div>`).join('')}</div></div>`;}
function answerQuiz(i){if(quizState.answered)return;quizState.answered=true;const q=quizState.questions[quizState.idx];const opts=document.querySelectorAll('.quiz-option');opts[q.a].classList.add('correct');if(i===q.a){quizState.score++;}else{opts[i].classList.add('wrong');}setTimeout(()=>{quizState.idx++;showQuizQuestion();},1200);}

// Simulator - Realistic Banking Scenarios
const SCENARIOS=[
{id:1,title:"Cliente viene a depositar",desc:"Señora de 45 años, viene a hacer un depósito a plazo. Oportunidad: SONAP.",diff:"facil",steps:[
{type:"context",text:"Una señora de unos 45 años se acerca a tu escritorio. Trae un cheque para depositar a plazo fijo. Se ve tranquila, no tiene apuro."},
{type:"client",text:"Hola, vengo a hacer un depósito a plazo. Tengo este cheque de mi finiquito."},
{type:"choice",question:"Acabas de resolver su trámite. ¿Cómo introduces el tema del seguro?",options:[
{text:"Señora, antes de que se vaya... veo que usted tiene su CuentaRUT activa. ¿Puedo preguntarle algo rápido?",score:5,feedback:"Excelente. Pedir permiso para preguntar es respetuoso y abre la puerta sin presionar."},
{text:"Señora, ¿le interesa un seguro oncológico?",score:1,feedback:"Demasiado directo. No creaste contexto ni conexión. El cliente se pone a la defensiva."},
{text:"Listo su depósito. Que le vaya bien.",score:0,feedback:"Perdiste la oportunidad. Tenías un cliente receptivo y no lo aprovechaste."}
]},
{type:"client",text:"Sí, dígame, pero rápido porque tengo que ir a buscar a mis nietos al colegio."},
{type:"choice",question:"Tiene apuro pero te dio permiso. ¿Qué haces?",options:[
{text:"Es rapidísimo. ¿Usted tiene familia que dependa de usted, cierto?",score:5,feedback:"Perfecto. Usaste 'Los Dos SÍ': pregunta obvia que conecta emocionalmente."},
{text:"Le cuento que tenemos un seguro oncológico que cubre hasta 600 UF y cuesta 0.16 UF mensuales con cobertura por muerte accidental de...",score:1,feedback:"La estás abrumando con datos técnicos. Tiene apuro. Ve al grano emocional, no técnico."},
{text:"Bueno si tiene apuro la dejo ir y otro día conversamos.",score:0,feedback:"Error. Ya te dijo que sí. 'Otro día' significa nunca. Aprovecha el momento."}
]},
{type:"client",text:"Sí, mis nietos. Los cuido yo porque mi hija trabaja todo el día."},
{type:"choice",question:"Te contó algo personal. ¿Cómo usas esa información?",options:[
{text:"¿Y qué pasaría con sus nietos si a usted le llegara a pasar algo de salud? ¿Quién los cuidaría?",score:5,feedback:"Pregunta de Implicación (SPIN). La haces reflexionar sobre las consecuencias. Poderoso."},
{text:"Tenemos un seguro que cuesta solo $6.000 al mes. ¿Lo quiere?",score:2,feedback:"Saltaste al cierre sin crear la necesidad. Funciona a veces pero pierdes muchas ventas así."},
{text:"Qué lindo que los cuide usted. Bueno, le cuento del SONAP...",score:3,feedback:"Bien el comentario personal, pero la transición fue brusca. Conecta mejor."}
]},
{type:"client",text:"Mmm... no había pensado en eso. Pero es que no tengo plata para gastar en seguros..."},
{type:"choice",question:"La objeción clásica: 'no tengo plata'. ¿Cómo respondes?",options:[
{text:"Entiéndame, no es un gasto. Son $6.000 al mes, menos que un café. Y si le diagnostican algo, le pagan hasta 600 UF. La pregunta no es si puede pagarlo... es si puede darse el lujo de no tenerlo.",score:5,feedback:"Brillante. Anclaje de precio + urgencia real. Reenmarcaste el costo como inversión."},
{text:"Bueno, si no puede no puede. Cuando tenga más plata me busca.",score:0,feedback:"Nunca aceptes la primera objeción. El 80% de los 'no tengo plata' se convierten en SÍ con la técnica correcta."},
{text:"Es súper barato, no se preocupe.",score:2,feedback:"Decir 'es barato' sin dar contexto no convence. Necesitas comparar con algo tangible."}
]},
{type:"end",text:"La señora contrató el SONAP. Le diste tranquilidad para ella y sus nietos. Eso es vender con propósito."}
]},
{id:2,title:"Joven abre CuentaRUT",desc:"Chico de 22 años, primer trabajo. Viene a activar su CuentaRUT. Oportunidad: Sale Seguro.",diff:"facil",steps:[
{type:"context",text:"Un joven de unos 22 años llega a tu escritorio. Se nota que es su primer trabajo formal. Viene a activar su CuentaRUT para recibir su sueldo."},
{type:"client",text:"Hola, necesito activar mi CuentaRUT. Es que empecé a trabajar y me piden una cuenta para depositarme el sueldo."},
{type:"choice",question:"Estás activando su cuenta. ¿Cómo introduces una oportunidad de venta?",options:[
{text:"Felicitaciones por el nuevo trabajo. Oye, una pregunta: ¿vas a usar cajero automático para sacar plata, cierto?",score:5,feedback:"Perfecto. Lo felicitas (rapport), y haces una pregunta obvia cuya respuesta es SÍ."},
{text:"Listo, tu cuenta está activa. ¿Algo más?",score:0,feedback:"Oportunidad perdida. Un cliente nuevo es el momento ideal para ofrecer productos."},
{text:"Te recomiendo que contrates el Sale Seguro Plus para proteger tu tarjeta.",score:2,feedback:"Muy directo. No creaste contexto ni necesidad. Primero pregunta, después ofrece."}
]},
{type:"client",text:"Sí, obvio. Voy a sacar plata del cajero todos los meses."},
{type:"choice",question:"Ya dijo SÍ una vez. ¿Cómo sigues?",options:[
{text:"¿Y sabías que en Chile los asaltos en cajeros son súper comunes? Si alguien te obliga a sacar plata del cajero, ¿quién te devuelve esa plata?",score:5,feedback:"Pregunta de Implicación con dato real. Lo haces reflexionar sin presionarlo."},
{text:"Tenemos un seguro que te protege por 20 UF si te asaltan.",score:3,feedback:"Dato correcto pero fuiste al producto muy rápido. Deja que sienta la necesidad primero."},
{text:"Ten cuidado cuando saques plata, es peligroso.",score:1,feedback:"Lo asustaste sin ofrecerle solución. Siempre que plantees un problema, ten la solución lista."}
]},
{type:"client",text:"Pucha, no... nadie supongo. ¿Y qué se puede hacer?"},
{type:"choice",question:"El cliente preguntó por la solución. ¡Momento perfecto para cerrar!",options:[
{text:"Para eso existe Sale Seguro Plus. Si te obligan en el cajero, te devolvemos hasta 20 UF. Y además protege tus compras hasta 100 UF. ¿Te lo dejo activado con cargo a tu cuenta?",score:5,feedback:"Cierre perfecto. Diste la solución + usaste La Alternativa implícita (no preguntaste si quiere, preguntaste cómo)."},
{text:"Tenemos Sale Seguro Plus. ¿Lo quieres o no?",score:2,feedback:"Preguntaste SÍ o NO. Regla de oro: nunca des la opción de decir 'no'. Usa alternativas."},
{text:"Sale Seguro Plus cubre uso forzado en cajero 20 UF, coacción en ventanilla 20 UF, extorsión 5 UF, robo con violencia 10 UF...",score:1,feedback:"Lo abrumaste con datos. A un joven de 22 años le dices 2 beneficios clave y cierras. Menos es más."}
]},
{type:"end",text:"El joven activó Sale Seguro Plus. Su primer producto bancario más allá de la CuentaRUT. Bien hecho."}
]},
{id:3,title:"Señor paga dividendo",desc:"Hombre de 55 años paga su dividendo hipotecario mensual. Oportunidad: Seguro Hogar.",diff:"medio",steps:[
{type:"context",text:"Un señor de unos 55 años llega a pagar su dividendo. Lo ves todos los meses, siempre paga puntual. Hoy tienes la meta de ofrecer seguro de hogar."},
{type:"client",text:"Buenos días, vengo a pagar mi dividendo como siempre."},
{type:"choice",question:"Es un cliente recurrente. ¿Cómo abres la conversación?",options:[
{text:"Buenos días don [nombre]. Siempre tan puntual. Oiga, aprovechando que está acá, ¿le puedo hacer una consulta rápida sobre su casa?",score:5,feedback:"Excelente. Usaste su nombre, lo reconociste como cliente fiel, y pediste permiso. Triple combo."},
{text:"Buenos días. ¿Le interesa un seguro para su casa?",score:1,feedback:"Sin contexto, sin rapport, sin conexión. Es como pedirle matrimonio en la primera cita."},
{text:"Listo su pago. ¿Necesita algo más?",score:0,feedback:"Oportunidad perdida. Cada visita es una chance de venta."}
]},
{type:"client",text:"Sí, dígame. ¿Qué pasa con mi casa?"},
{type:"choice",question:"Te dio la apertura. ¿Qué pregunta haces?",options:[
{text:"¿Su casa tiene seguro contra incendio y terremoto? Porque veo que lleva años pagando su dividendo y sería terrible perder esa inversión por un siniestro.",score:5,feedback:"SPIN perfecto: Situación + Implicación en una sola pregunta. Lo haces pensar en el riesgo."},
{text:"Nuestro seguro de hogar cubre hasta 3.000 UF por incendio y sismo. ¿Lo quiere?",score:2,feedback:"Dato correcto pero sin conexión emocional. Primero necesita SENTIR la necesidad."},
{text:"Chile es un país sísmico. ¿Sabía que el 27F destruyó miles de casas?",score:3,feedback:"Buen dato pero suena a clase de historia. Hazlo personal: SU casa, SU inversión."}
]},
{type:"client",text:"La verdad no tiene seguro aparte del que viene con el crédito. Pero ese solo cubre lo que debo, no el valor real de la casa."},
{type:"choice",question:"El cliente reveló un problema real. ¿Cómo aprovechas?",options:[
{text:"Exacto. El seguro del crédito protege al BANCO, no a USTED. Si hay un terremoto, el banco recupera su deuda, pero usted pierde su casa y todo lo que tiene adentro. Nuestro seguro de hogar lo protege a USTED: hasta 3.000 UF por estructura y 450 UF por contenido. Y lo mejor: no requiere inspección.",score:5,feedback:"Magistral. Diferenciaste entre el seguro del banco y el del cliente. Eso es conocimiento que genera confianza."},
{text:"Le recomiendo contratar uno adicional para estar más protegido.",score:2,feedback:"Genérico. No le dijiste POR QUÉ es diferente ni qué gana él."},
{text:"Sí, muchos clientes tienen ese problema. ¿Quiere que le cotice?",score:3,feedback:"Está bien pero perdiste la oportunidad de demostrar conocimiento y generar urgencia."}
]},
{type:"end",text:"Don [nombre] contrató el Seguro Protección Hogar. Ahora su casa y su contenido están protegidos de verdad, no solo la deuda del banco."}
]}
];
let simState={scenario:null,stepIdx:0,totalScore:0,maxScore:0};

function renderSimulador(){const c=document.getElementById('simContainer');c.innerHTML='<h2 class="section-title">Elige un escenario</h2><p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Escenarios reales de BancoEstado. El cliente NO viene a comprar un seguro: viene por otro trámite. Tu misión es detectar la oportunidad y cerrar la venta.</p>'+SCENARIOS.map(s=>`<div class="sim-scenario-card" onclick="startSim(${s.id})"><div class="sim-scenario-title">${s.title}</div><div class="sim-scenario-desc">${s.desc}</div><div class="sim-scenario-diff diff-${s.diff}">Dificultad: ${s.diff.charAt(0).toUpperCase()+s.diff.slice(1)}</div></div>`).join('');}

function startSim(id){simState={scenario:JSON.parse(JSON.stringify(SCENARIOS.find(s=>s.id===id))),stepIdx:0,totalScore:0,maxScore:0,chat:[]};renderSimStep();}

function renderSimStep(){const c=document.getElementById('simContainer');const s=simState.scenario;if(simState.stepIdx>=s.steps.length)return;const step=s.steps[simState.stepIdx];
if(step.type==='context'){simState.chat.push({type:'context',text:step.text});simState.stepIdx++;renderSimStep();return;}
if(step.type==='client'){simState.chat.push({type:'client',text:step.text});simState.stepIdx++;renderSimStep();return;}
if(step.type==='end'){const pct=simState.maxScore>0?Math.round((simState.totalScore/simState.maxScore)*100):0;const xp=Math.round(pct/5);addXP(xp);
c.innerHTML=`<div class="sim-chat">${buildChat()}</div><div class="quiz-result"><div class="quiz-score">${pct}%</div><div class="quiz-msg">${step.text}</div><p style="color:var(--text2);margin-bottom:24px">+${xp} XP ganados</p><button class="primary-btn" onclick="renderSimulador()">Otro Escenario</button></div>`;return;}
if(step.type==='choice'){simState.maxScore+=5;
c.innerHTML=`<div class="sim-chat">${buildChat()}</div><div class="sim-question">${step.question}</div><div class="sim-options">${step.options.map((o,i)=>`<div class="sim-option" onclick="simAnswer(${i})">${o.text}</div>`).join('')}</div>`;}}

function buildChat(){return simState.chat.map(m=>{if(m.type==='context')return`<div class="sim-msg context"><div class="sender">📋 Contexto</div>${m.text}</div>`;if(m.type==='client')return`<div class="sim-msg client"><div class="sender">👤 Cliente</div>${m.text}</div>`;if(m.type==='user')return`<div class="sim-msg user"><div class="sender">Tú</div>${m.text}</div>`;if(m.type==='feedback')return`<div class="sim-msg feedback"><div class="sender">${m.score>=4?'✅':'⚠️'} Feedback</div>${m.text}</div>`;return'';}).join('');}

function simAnswer(i){const step=simState.scenario.steps[simState.stepIdx];const opt=step.options[i];simState.totalScore+=opt.score;simState.chat.push({type:'user',text:opt.text});simState.chat.push({type:'feedback',text:opt.feedback,score:opt.score});simState.stepIdx++;renderSimStep();}

// Register
function registrarInteraccion(){const tipo=document.getElementById('regTipo').value;const prod=document.getElementById('regProducto').value;const notas=document.getElementById('regNotas').value;const icons={venta:'✅',cotizacion:'📝',contacto:'📞',rechazo:'❌'};const xpMap={venta:50,cotizacion:25,contacto:15,rechazo:10};const xp=xpMap[tipo]||10;if(tipo==='venta')state.ventas++;state.activities.push({icon:icons[tipo],title:`${tipo.charAt(0).toUpperCase()+tipo.slice(1)}: ${prod}`,time:new Date().toLocaleString('es-CL'),xp:xp,notas:notas});checkAchievements();saveState();addXP(xp);document.getElementById('regNotas').value='';navigateTo('home');}

// Logros
const ACHIEVEMENTS=[
{id:'first_sale',icon:'🥇',name:'Primera Venta',desc:'Registra tu primera venta',check:s=>s.ventas>=1},
{id:'five_sales',icon:'⭐',name:'5 Ventas',desc:'Registra 5 ventas',check:s=>s.ventas>=5},
{id:'ten_sales',icon:'🌟',name:'10 Ventas',desc:'Registra 10 ventas',check:s=>s.ventas>=10},
{id:'streak3',icon:'🔥',name:'Racha de 3',desc:'3 días consecutivos',check:s=>s.streak>=3},
{id:'streak7',icon:'💥',name:'Racha de 7',desc:'7 días consecutivos',check:s=>s.streak>=7},
{id:'level3',icon:'📈',name:'Nivel 3',desc:'Alcanza nivel 3',check:s=>s.level>=3},
{id:'level5',icon:'🚀',name:'Nivel 5',desc:'Alcanza nivel 5',check:s=>s.level>=5},
{id:'quiz_master',icon:'🧠',name:'Quiz Master',desc:'Completa 5 quizzes',check:s=>(s.quizDone||[]).length>=5},
{id:'xp100',icon:'💎',name:'100 XP',desc:'Acumula 100 XP',check:s=>s.xp>=100},
{id:'xp500',icon:'👑',name:'500 XP',desc:'Acumula 500 XP',check:s=>s.xp>=500}
];
function checkAchievements(){ACHIEVEMENTS.forEach(a=>{if(!state.logros.includes(a.id)&&a.check(state)){state.logros.push(a.id);showToast('🏆 Logro: '+a.name);}});}
function renderLogros(){document.getElementById('logrosGrid').innerHTML=ACHIEVEMENTS.map(a=>{const unlocked=state.logros.includes(a.id);return`<div class="logro-card ${unlocked?'unlocked':'locked'}"><div class="logro-icon">${a.icon}</div><div class="logro-name">${a.name}</div><div class="logro-desc">${a.desc}</div></div>`;}).join('');}

// Perfil
function renderPerfil(){document.getElementById('perfilContent').innerHTML=`
<div style="text-align:center;margin-bottom:24px"><div class="avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto 12px">M</div><h2>Matías</h2><p style="color:var(--text2)">Ejecutivo de Seguros</p></div>
<div class="perfil-stats"><div class="perfil-stat"><div class="perfil-stat-value">${state.xp}</div><div class="perfil-stat-label">XP Total</div></div><div class="perfil-stat"><div class="perfil-stat-value">${state.level}</div><div class="perfil-stat-label">Nivel</div></div><div class="perfil-stat"><div class="perfil-stat-value">${state.ventas}</div><div class="perfil-stat-label">Ventas</div></div><div class="perfil-stat"><div class="perfil-stat-value">${state.streak}</div><div class="perfil-stat-label">Racha</div></div></div>
<div class="detail-section"><div class="detail-section-title">📊 Estadísticas</div><ul class="detail-list"><li>Actividades registradas: ${state.activities.length}</li><li>Logros desbloqueados: ${state.logros.length}/${ACHIEVEMENTS.length}</li></ul></div>
<button class="primary-btn" style="margin-top:20px;background:linear-gradient(135deg,#ff3366,#ff6b35)" onclick="if(confirm('¿Resetear todo?')){localStorage.clear();location.reload();}">Resetear Datos</button>`;}

// Populate product select
function populateProductSelect(){if(!DB)return;const sel=document.getElementById('regProducto');sel.innerHTML='';DB.categorias.forEach(c=>{c.productos.forEach(p=>{sel.innerHTML+=`<option value="${p.nombre}">${p.nombre}</option>`;});});}
setInterval(()=>{if(DB&&document.getElementById('regProducto').options.length===0)populateProductSelect();},500);

// Utilities
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function showToast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}
function confetti(){const colors=['#00d4aa','#7c5cfc','#ff6b9d','#ffa940','#00b4ff'];for(let i=0;i<15;i++){const c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=colors[Math.floor(Math.random()*colors.length)];c.style.animationDelay=Math.random()*0.5+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),3500);}}
