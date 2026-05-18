// Sales Command Center - App Logic
let DB=null,state={xp:0,level:1,streak:0,ventas:0,lastDay:null,activities:[],quizDone:[],logros:[],metaMensual:0};
const LEVELS=[{n:'Novato',xp:100},{n:'Aprendiz',xp:250},{n:'Vendedor',xp:500},{n:'Experto',xp:1000},{n:'Maestro',xp:2000},{n:'Leyenda',xp:5000}];
const TIPS=["El SONAP cuesta solo 0.16 UF/mes. 1 de cada 3 personas desarrollará cáncer. Úsalo como argumento.","El seguro de Pérdida Total es perfecto para autos viejos: bajo costo, alta protección.","Chile es país sísmico. Todo hogar DEBERÍA tener seguro de incendio con cobertura sísmica.","El Seguro Muerte Accidental con Ahorro: 50% de la prima se devuelve como ahorro. No es gasto, es inversión.","Sale Seguro Plus cubre hasta 20 UF si te asaltan en el cajero. Perfecto para clientes que retiran efectivo.","SOAP es venta segura: todo auto lo necesita por ley para circular.","Seguro Viaje: una noche de hospital en el extranjero puede costar millones. Este seguro lo cubre.","Para Pymes: ofrecer salud complementaria mejora retención de talento. Mínimo 5 trabajadores.","RCI obligatorio para viajar en auto a Argentina. Temporada alta = ventas masivas.","El Full Ambulatorio reembolsa 70% de consultas SIN deducible. Complementa FONASA/Isapre."];
const QUOTES=["El éxito no se trata de suerte, se trata de preparación.","Cada 'no' te acerca más al próximo 'sí'.","No vendas un seguro, vende tranquilidad.","La diferencia entre un buen vendedor y un excelente vendedor es la constancia.","Tu actitud determina tu altitud.","Hoy es un gran día para cerrar esa venta.","El mejor momento para vender fue ayer. El segundo mejor es ahora.","Los campeones no se hacen en los gimnasios, se hacen con algo que tienen muy adentro: un deseo, un sueño.","Sé tan bueno que no puedan ignorarte.","El cliente no compra productos, compra soluciones a sus problemas.","Cada cliente es una oportunidad de cambiar una vida.","La confianza se construye con conocimiento. Estudia tus productos.","No hay atajos hacia la excelencia.","Vender es servir. Sirve bien y venderás mejor.","Hoy alguien necesita exactamente lo que tú ofreces."];
const CTAS=["¡A romperla! 🔥","¡Vamos con todo! 💪","¡A cerrar ventas! 🎯","¡Hoy es el día! ⚡","¡A conquistar! 🚀","¡Dale con todo! 🏆"];

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
function navigateTo(p){document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));document.getElementById('page-'+p).classList.add('active');document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.toggle('active',b.dataset.page===p);});const renders={home:renderHome,productos:renderProductos,quiz:renderQuiz,simulador:renderSimulador,logros:renderLogros,perfil:renderPerfil};if(renders[p])renders[p]();document.getElementById('pages').scrollTop=0;}
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

// Simulator
const SCENARIOS=[
{id:1,title:"Cliente joven sin seguros",desc:"Persona de 25 años, primera cuenta. No tiene ningún seguro.",diff:"facil",msgs:[
{from:"client",text:"Hola, vengo a abrir una cuenta. No tengo ningún seguro, nunca he necesitado uno."},
{from:"options",choices:[
{text:"Le recomiendo el SONAP, cuesta solo 0.16 UF al mes y lo protege contra cáncer.",next:1,score:3},
{text:"Debería contratar todos nuestros seguros, son muy buenos.",next:2,score:0},
{text:"¿Sabía que 1 de cada 3 personas desarrolla cáncer? El SONAP le da tranquilidad por menos de $6.000 al mes.",next:3,score:5}
]},
{from:"client",text:"¿Tan barato? No sabía. ¿Y qué cubre exactamente?"},
{from:"options",choices:[
{text:"Cubre diagnóstico de cáncer hasta 600 UF, muerte accidental hasta 1.200 UF, e incluye exámenes preventivos gratis.",next:4,score:5},
{text:"Cubre cáncer y muerte. Es muy completo.",next:5,score:2}
]},
{from:"client",text:"Me interesa. ¿Cómo lo contrato?"},
{from:"end",score:"excellent",text:"¡Excelente! Venta cerrada. Has demostrado conocimiento del producto y empatía con el cliente."}
]},
{id:2,title:"Propietario preocupado por terremotos",desc:"Dueño de casa, zona sísmica. Consulta por protección de vivienda.",diff:"medio",msgs:[
{from:"client",text:"Tengo una casa y con los temblores me preocupa. ¿Tienen algo que me proteja?"},
{from:"options",choices:[
{text:"Sí, nuestro Seguro Incendio Hogar cubre estructura hasta 3.000 UF e incluye cobertura sísmica opcional.",next:1,score:5},
{text:"Tenemos seguros de hogar. ¿Le interesa?",next:2,score:1},
{text:"Chile es país sísmico. Le recomiendo Protección Hogar que además cubre reubicación temporal si su casa queda inhabitable.",next:3,score:5}
]},
{from:"client",text:"¿Y si mi casa se daña y no puedo vivir ahí?"},
{from:"options",choices:[
{text:"Protección Hogar cubre gastos de reubicación temporal, retiro de escombros, e incluso pérdida de arriendo si la tenía arrendada.",next:4,score:5},
{text:"Tendría que buscar donde quedarse mientras tanto.",next:5,score:0}
]},
{from:"client",text:"Suena bien. ¿Necesito inspección?"},
{from:"options",choices:[
{text:"¡No! Una de las ventajas es que NO requiere inspección. Si su casa tiene menos de 60 años, podemos activarlo ahora mismo.",next:6,score:5},
{text:"Déjeme verificar...",next:7,score:1}
]},
{from:"end",score:"excellent",text:"¡Gran venta! Conoces los detalles que importan al cliente."}
]},
{id:3,title:"Conductor con auto antiguo",desc:"Cliente con auto de 18 años. Busca seguro económico.",diff:"medio",msgs:[
{from:"client",text:"Mi auto tiene 18 años, ¿puedo asegurarlo? En todos lados me rechazan."},
{from:"options",choices:[
{text:"Tenemos el Seguro de Pérdida Total que acepta autos de hasta 20 años. Es económico y cubre robo total y destrucción completa.",next:1,score:5},
{text:"Con 18 años va a ser difícil asegurarlo en cualquier parte.",next:2,score:0},
{text:"Podemos ver opciones. ¿Qué tipo de uso le da al auto?",next:3,score:3}
]},
{from:"client",text:"¿Y qué tan caro es?"},
{from:"options",choices:[
{text:"Es la opción más económica porque solo cubre pérdida total, no daños menores. Perfecto para autos con más años donde una reparación grande no vale la pena.",next:4,score:5},
{text:"Depende del auto, tendría que cotizar.",next:5,score:2}
]},
{from:"end",score:"good",text:"Bien manejado. Ofreciste la solución correcta para su situación."}
]}
];
let simState={scenario:null,msgIdx:0,totalScore:0};

function renderSimulador(){const c=document.getElementById('simContainer');c.innerHTML='<h2 class="section-title">Elige un escenario</h2>'+SCENARIOS.map(s=>`<div class="sim-scenario-card" onclick="startSim(${s.id})"><div class="sim-scenario-title">${s.title}</div><div class="sim-scenario-desc">${s.desc}</div><div class="sim-scenario-diff diff-${s.diff}">Dificultad: ${s.diff.charAt(0).toUpperCase()+s.diff.slice(1)}</div></div>`).join('');}

function startSim(id){simState={scenario:SCENARIOS.find(s=>s.id===id),msgIdx:0,totalScore:0};renderSimStep();}
function renderSimStep(){const c=document.getElementById('simContainer');const s=simState.scenario;if(simState.msgIdx>=s.msgs.length)return;const m=s.msgs[simState.msgIdx];if(m.from==='end'){const xp=simState.totalScore*5;addXP(xp);c.innerHTML=`<div class="sim-chat">${buildChatHTML()}</div><div class="quiz-result"><div class="quiz-score">${simState.totalScore} pts</div><div class="quiz-msg">${m.text}</div><p style="color:var(--text2);margin-bottom:24px">+${xp} XP ganados</p><button class="primary-btn" onclick="renderSimulador()">Otro Escenario</button></div>`;return;}
c.innerHTML=`<div class="sim-chat">${buildChatHTML()}</div>${m.from==='options'?`<div class="sim-options">${m.choices.map((ch,i)=>`<div class="sim-option" onclick="simChoose(${i})">${ch.text}</div>`).join('')}</div>`:''}`;}

function buildChatHTML(){const s=simState.scenario;let h='';for(let i=0;i<=simState.msgIdx&&i<s.msgs.length;i++){const m=s.msgs[i];if(m.from==='client')h+=`<div class="sim-msg client"><div class="sender">👤 Cliente</div>${m.text}</div>`;if(m.userReply)h+=`<div class="sim-msg user"><div class="sender">Tú</div>${m.userReply}</div>`;}return h;}

function simChoose(i){const m=simState.scenario.msgs[simState.msgIdx];const ch=m.choices[i];simState.totalScore+=ch.score;simState.scenario.msgs[simState.msgIdx].userReply=ch.text;simState.msgIdx++;renderSimStep();}

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
