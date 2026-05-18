// Simulator - Realistic Banking Scenarios (loaded as separate module)
const SCENARIOS=[
{id:1,title:"Señora viene a depositar",desc:"45 años, depósito a plazo.",diff:"facil",strategy:"SPIN + Anclaje",steps:[
{type:"context",text:"Señora de 45 años trae cheque para depósito a plazo fijo. Tranquila."},
{type:"client",text:"Hola, vengo a hacer un depósito a plazo con este cheque de mi finiquito."},
{type:"choice",question:"Trámite resuelto. ¿Cómo introduces el tema?",options:[
{text:"Señora, ¿puedo hacerle una consulta rápida antes de que se vaya?",score:5,feedback:"Pedir permiso abre la puerta sin presionar.",best:true},
{text:"Le cuento de nuestros seguros disponibles.",score:2,feedback:"No pediste permiso. Suena a comercial."},
{text:"Listo su depósito. Que le vaya bien.",score:0,feedback:"Oportunidad perdida con cliente receptivo."}]},
{type:"client",text:"Sí dígame, pero rápido que tengo que buscar a mis nietos."},
{type:"choice",question:"Tiene apuro. ¿Cómo conectas emocionalmente?",options:[
{text:"¿Usted cuida a sus nietos? ¿Qué pasaría si le pasa algo de salud?",score:5,feedback:"SPIN Implicación. La haces reflexionar sobre consecuencias.",best:true},
{text:"Es rapidísimo. ¿Tiene familia que dependa de usted?",score:4,feedback:"Buena pero genérica. Los nietos son más personales."},
{text:"El SONAP cuesta menos de $6.000 y cubre cáncer.",score:2,feedback:"Producto sin necesidad emocional. Primero el dolor."}]},
{type:"client",text:"No había pensado en eso... pero no tengo plata para seguros."},
{type:"choice",question:"Objeción de precio. ¿Qué técnica?",options:[
{text:"Son $6.000, menos que un café al día. Si le pasa algo, recibe 600 UF.",score:5,feedback:"Anclaje perfecto. Comparaste con algo cotidiano.",best:true},
{text:"Entiendo. Piénselo y vuelve cuando pueda.",score:0,feedback:"'Piénselo' = nunca vuelve. No aceptes la primera objeción."},
{text:"Es el más barato que tenemos.",score:2,feedback:"'Barato' sin contexto no convence. Reenmarca como inversión."}]},
{type:"end",text:"SPIN para crear necesidad + Anclaje para superar precio. Combo ganador."}]},
{id:2,title:"Joven activa CuentaRUT",desc:"22 años, primer trabajo.",diff:"facil",strategy:"Storytelling + Alternativa",steps:[
{type:"context",text:"Joven de 22, primer trabajo. Viene a activar CuentaRUT."},
{type:"client",text:"Hola, necesito activar mi CuentaRUT para que me depositen el sueldo."},
{type:"choice",question:"¿Cómo generas confianza?",options:[
{text:"Felicitaciones por la pega. ¿Primera vez con contrato?",score:5,feedback:"Rapport genuino. Interés personal genera confianza.",best:true},
{text:"Listo, activada. ¿Te interesa proteger tu tarjeta?",score:1,feedback:"Cero conexión. Del trámite al producto sin relación."},
{text:"Tu cuenta está lista. Sale Seguro Plus te conviene.",score:2,feedback:"Sin contexto. No le diste razón para escucharte."}]},
{type:"client",text:"Sí, primera vez. Estoy contento, voy a tener plata propia."},
{type:"choice",question:"¿Storytelling para conectar?",options:[
{text:"Un cabro como tú vino el mes pasado. Lo asaltaron en el cajero y perdió toda su quincena.",score:5,feedback:"Historia corta y relatable. Genera impacto real.",best:true},
{text:"Los asaltos en cajeros subieron 40% este año.",score:3,feedback:"Dato frío. A un joven le impacta más una historia."},
{text:"Ten cuidado al sacar plata, es peligroso.",score:1,feedback:"Asustaste sin solución. Plantea problema con respuesta."}]},
{type:"client",text:"¿En serio? ¿Qué se puede hacer?"},
{type:"choice",question:"Pidió la solución. ¿Alternativa para cerrar?",options:[
{text:"Sale Seguro te devuelve hasta 20 UF. ¿Con cargo mensual o anual?",score:5,feedback:"Alternativa: ambas opciones son SÍ. Sin chance de 'no'.",best:true},
{text:"Existe Sale Seguro. ¿Lo quieres?",score:2,feedback:"SÍ o NO. Nunca des opción de decir 'no'."},
{text:"Sale Seguro cubre cajero, compras y robo. Te lo recomiendo.",score:3,feedback:"Buena info pero no cerraste. Recomendar ≠ cerrar."}]},
{type:"end",text:"Storytelling para urgencia + Alternativa para cerrar. Técnica pro."}]},
{id:3,title:"Señor paga dividendo",desc:"55 años, cliente recurrente.",diff:"medio",strategy:"Espejo + Resumen Inverso",steps:[
{type:"context",text:"Señor de 55 paga dividendo mensual. Lo ves todos los meses."},
{type:"client",text:"Buenos días, vengo a pagar mi dividendo como siempre."},
{type:"choice",question:"Cliente habitual. ¿Cómo abres?",options:[
{text:"Don Carlos, ¿su casa tiene seguro aparte del crédito?",score:5,feedback:"Natural, con nombre, pregunta de Situación.",best:true},
{text:"¿Sabía que debería tener seguro de hogar?",score:2,feedback:"'Debería' suena a regaño. Genera resistencia."},
{text:"Listo su pago. Que le vaya bien.",score:0,feedback:"Cada visita es oportunidad desperdiciada."}]},
{type:"client",text:"Solo el del crédito. Me preocupa con tantos temblores..."},
{type:"choice",question:"Dijo 'me preocupa'. ¿El Espejo?",options:[
{text:"¿Le preocupan los temblores? Cuénteme más.",score:5,feedback:"Espejo perfecto. Repetiste y lo invitas a expandir.",best:true},
{text:"Tiene razón, Chile es sísmico. Le ofrezco seguro hogar.",score:3,feedback:"Saltaste al producto. Espejo te da más info para personalizar."},
{text:"No se preocupe, los temblores son normales.",score:0,feedback:"Invalidaste su preocupación. Eso mata la venta."}]},
{type:"client",text:"Mi señora dice que perdemos casa, muebles y seguimos debiendo."},
{type:"choice",question:"3 puntos de dolor. ¿Resumen Inverso?",options:[
{text:"Usted dijo: casa, contenido y deuda. Nuestro seguro cubre los 3. ¿Lo activamos?",score:5,feedback:"Resumen Inverso: SUS palabras. No puede discutir contra sí mismo.",best:true},
{text:"Eso le puede pasar. Nuestro seguro cubre hasta 3.000 UF.",score:3,feedback:"No usaste sus palabras. El Resumen es más poderoso con SU lenguaje."},
{text:"Hable con su señora y vuelvan juntos.",score:1,feedback:"'Volver después' = nunca. Él ya tiene la preocupación."}]},
{type:"end",text:"Espejo para info + Resumen Inverso para cerrar. Nivel avanzado."}]},
{id:4,title:"Mamá cobra bono",desc:"35 años con hijo pequeño.",diff:"medio",strategy:"Los 2 SÍ + Urgencia",steps:[
{type:"context",text:"Mamá de 35 cobra bono familiar. Viene con hijo de 5 años."},
{type:"client",text:"Hola, vengo a cobrar el bono. ¿Me lo depositan en la CuentaRUT?"},
{type:"choice",question:"Tiene hijo. ¿Cómo abres?",options:[
{text:"Listo su bono. Qué lindo su hijo. ¿Cómo se llama?",score:5,feedback:"Rapport con el hijo baja TODAS las defensas de una mamá.",best:true},
{text:"Listo. ¿Su hijo tiene seguro de salud?",score:3,feedback:"Directa. Conecta emocionalmente primero."},
{text:"Depositado. ¿Necesita algo más?",score:0,feedback:"Mamá con hijo = oportunidad de oro perdida."}]},
{type:"client",text:"Se llama Tomás. Diga hola Tomás. Jaja, es tímido."},
{type:"choice",question:"Hay confianza. ¿Los Dos SÍ?",options:[
{text:"¿Tomás va al colegio? ¿Le gustaría asegurar su educación pase lo que pase?",score:5,feedback:"Dos SÍ perfectos: obvios, emocionales, conectan con cierre.",best:true},
{text:"¿Tiene seguro de vida? Es importante para Tomás.",score:3,feedback:"Saltaste al producto. Los 2 SÍ preparan el cerebro."},
{text:"¿Le interesa conocer seguros familiares?",score:2,feedback:"Pregunta cerrada que invita a decir 'no'."}]},
{type:"client",text:"Sí va al kínder. Y obvio que quiero lo mejor para él."},
{type:"choice",question:"Dos SÍ dichos. ¿Urgencia Real?",options:[
{text:"1 de cada 3 personas desarrollará cáncer. SONAP protege por $6.000. ¿Se lo activo?",score:5,feedback:"Urgencia real + cierre directo. Informaste y cerraste.",best:true},
{text:"Le recomiendo el SONAP. Cubre cáncer y muerte.",score:3,feedback:"Sin urgencia. ¿Por qué HOY y no mañana?"},
{text:"Piénselo y cuando vuelva lo vemos.",score:0,feedback:"Ya dijo SÍ dos veces. El momento es AHORA."}]},
{type:"end",text:"Rapport + Los 2 SÍ + Urgencia. Combo letal con mamás."}]},
{id:5,title:"Comerciante pide crédito",desc:"40 años, dueño de almacén.",diff:"dificil",strategy:"Espejo + Alternativa",steps:[
{type:"context",text:"Hombre de 40, dueño de almacén. Pide crédito. Directo y apurado."},
{type:"client",text:"Necesito crédito de 3 millones para mercadería. ¿Se puede?"},
{type:"choice",question:"Cliente directo. ¿Cómo manejas?",options:[
{text:"Lo vemos altiro. Mientras proceso, ¿qué tipo de negocio tiene?",score:5,feedback:"Seguiste su ritmo y preguntaste natural.",best:true},
{text:"Sí se puede. Antes le cuento de seguros para emprendedores.",score:1,feedback:"No le cambies el tema a un tipo directo."},
{text:"Déjeme revisar si califica.",score:3,feedback:"Solo técnico. Perdiste chance de conocerlo."}]},
{type:"client",text:"Almacén de barrio, 12 años. La cosa ha estado dura pero me mantengo."},
{type:"choice",question:"Dijo 'ha estado dura'. ¿El Espejo?",options:[
{text:"¿Ha estado dura? ¿En qué sentido?",score:5,feedback:"Espejo textbook. Tres palabras que abren toda su historia.",best:true},
{text:"La economía está difícil para todos.",score:2,feedback:"Empatía genérica. No se sintió escuchado."},
{text:"12 años es harto. ¿Ha pensado en proteger su negocio?",score:3,feedback:"Buena transición pero pudiste sacar más info."}]},
{type:"client",text:"Me robaron mercadería por 500 lucas y se inundó el local. Nadie me pagó."},
{type:"choice",question:"Pérdidas concretas. ¿Alternativa?",options:[
{text:"Con seguro Pyme eso no pasa más. ¿Cobertura de robo o completa con inundación?",score:5,feedback:"Alternativa personalizada a SUS problemas. Ambas son SÍ.",best:true},
{text:"Debería tener seguro. ¿Quiere que cotice?",score:3,feedback:"'¿Quiere?' es SÍ o NO. 'Debería' = sermón."},
{text:"Tenemos seguros Pyme que cubren robo, incendio y agua.",score:2,feedback:"Lista de datos sin cierre. Informar ≠ vender."}]},
{type:"end",text:"Espejo para revelar problemas + Alternativa para cerrar. Nivel experto."}]},
{id:6,title:"Abuelito cobra pensión",desc:"70 años, desconfiado. Ya dijo que no.",diff:"dificil",strategy:"Storytelling + Resumen",steps:[
{type:"context",text:"Señor de 70 cobra pensión. Amable pero desconfiado. Te dijo 'no' antes."},
{type:"client",text:"Hola mijito, vengo a cobrar mi pensión. Y no me ofrezca nada."},
{type:"choice",question:"Rechazo de entrada. ¿Cómo manejas?",options:[
{text:"Tranquilo don Pedro, no le ofrezco nada. Solo quiero contarle algo que pasó.",score:5,feedback:"Quitaste presión y abriste con curiosidad.",best:true},
{text:"Entiendo. Aquí tiene su pensión.",score:2,feedback:"Respetaste pero perdiste otra oportunidad."},
{text:"Pero don Pedro, esta vez es diferente...",score:0,feedback:"Ignoraste su pedido. Destruye la confianza."}]},
{type:"client",text:"Ya cuénteme. Pero si me va a vender algo, no tengo plata."},
{type:"choice",question:"Dio permiso. ¿Storytelling?",options:[
{text:"Un señor como usted vino el mes pasado. Lo asaltaron al salir y le quitaron toda la pensión.",score:5,feedback:"Historia que duele. Se identifica al 100%.",best:true},
{text:"Los adultos mayores son los más vulnerables a asaltos en bancos.",score:3,feedback:"Dato impersonal. La historia de alguien como él impacta más."},
{text:"Hay un seguro que protege su pensión por poca plata.",score:2,feedback:"Producto sin emoción. Storytelling prepara el terreno."}]},
{type:"client",text:"Pobre hombre. Me da miedo, salgo con toda la plata del mes. A mi edad no puedo ni arrancar."},
{type:"choice",question:"3 miedos revelados. ¿Resumen Inverso?",options:[
{text:"Don Pedro: asalto, toda la plata encima, no puede defenderse. Sale Seguro cubre los 3. ¿Lo activo?",score:5,feedback:"Resumen con SUS miedos. No puede decir que no.",best:true},
{text:"Sale Seguro devuelve hasta 20 UF si lo asaltan.",score:3,feedback:"Correcto pero no usaste sus palabras."},
{text:"Le conviene contratarlo, tiene respaldo.",score:2,feedback:"Tu opinión. Al cliente le importa lo que ÉL siente."}]},
{type:"end",text:"Convertiste un NO en venta. Storytelling + Resumen = nivel maestro."}]}
];
let simState={scenario:null,stepIdx:0,totalScore:0,maxScore:0};

function renderSimulador(){const c=document.getElementById('simContainer');c.innerHTML='<h2 class="section-title">Elige un escenario</h2><p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Cada escenario practica estrategias diferentes. Si te equivocas, te mostramos la respuesta correcta.</p>'+SCENARIOS.map(s=>`<div class="sim-scenario-card" onclick="startSim(${s.id})"><div class="sim-scenario-title">${s.title}</div><div class="sim-scenario-desc">${s.desc}</div><div class="sim-scenario-diff diff-${s.diff}">${s.strategy}</div></div>`).join('');}

function startSim(id){simState={scenario:JSON.parse(JSON.stringify(SCENARIOS.find(s=>s.id===id))),stepIdx:0,totalScore:0,maxScore:0,chat:[]};renderSimStep();}

function renderSimStep(){const c=document.getElementById('simContainer');const s=simState.scenario;if(simState.stepIdx>=s.steps.length)return;const step=s.steps[simState.stepIdx];
if(step.type==='context'){simState.chat.push({type:'context',text:step.text});simState.stepIdx++;renderSimStep();return;}
if(step.type==='client'){simState.chat.push({type:'client',text:step.text});simState.stepIdx++;renderSimStep();return;}
if(step.type==='end'){const pct=simState.maxScore>0?Math.round((simState.totalScore/simState.maxScore)*100):0;const xp=Math.round(pct/5);addXP(xp);
c.innerHTML=`<div class="sim-chat">${buildChat()}</div><div class="quiz-result"><div class="quiz-score">${pct}%</div><div class="quiz-msg">${step.text}</div><p style="color:var(--text2);margin-bottom:24px">+${xp} XP ganados</p><button class="primary-btn" onclick="renderSimulador()">Otro Escenario</button></div>`;return;}
if(step.type==='choice'){simState.maxScore+=5;
c.innerHTML=`<div class="sim-chat">${buildChat()}</div><div class="sim-question">${step.question}</div><div class="sim-options">${step.options.map((o,i)=>`<div class="sim-option" onclick="simAnswer(${i})">${o.text}</div>`).join('')}</div>`;}}

function buildChat(){return simState.chat.map(m=>{if(m.type==='context')return`<div class="sim-msg context"><div class="sender">📋 Contexto</div>${m.text}</div>`;if(m.type==='client')return`<div class="sim-msg client"><div class="sender">👤 Cliente</div>${m.text}</div>`;if(m.type==='user')return`<div class="sim-msg user"><div class="sender">Tú</div>${m.text}</div>`;if(m.type==='feedback')return`<div class="sim-msg feedback ${m.isGood?'good':'bad'}"><div class="sender">${m.isGood?'✅ Correcto':'⚠️ Mejorable'}</div>${m.text}</div>`;if(m.type==='correction')return`<div class="sim-msg correction"><div class="sender">💡 Mejor respuesta:</div>${m.text}</div>`;return'';}).join('');}

function simAnswer(i){const step=simState.scenario.steps[simState.stepIdx];const opt=step.options[i];simState.totalScore+=opt.score;const isGood=opt.score>=4;simState.chat.push({type:'user',text:opt.text});simState.chat.push({type:'feedback',text:opt.feedback,isGood});if(!isGood){const best=step.options.find(o=>o.best);if(best)simState.chat.push({type:'correction',text:best.text});}simState.stepIdx++;renderSimStep();}
