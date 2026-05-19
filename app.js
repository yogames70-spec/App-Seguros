// Sales Command Center - App Logic
let DB=null,state={xp:0,level:1,streak:0,ventas:0,lastDay:null,activities:[],quizDone:[],logros:[],metaMensual:0};
const LEVELS=[{n:'Novato',xp:100},{n:'Aprendiz',xp:250},{n:'Vendedor',xp:500},{n:'Experto',xp:1000},{n:'Maestro',xp:2000},{n:'Leyenda',xp:5000}];
const TIPS=["El SONAP cuesta solo 0.16 UF/mes. 1 de cada 3 personas desarrollará cáncer. Úsalo como argumento.","El seguro de Pérdida Total es perfecto para autos viejos: bajo costo, alta protección.","Chile es país sísmico. Todo hogar DEBERÍA tener seguro de incendio con cobertura sísmica.","El Seguro Muerte Accidental con Ahorro: 50% de la prima se devuelve como ahorro. No es gasto, es inversión.","Sale Seguro Plus cubre hasta 20 UF si te asaltan en el cajero. Perfecto para clientes que retiran efectivo.","SOAP es venta segura: todo auto lo necesita por ley para circular.","Seguro Viaje: una noche de hospital en el extranjero puede costar millones. Este seguro lo cubre.","Para Pymes: ofrecer salud complementaria mejora retención de talento. Mínimo 5 trabajadores.","RCI obligatorio para viajar en auto a Argentina. Temporada alta = ventas masivas.","El Full Ambulatorio reembolsa 70% de consultas SIN deducible. Complementa FONASA/Isapre."];
const QUOTES=["Si solo haces lo que ya sabes hacer, nunca serás más de lo que ya eres. Hoy es el día de ir más allá.","Nadie dijo que sería fácil. Pero tú no viniste acá buscando lo fácil. Viniste a romperla.","El dolor de la disciplina pesa gramos. El dolor del arrepentimiento pesa toneladas. Elige bien.","No te levantaste hoy para ser promedio. Te levantaste para demostrar de qué estás hecho.","Mientras otros duermen, tú te preparas. Mientras otros se rinden, tú insistes. Esa es la diferencia.","¿Esto es lo que soñaste o no? Entonces deja de quejarte y ve a buscarlo con todo.","El mundo no te debe nada. Pero tú te debes a ti mismo dar el máximo cada maldito día.","La comodidad es el enemigo del crecimiento. Si no te incomoda, no te está haciendo crecer.","Los que dicen que no se puede, que se hagan a un lado de los que lo están haciendo.","Hoy vas a salir ahí y vas a dejar todo. Sin excusas, sin medias tintas. Todo o nada."];
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

// === VENTAS EXTRAS: Objeciones, Detector, Frases Cierre, Errores, Desafío ===

const OBJECIONES=[
{obj:"No tengo plata",resp:["No es un gasto, es una inversión. Son $6.000 al mes, menos que un café al día. Si le pasa algo, recibe hasta 600 UF. ¿Puede darse el lujo de no tenerlo?","Entiendo que anda ajustado. Justamente por eso: si le pasa algo sin seguro, ¿de dónde saca la plata? El SONAP es la opción más económica.","Muchos clientes me dicen lo mismo. Pero cuando les explico que son menos de $200 diarios, se dan cuenta de que sí pueden. ¿Probamos?"]},
{obj:"Lo voy a pensar",resp:["Perfecto, ¿qué es exactamente lo que necesita pensar? Así lo ayudo a resolverlo ahora.","El 90% de las personas que dicen 'lo voy a pensar' no vuelven. No porque no quieran, sino porque se les olvida. ¿Lo dejamos listo hoy?","Solo le recuerdo que los seguros se contratan cuando uno está bien. ¿Lo dejamos activo por mientras?"]},
{obj:"Mi señora/marido tiene que decidir",resp:["¿Y si lo dejamos preaprobado para que le cuente en la casa? Si no le gusta, lo anulamos sin costo.","Justamente este seguro es PARA proteger a su familia. ¿No cree que estaría de acuerdo?","¿Tiene el teléfono? La podemos llamar ahora y le explicamos juntos en 2 minutos."]},
{obj:"Ya tengo seguro en otro lado",resp:["Excelente que se preocupe de estar protegido. ¿Me permite preguntarle qué cubre? Muchas veces hay coberturas que se complementan.","Nuestro seguro es complementario, no reemplaza al que tiene. Son coberturas distintas.","¿Cuánto paga al mes? Muchos clientes descubren que por menos plata pueden tener mejor cobertura acá."]},
{obj:"No creo en los seguros",resp:["Lo entiendo. Nadie cree hasta que lo necesita. ¿Le puedo contar algo que le pasó a un cliente?","Respeto su posición. Pero los imprevistos no avisan. ¿No prefiere estar cubierto por si acaso?","Si mañana le pasa algo inesperado, ¿quién cubre los gastos? El seguro existe para eso."]},
{obj:"Después vengo",resp:["¿Cuándo le queda mejor? Le agendo una hora para que no espere.","Esto toma literalmente 3 minutos. ¿Me da esos 3 minutos y se va tranquilo?","La mayoría de los que dicen 'después vengo' no vuelven porque la vida pasa. ¿3 minutitos ahora?"]},
{obj:"Es muy caro",resp:["¿Comparado con qué? Porque un imprevisto médico cuesta 10 veces más que un año de seguro.","¿Cuánto gasta al mes en café o en el teléfono? El seguro cuesta menos que eso.","El plan más accesible cuesta X. ¿Eso es realmente caro para la tranquilidad de su familia?"]},
{obj:"No lo necesito, estoy sano",resp:["Justamente por eso es el mejor momento. Los seguros se contratan estando bien. Después puede ser tarde.","Me alegro. Ojalá siga así siempre. Pero el seguro es como el cinturón: se pone ANTES del choque, no después.","Para que siga tranquilo si algo cambia, el SONAP le da respaldo por menos de $200 al día."]},
{obj:"Tengo que ver mis números",resp:["Son $6.000 al mes. ¿Eso cabe en su presupuesto?","¿Quiere que hagamos los números juntos ahora? Le muestro exactamente cuánto es diario.","El valor mensual es menos que un almuerzo. ¿Eso le parece razonable?"]},
{obj:"Me ofrecen seguros en todos lados",resp:["Tiene razón. La diferencia es que BancoEstado es respaldado por el Estado, con más de 100 años.","Por eso le conviene comparar. ¿Me deja mostrarle lo que cubrimos versus el promedio?","Le hago fácil: cubre X, cuesta Y, se activa ahora. Sin letra chica."]}
];

const DETECTOR_QUIZ=[
{tramite:"Cliente abre CuentaRUT",correcto:"Sale Seguro Plus",opciones:["SONAP","Sale Seguro Plus","Seguro Hogar","SOAP"]},
{tramite:"Cliente paga dividendo hipotecario",correcto:"Seguro Hogar",opciones:["Sale Seguro","Seguro Hogar","Seguro Viaje","SOAP"]},
{tramite:"Mamá viene con hijo pequeño",correcto:"SONAP",opciones:["SONAP","SOAP","Sale Seguro Plus","Seguro Pyme"]},
{tramite:"Cliente pide crédito de consumo",correcto:"Seguro Muerte Accidental",opciones:["Seguro Hogar","Seguro Viaje","Seguro Muerte Accidental","SOAP"]},
{tramite:"Abuelito cobra pensión",correcto:"Sale Seguro Plus",opciones:["SONAP","Seguro Pyme","Sale Seguro Plus","Seguro Hogar"]},
{tramite:"Cliente viene en auto a la sucursal",correcto:"SOAP / Pérdida Total",opciones:["Sale Seguro","SONAP","Seguro Viaje","SOAP / Pérdida Total"]},
{tramite:"Cliente pregunta por viaje al extranjero",correcto:"Seguro Viaje",opciones:["Seguro Viaje","SONAP","Sale Seguro Plus","Seguro Hogar"]},
{tramite:"Dueño de negocio pide crédito Pyme",correcto:"Seguro Pyme",opciones:["SONAP","Seguro Hogar","Seguro Pyme","SOAP"]},
{tramite:"Cliente deposita plata a plazo",correcto:"SONAP",opciones:["SOAP","Sale Seguro","Seguro Viaje","SONAP"]},
{tramite:"Cliente paga cuentas con tarjeta frecuentemente",correcto:"Sale Seguro",opciones:["Sale Seguro","SONAP","Seguro Hogar","Seguro Pyme"]}
];

const FRASES_CIERRE=[
{frase:"¿Se lo dejo activado con cargo a su cuenta?",porque:"Asume que el cliente ya decidió. No le das opción de decir 'no', solo estás confirmando la acción."},
{frase:"¿Prefiere el plan básico o el completo?",porque:"Técnica La Alternativa: ambas opciones son SÍ. El cerebro elige entre A o B, no entre SÍ o NO."},
{frase:"¿Lo dejamos con cargo mensual o anual?",porque:"Misma lógica de Alternativa pero enfocada en el método de pago. Ya asumiste que compra."},
{frase:"¿Empezamos con este y después vemos los otros?",porque:"Reduce la presión: 'empezamos' suena a paso pequeño. El cliente siente que no se está comprometiendo a todo."},
{frase:"¿Se lo activo ahora o prefiere volver otro día?",porque:"Urgencia sutil: 'volver otro día' suena a pérdida de tiempo. La mayoría elige 'ahora'."},
{frase:"Son 3 minutos. ¿Lo hacemos?",porque:"Minimiza el esfuerzo percibido. '3 minutos' hace que parezca algo trivial y fácil."},
{frase:"¿Lo dejamos listo para que se vaya tranquilo?",porque:"Conecta con la emoción de tranquilidad. No estás vendiendo un seguro, estás vendiendo paz mental."},
{frase:"¿Con cargo a la cuenta corriente o a la CuentaRUT?",porque:"Alternativa técnica: el cliente ya está eligiendo CÓMO pagar, no SI pagar."},
{frase:"Solo necesito su RUT y en 2 minutos queda listo.",porque:"Elimina fricción: suena tan fácil que decir 'no' sería más trabajo que decir 'sí'."},
{frase:"¿Lo activamos? Si no le gusta lo anulamos sin costo.",porque:"Elimina el riesgo percibido. El cliente siente que no pierde nada probando."}
];

const ERRORES_FATALES=[
{error:"Hablar más de lo que escuchas",porque:"El cliente se aburre y deja de confiar. El que controla la conversación es el que PREGUNTA, no el que habla.",solucion:"Regla 70/30: el cliente habla 70%, tú 30%."},
{error:"Preguntar '¿Lo quiere?'",porque:"Le das la opción fácil de decir NO. El cerebro siempre elige el camino fácil.",solucion:"Usa La Alternativa: '¿Plan A o Plan B?' Ambas son SÍ."},
{error:"Aceptar el primer NO",porque:"El 80% de las ventas se cierran después del 5to contacto. Un NO es solo el inicio de la conversación.",solucion:"Pregunta: '¿Qué es lo que le preocupa?' y aborda la objeción real."},
{error:"No usar el nombre del cliente",porque:"El nombre propio es la palabra favorita de cualquier persona. No usarlo = trato impersonal.",solucion:"Usa su nombre al menos 3 veces. 'Don Carlos, le cuento algo...'"},
{error:"Hablar en jerga técnica",porque:"'0.16 UF mensuales con cobertura oncológica' no le dice nada al cliente.",solucion:"Traduce a lenguaje simple: '$6.000 al mes, menos que un café. Si le pasa algo, queda cubierto.'"},
{error:"Ofrecer sin resolver primero",porque:"Si el cliente vino a pagar una cuenta y le hablas de seguros antes de su trámite, se molesta.",solucion:"PRIMERO resuelve lo que vino a hacer. DESPUÉS ofreces."},
{error:"Hablar mal de la competencia",porque:"Genera desconfianza. Si hablas mal de otros, el cliente piensa: '¿Qué dirá de mí?'",solucion:"Habla bien de TU producto. Deja que el cliente compare solo."},
{error:"No cerrar nunca",porque:"Muchos vendedores informan perfecto pero nunca hacen la pregunta de cierre. Informar NO es vender.",solucion:"Siempre termina con pregunta de acción: '¿Lo activamos?'"}
];

const DESAFIOS=[
"Hoy usa la técnica del ESPEJO con al menos 2 clientes. Repite sus últimas palabras en forma de pregunta.",
"Hoy cierra usando SOLO La Alternativa. Nunca preguntes '¿lo quiere?' Da siempre 2 opciones.",
"Hoy cuenta una HISTORIA REAL a cada cliente que atiendas. Las historias venden más que los datos.",
"Hoy usa el nombre del cliente AL MENOS 3 veces en cada conversación.",
"Hoy intenta hacer las 4 preguntas SPIN con al menos 1 cliente.",
"Hoy practica Los 2 SÍ antes del cierre. Dos preguntas obvias con respuesta SÍ antes de la pregunta de cierre.",
"Hoy tu meta es superar AL MENOS 1 objeción. Cuando te digan 'no', usa el Objection Killer.",
"Hoy ofrece un seguro a TODOS los clientes que atiendas, sin excepción. Mide tu tasa de conversión.",
"Hoy usa el RESUMEN INVERSO en al menos 1 cierre.",
"Hoy practica el ANCLAJE DE PRECIO. Muestra primero el producto caro, luego el accesible."
];

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

if(sec==='frases'){
h+=`<h2 class="section-title" style="margin-top:24px">Frases de Cierre Rápido</h2>`;
h+=`<p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">Toca cada frase para ver por qué funciona.</p>`;
FRASES_CIERRE.forEach((f,i)=>{
h+=`<div class="estrategia-card" onclick="this.classList.toggle('open')"><div class="estrategia-header"><div class="estrategia-num" style="background:linear-gradient(135deg,var(--accent4),var(--accent3))">${i+1}</div><div><div class="estrategia-nombre" style="font-style:italic">"${f.frase}"</div><div class="estrategia-cat">Frase de cierre</div></div><div class="estrategia-arrow">▼</div></div><div class="estrategia-body"><p class="estrategia-desc"><strong>¿Por qué funciona?</strong><br>${f.porque}</p></div></div>`;
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
function setupNav(){document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.page)));}

// Streak
function checkStreak(){const today=new Date().toDateString();if(state.lastDay===today)return;if(state.lastDay===new Date(Date.now()-86400000).toDateString()){state.streak++;}else if(state.lastDay!==today){state.streak=state.lastDay?0:1;}state.lastDay=today;saveState();}

// Seguros Quiz
const SEGUROS_QUIZ=[
{q:"¿Cuál es el seguro obligatorio para circular con un vehículo en Chile?",opts:["SONAP","SOAP","RCI","Sale Seguro"],correct:1,why:"El SOAP (Seguro Obligatorio de Accidentes Personales) es obligatorio por ley para renovar el permiso de circulación."},
{q:"¿Qué seguro necesita un cliente que viaja en auto a Argentina?",opts:["SOAP","Seguro Viaje","RCI","Seguro Automotriz"],correct:2,why:"El RCI (Responsabilidad Civil Internacional) es obligatorio para viajar con vehículo propio a países vecinos."},
{q:"El SONAP cubre principalmente:",opts:["Robo de tarjetas","Diagnóstico oncológico y muerte accidental","Hospitalización","Daños al hogar"],correct:1,why:"El SONAP es el Seguro Oncológico y de Muerte Accidental. Cubre diagnóstico de cáncer primario y fallecimiento por accidente."},
{q:"¿Cuánto cuesta el SONAP aproximadamente al mes?",opts:["$20.000","$50.000","$6.000 (0.16 UF)","$15.000"],correct:2,why:"El SONAP cuesta desde 0.16 UF mensuales, aproximadamente $6.000. Es uno de los seguros más económicos."},
{q:"¿Qué seguro protege al cliente si lo asaltan en el cajero automático?",opts:["SONAP","Seguro Hogar","Sale Seguro Plus","Seguro de Vida"],correct:2,why:"Sale Seguro Plus cubre uso forzado en cajero (20 UF), coacción en ventanilla (20 UF) y robo con violencia (10 UF)."},
{q:"¿El Seguro Muerte Accidental con Ahorro devuelve parte de la prima?",opts:["No, nunca","Sí, el 25%","Sí, el 50%","Sí, el 100%"],correct:2,why:"El 50% de cada prima se destina a un fondo de ahorro garantizado con rentabilidad de 1% + UF anual."},
{q:"¿Qué seguro es ideal para un cliente que paga dividendo hipotecario?",opts:["SOAP","Sale Seguro","Seguro Incendio Hogar","Seguro Viaje"],correct:2,why:"Si paga dividendo tiene casa. El seguro del crédito protege al banco, no al cliente. Necesita Seguro Hogar propio."},
{q:"¿Cuántos planes tiene el Seguro Accidentes Personales?",opts:["1 plan","2 planes: Plus y Full","3 planes","4 planes"],correct:1,why:"Tiene 2 planes: Plus (0.43 UF/año, 400 UF) y Full (0.67 UF/año, 700 UF + invalidez 2/3)."},
{q:"¿El Seguro Accidentes Personales requiere Declaración de Salud?",opts:["Sí, siempre","Solo mayores de 60","No requiere","Solo el plan Full"],correct:2,why:"No requiere Declaración de Salud. Esto facilita mucho la contratación."},
{q:"¿Qué cubre el Seguro Protección Desgravamen?",opts:["Robo de auto","Saldo del crédito si el titular fallece","Gastos médicos","Equipaje de viaje"],correct:1,why:"Si el titular fallece o queda inválido, el seguro paga el saldo pendiente del crédito. La familia no hereda la deuda."},
{q:"¿Cuál es la edad máxima de ingreso al Seguro Accidentes Personales?",opts:["65 años","70 años","78 años y 364 días","Sin límite"],correct:2,why:"La edad máxima de ingreso es 78 años y 364 días, con permanencia hasta 79 años y 364 días."},
{q:"¿Qué seguro recomiendas a una mamá que viene con su hijo pequeño?",opts:["SOAP","SONAP","RCI","Seguro Pyme"],correct:1,why:"El SONAP activa el instinto protector de los padres. Protege a la familia ante imprevistos de salud y accidentes."},
{q:"El Seguro Full Ambulatorio cubre:",opts:["Hospitalización completa","Solo emergencias","Consultas, exámenes y cirugía ambulatoria","Solo medicamentos"],correct:2,why:"Reembolsa el 70% de consultas médicas ambulatorias, exámenes diagnósticos y cirugía ambulatoria. Sin deducible."},
{q:"¿Cuántos trabajadores mínimo necesita una Pyme para el seguro grupal?",opts:["2","3","5","10"],correct:2,why:"El Complementario de Salud Pyme requiere mínimo 5 trabajadores que representen al menos 75% de la dotación."},
{q:"¿Qué seguro cubre daños por terremoto en el hogar?",opts:["Sale Seguro","SONAP","Seguro Incendio Hogar (con cobertura sísmica)","Seguro de Vida"],correct:2,why:"El Seguro Incendio Hogar tiene cobertura opcional de sismo, inundación, maremoto y tsunami. Chile es país sísmico."},
{q:"¿Qué diferencia al plan Full del Plus en Accidentes Personales?",opts:["El precio solamente","El Full incluye Invalidez Total y Permanente 2/3","El Full cubre enfermedades","No hay diferencia"],correct:1,why:"El plan Full (0.67 UF/año, 700 UF) incluye cobertura de Invalidez Total y Permanente 2/3 accidental, que el Plus no tiene."},
{q:"¿El Seguro Viaje cubre deportes extremos?",opts:["Sí, todos","Solo algunos","No, están excluidos","Solo con plan Premium"],correct:2,why:"Los deportes extremos están excluidos de la cobertura estándar del Seguro Viaje."},
{q:"¿Qué pasa si un asegurado de Accidentes Personales tiene un accidente conduciendo ebrio?",opts:["Está cubierto igual","No está cubierto, es exclusión","Cubre solo gastos médicos","Depende del plan"],correct:1,why:"La conducción bajo influencia del alcohol es exclusión expresa tanto para muerte accidental como para invalidez."},
{q:"¿Cuál es el plazo para denunciar un siniestro del Seguro Accidentes Personales?",opts:["30 días","90 días","240 días corridos","1 año"],correct:2,why:"El plazo máximo es 240 días corridos contados desde que se toma conocimiento del siniestro."},
{q:"¿Qué seguro le conviene a un cliente que compra un celular nuevo?",opts:["SONAP","Seguro Hogar","Seguro Retail - Más Seguros","SOAP"],correct:2,why:"El Seguro Retail cubre robo del producto, daño accidental y extensión de garantía para compras con tarjeta BancoEstado."}
];
let sqState={idx:0,score:0,total:SEGUROS_QUIZ.length,answered:false};

function showSegurosTab(tab){
const el=document.getElementById('segurosTabContent');
if(tab==='catalogo'){
el.innerHTML=`<div class="search-box"><input type="text" id="searchInput" placeholder="Buscar seguro..." oninput="filterProducts()"></div><div class="category-tabs" id="categoryTabs"></div><div id="productList" class="product-list"></div>`;
renderProductos();
} else if(tab==='squiz') {
sqState={idx:0,score:0,total:SEGUROS_QUIZ.length,answered:false};
renderSQuiz();
} else if(tab==='registro') {
renderRegistro();
}
}

// Sales Registration System
function getSales(){return JSON.parse(localStorage.getItem('salesLog')||'[]');}
function saveSales(s){localStorage.setItem('salesLog',JSON.stringify(s));}
function getMisProductos(){return JSON.parse(localStorage.getItem('misProductos')||'["SONAP","Sale Seguro Plus","Seguro Accidentes Personales"]');}
function saveMisProductos(p){localStorage.setItem('misProductos',JSON.stringify(p));}

function renderRegistro(){
const el=document.getElementById('segurosTabContent');
const prods=getMisProductos();
let h=`<h2 class="section-title" style="margin-top:8px">Registrar Venta</h2>`;
h+=`<div style="background:var(--card);border-radius:16px;padding:16px;margin-bottom:16px">`;
h+=`<select id="saleProduct" style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;margin-bottom:10px">`;
prods.forEach(p=>{h+=`<option value="${p}">${p}</option>`;});
h+=`</select>`;
h+=`<input type="text" id="saleClient" placeholder="Nombre del cliente (opcional)" style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;margin-bottom:10px;box-sizing:border-box">`;
h+=`<button class="primary-btn" style="width:100%" onclick="registrarVenta()">✅ Registrar Venta</button>`;
h+=`</div>`;

h+=`<h2 class="section-title">Mis Productos (mesón)</h2>`;
h+=`<div style="background:var(--card);border-radius:16px;padding:16px;margin-bottom:16px">`;
h+=`<div style="display:flex;gap:8px;margin-bottom:10px"><input type="text" id="newProduct" placeholder="Agregar producto..." style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px"><button class="primary-btn" style="padding:10px 16px" onclick="agregarProducto()">+</button></div>`;
h+=`<div id="misProductosList">`;
prods.forEach((p,i)=>{h+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text)">${p}</span><button onclick="eliminarProducto(${i})" style="background:none;border:none;color:#ff4444;font-size:16px;cursor:pointer">✕</button></div>`;});
h+=`</div></div>`;

h+=`<h2 class="section-title">Dashboard</h2>`;
h+=`<div style="display:flex;gap:6px;margin-bottom:12px">`;
h+=`<button class="primary-btn" style="flex:1;padding:8px;font-size:12px" onclick="renderDashboard('semana')">Semanal</button>`;
h+=`<button class="primary-btn" style="flex:1;padding:8px;font-size:12px" onclick="renderDashboard('mes')">Mensual</button>`;
h+=`<button class="primary-btn" style="flex:1;padding:8px;font-size:12px" onclick="renderDashboard('año')">Anual</button>`;
h+=`</div>`;
h+=`<div id="dashboardContent"></div>`;
h+=`<button class="primary-btn" style="width:100%;margin-top:16px;background:linear-gradient(135deg,#00875a,#00c896)" onclick="exportarExcel()">📥 Descargar Excel</button>`;

el.innerHTML=h;
renderDashboard('semana');
}

function registrarVenta(){
const prod=document.getElementById('saleProduct').value;
const client=document.getElementById('saleClient').value.trim();
if(!prod)return showToast('Selecciona un producto');
const sales=getSales();
sales.push({producto:prod,cliente:client||'Sin nombre',fecha:new Date().toISOString()});
saveSales(sales);
state.ventas++;saveState();
addXP(15);
showToast('¡Venta registrada! +15 XP');
renderRegistro();
}

function agregarProducto(){
const input=document.getElementById('newProduct');
const name=input.value.trim();
if(!name)return;
const prods=getMisProductos();
if(prods.includes(name)){showToast('Ya existe');return;}
prods.push(name);
saveMisProductos(prods);
renderRegistro();
}

function eliminarProducto(i){
const prods=getMisProductos();
prods.splice(i,1);
saveMisProductos(prods);
renderRegistro();
}

function renderDashboard(periodo){
const sales=getSales();
const now=new Date();
let filtered,label;
if(periodo==='semana'){
const weekAgo=new Date(now-7*86400000);
filtered=sales.filter(s=>new Date(s.fecha)>=weekAgo);
label='Esta Semana';
} else if(periodo==='mes'){
filtered=sales.filter(s=>{const d=new Date(s.fecha);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
label='Este Mes';
} else {
filtered=sales.filter(s=>new Date(s.fecha).getFullYear()===now.getFullYear());
label='Este Año';
}

const byProduct={};
filtered.forEach(s=>{byProduct[s.producto]=(byProduct[s.producto]||0)+1;});
const total=filtered.length;
const topProduct=Object.keys(byProduct).sort((a,b)=>byProduct[b]-byProduct[a])[0]||'-';

let h=`<div style="background:var(--card);border-radius:16px;padding:16px">`;
h+=`<div style="text-align:center;margin-bottom:16px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">${label}</div><div style="font-size:42px;font-weight:900;background:linear-gradient(135deg,var(--accent4),var(--accent3));-webkit-background-clip:text;-webkit-text-fill-color:transparent">${total}</div><div style="font-size:13px;color:var(--text2)">ventas registradas</div></div>`;

if(total>0){
h+=`<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border)"><span style="font-size:12px;color:var(--text3)">Producto estrella</span><span style="font-size:13px;font-weight:700;color:var(--text)">${topProduct}</span></div>`;
const dailyAvg=periodo==='semana'?(total/7).toFixed(1):periodo==='mes'?(total/30).toFixed(1):(total/365).toFixed(1);
h+=`<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border)"><span style="font-size:12px;color:var(--text3)">Promedio diario</span><span style="font-size:13px;font-weight:700;color:var(--text)">${dailyAvg}</span></div>`;

h+=`<div style="margin-top:12px">`;
Object.keys(byProduct).sort((a,b)=>byProduct[b]-byProduct[a]).forEach(p=>{
const pct=Math.round((byProduct[p]/total)*100);
h+=`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text);margin-bottom:4px"><span>${p}</span><span>${byProduct[p]} (${pct}%)</span></div><div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent4),var(--accent3));border-radius:3px"></div></div></div>`;
});
h+=`</div>`;
} else {
h+=`<p style="text-align:center;color:var(--text3);font-size:13px;padding:20px 0">Sin ventas en este período</p>`;
}
h+=`</div>`;

h+=`<h2 class="section-title" style="margin-top:16px">Historial</h2>`;
const recent=filtered.slice(-20).reverse();
if(recent.length){
recent.forEach(s=>{
const d=new Date(s.fecha);
const fecha=d.toLocaleDateString('es-CL',{day:'2-digit',month:'short'});
const hora=d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
h+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:600;color:var(--text)">${s.producto}</div><div style="font-size:11px;color:var(--text3)">${s.cliente}</div></div><div style="text-align:right"><div style="font-size:12px;color:var(--text2)">${fecha}</div><div style="font-size:11px;color:var(--text3)">${hora}</div></div></div>`;
});
}
document.getElementById('dashboardContent').innerHTML=h;
}

function exportarExcel(){
const sales=getSales();
if(!sales.length){showToast('No hay ventas registradas');return;}
let csv='\ufeffFecha,Hora,Producto,Cliente\n';
sales.forEach(s=>{
const d=new Date(s.fecha);
const fecha=d.toLocaleDateString('es-CL');
const hora=d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
csv+=`${fecha},${hora},"${s.producto}","${s.cliente}"\n`;
});
const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');
a.href=url;a.download=`ventas_${new Date().toISOString().slice(0,10)}.csv`;
document.body.appendChild(a);a.click();document.body.removeChild(a);
URL.revokeObjectURL(url);
showToast('Archivo descargado');
}

function renderSQuiz(){
const el=document.getElementById('segurosTabContent');
if(sqState.idx>=sqState.total){
const pct=Math.round((sqState.score/sqState.total)*100);
el.innerHTML=`<div class="quiz-result"><div class="quiz-score">${pct}%</div><div class="quiz-msg">${pct===100?'Perfecto, dominas todos los seguros':pct>=70?'Muy bien, pero repasa los que fallaste':'Necesitas repasar el catálogo de seguros'}</div><p style="color:var(--text2);margin-bottom:24px">${sqState.score}/${sqState.total} correctas</p><button class="primary-btn" onclick="sqState={idx:0,score:0,total:SEGUROS_QUIZ.length,answered:false};renderSQuiz()">Reintentar</button></div>`;
if(pct>=70)addXP(25);
return;
}
const q=SEGUROS_QUIZ[sqState.idx];
let h=`<div class="quiz-card"><div class="quiz-progress">Pregunta ${sqState.idx+1} de ${sqState.total}</div>`;
h+=`<div class="quiz-question">${q.q}</div><div class="quiz-options">`;
q.opts.forEach((o,i)=>{h+=`<button class="quiz-option" onclick="answerSQuiz(${i})" id="sqopt${i}">${o}</button>`;});
h+=`</div><div id="sqFeedback"></div></div>`;
el.innerHTML=h;
}

function answerSQuiz(i){
if(sqState.answered)return;
sqState.answered=true;
const q=SEGUROS_QUIZ[sqState.idx];
const isCorrect=i===q.correct;
if(isCorrect)sqState.score++;
document.getElementById('sqopt'+i).classList.add(isCorrect?'correct':'wrong');
if(!isCorrect)document.getElementById('sqopt'+q.correct).classList.add('correct');
let fb=`<div class="sim-msg feedback ${isCorrect?'good':'bad'}" style="margin-top:12px">`;
fb+=`<div class="sender">${isCorrect?'Correcto':'Incorrecto'}</div>${q.why}</div>`;
if(!isCorrect){fb+=`<div class="sim-msg correction" style="margin-top:8px"><div class="sender">Respuesta correcta:</div>${q.opts[q.correct]}</div>`;}
fb+=`<button class="primary-btn" style="margin-top:12px;width:100%" onclick="sqState.idx++;sqState.answered=false;renderSQuiz()">Siguiente</button>`;
document.getElementById('sqFeedback').innerHTML=fb;
}

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
