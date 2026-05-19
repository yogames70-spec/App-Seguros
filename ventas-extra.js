// === VENTAS EXTRAS: Objeciones, Detector, Frases Cierre, Errores, Desafío ===

const OBJECIONES=[
{obj:"No tengo plata",resp:["No es un gasto, es una inversión. Son $6.000 al mes, menos que un café al día. Si le pasa algo, recibe hasta 600 UF. ¿Puede darse el lujo de no tenerlo?","Entiendo que anda ajustado. Justamente por eso: si le pasa algo sin seguro, ¿de dónde saca la plata para tratarse? El SONAP es la opción más económica que existe.","Mire, muchos clientes me dicen lo mismo. Pero cuando les explico que son menos de $200 diarios, se dan cuenta de que sí pueden. ¿Probamos?"]},
{obj:"Lo voy a pensar",resp:["Perfecto, ¿qué es exactamente lo que necesita pensar? Así lo ayudo a resolverlo ahora.","Claro. Pero le cuento algo: el 90% de las personas que me dicen 'lo voy a pensar' nunca vuelven. No porque no quieran, sino porque se les olvida. ¿Por qué no lo dejamos listo hoy?","Entiendo. Solo le recuerdo que los seguros se contratan cuando uno está sano. Después ya no se puede. ¿Lo dejamos activo por mientras?"]},
{obj:"Mi señora/marido tiene que decidir",resp:["Lo entiendo. ¿Y si lo dejamos preaprobado para que usted le cuente en la casa? Si no le gusta, lo anulamos sin costo.","Claro. Pero justamente este seguro es PARA proteger a su familia. ¿No cree que su señora estaría de acuerdo en proteger a los hijos?","Perfecto. ¿Tiene el teléfono de su señora? La podemos llamar ahora y le explicamos juntos en 2 minutos."]},
{obj:"Ya tengo seguro en otro lado",resp:["Excelente que se preocupe de estar protegido. ¿Me permite preguntarle qué cubre su seguro actual? Muchas veces hay coberturas que se complementan.","Muy bien. ¿Y su seguro actual cubre cáncer? Porque el SONAP es complementario, no reemplaza al que tiene. Son coberturas distintas.","Perfecto. ¿Cuánto paga al mes? Porque muchos clientes descubren que por menos plata pueden tener mejor cobertura acá."]},
{obj:"No creo en los seguros",resp:["Lo entiendo. Nadie cree hasta que lo necesita. ¿Le puedo contar algo que le pasó a un cliente la semana pasada?","Respeto su posición. Pero los accidentes y enfermedades no preguntan si usted cree o no. ¿No prefiere estar cubierto por si acaso?","¿Me permite hacerle una pregunta? Si mañana le diagnostican algo grave, ¿quién paga el tratamiento? El SONAP existe para eso."]},
{obj:"Después vengo",resp:["Claro, ¿cuándo le queda mejor? Le agendo una hora para que no tenga que esperar.","Entiendo que tiene apuro. Pero esto toma literalmente 3 minutos. ¿Me da esos 3 minutos ahora y se va tranquilo?","Perfecto. Pero le cuento algo: la mayoría de los que me dicen 'después vengo' no vuelven. No porque no quieran, sino porque la vida pasa. ¿3 minutitos ahora?"]},
{obj:"Es muy caro",resp:["¿Comparado con qué? Porque una noche de hospital cuesta 10 veces más que un año de seguro.","Entiendo. ¿Cuánto gasta al mes en café o en el teléfono? El SONAP cuesta menos que eso y puede salvarle la vida financiera.","Mire, le voy a mostrar algo: el plan más accesible cuesta X. ¿Eso es realmente caro para la tranquilidad de su familia?"]},
{obj:"No lo necesito, estoy sano",resp:["Justamente por eso es el mejor momento. Los seguros se contratan SANO. Una vez enfermo, ninguna compañía lo acepta.","Me alegro que esté sano. Ojalá siga así siempre. Pero 1 de cada 3 personas desarrollará cáncer. El seguro es como el cinturón: se pone ANTES del choque.","Excelente. Y para que siga tranquilo si algo cambia, el SONAP le da ese respaldo por menos de $200 al día."]},
{obj:"Tengo que ver mis números primero",resp:["Claro. Mientras tanto le dejo la información. Pero le adelanto: son $6.000 al mes. ¿Eso cabe en su presupuesto?","Entiendo. ¿Quiere que hagamos los números juntos ahora? Le muestro exactamente cuánto es diario y qué cubre.","Perfecto. Mire, para que sea más fácil: el valor mensual es menos que un almuerzo. ¿Eso le parece razonable?"]},
{obj:"Me están ofreciendo seguros en todos lados",resp:["Tiene razón, hay mucha oferta. La diferencia es que BancoEstado es respaldado por el Estado, con más de 100 años. ¿Dónde más le dan esa seguridad?","Es verdad. Por eso mismo le conviene comparar. ¿Me deja mostrarle lo que nosotros cubrimos versus el promedio del mercado?","Entiendo que es mucha información. Por eso le hago fácil: este seguro cubre X, cuesta Y, y se activa ahora. Sin letra chica."]}
];

const DETECTOR=[
{tramite:"Abre cuenta / CuentaRUT",producto:"Sale Seguro Plus",porque:"Va a usar cajero y tarjeta. Protección contra asaltos y fraude."},
{tramite:"Paga dividendo",producto:"Seguro Hogar",porque:"Tiene casa. El seguro del crédito protege al banco, no a él."},
{tramite:"Viene con hijo/familia",producto:"SONAP",porque:"Instinto protector de padres. Cáncer + muerte accidental."},
{tramite:"Pide crédito consumo",producto:"Seguro Muerte Accidental",porque:"Si le pasa algo, la deuda la paga el seguro, no la familia."},
{tramite:"Cobra pensión/bono",producto:"Sale Seguro Plus",porque:"Adultos mayores vulnerables a asaltos al salir del banco."},
{tramite:"Viene en auto",producto:"SOAP / Pérdida Total",porque:"SOAP obligatorio. Pérdida Total para autos viejos."},
{tramite:"Consulta por viaje",producto:"Seguro Viaje",porque:"Una noche de hospital en el extranjero = millones."},
{tramite:"Tiene negocio/Pyme",producto:"Salud Pyme / Seguro Pyme",porque:"Proteger mercadería, local y ofrecer salud a empleados."},
{tramite:"Deposita plata",producto:"SONAP / Ahorro",porque:"Tiene liquidez. Es buen momento para hablar de protección."},
{tramite:"Paga cuenta/servicio",producto:"Sale Seguro",porque:"Usa la tarjeta frecuentemente. Proteger transacciones."}
];

const FRASES_CIERRE=[
"¿Se lo dejo activado con cargo a su cuenta?",
"¿Prefiere el plan básico o el completo?",
"¿Lo dejamos con cargo mensual o anual?",
"¿Empezamos con este y después vemos los otros?",
"¿Se lo activo ahora que estamos acá o prefiere volver otro día?",
"Son 3 minutos. ¿Lo hacemos?",
"¿Lo dejamos listo para que se vaya tranquilo?",
"¿Con cargo a la cuenta corriente o a la CuentaRUT?",
"Perfecto, solo necesito su RUT y en 2 minutos queda listo.",
"¿Le parece si lo activamos y si no le gusta lo anulamos sin costo?"
];

const ERRORES_FATALES=[
{error:"Hablar más de lo que escuchas",porque:"El cliente se aburre y deja de confiar. El que controla la conversación es el que PREGUNTA, no el que habla.",solucion:"Regla 70/30: el cliente habla 70%, tú 30%."},
{error:"Preguntar '¿Lo quiere?'",porque:"Le das la opción fácil de decir NO. El cerebro siempre elige el camino fácil.",solucion:"Usa La Alternativa: '¿Plan A o Plan B?' Ambas son SÍ."},
{error:"Aceptar el primer NO",porque:"El 80% de las ventas se cierran después del 5to contacto. Un NO es solo el inicio de la conversación.",solucion:"Pregunta: '¿Qué es lo que le preocupa?' y aborda la objeción real."},
{error:"No usar el nombre del cliente",porque:"El nombre propio es la palabra favorita de cualquier persona. No usarlo = trato impersonal.",solucion:"Usa su nombre al menos 3 veces. 'Don Carlos, le cuento algo...'"},
{error:"Hablar en jerga técnica",porque:"'0.16 UF mensuales con cobertura oncológica' no le dice nada al cliente. Solo lo confundes.",solucion:"Traduce: '$6.000 al mes, menos que un café. Si te da cáncer, te pagan todo.'"},
{error:"Ofrecer sin resolver primero",porque:"Si el cliente vino a pagar una cuenta y tú le hablas de seguros antes de resolver su trámite, se molesta.",solucion:"PRIMERO resuelve lo que vino a hacer. DESPUÉS ofreces. El orden importa."},
{error:"Hablar mal de la competencia",porque:"Genera desconfianza. Si hablas mal de otros, el cliente piensa: '¿Qué dirá de mí cuando me vaya?'",solucion:"Habla bien de TU producto. Deja que el cliente compare solo."},
{error:"No cerrar nunca",porque:"Muchos vendedores informan perfecto pero nunca hacen la pregunta de cierre. Informar NO es vender.",solucion:"Siempre termina con una pregunta de acción: '¿Lo activamos?'"}
];

const DESAFIOS=[
"Hoy usa la técnica del ESPEJO con al menos 2 clientes. Repite sus últimas palabras en forma de pregunta.",
"Hoy cierra usando SOLO La Alternativa. Nunca preguntes '¿lo quiere?' Da siempre 2 opciones.",
"Hoy cuenta una HISTORIA REAL (o realista) a cada cliente que atiendas. Las historias venden más que los datos.",
"Hoy usa el nombre del cliente AL MENOS 3 veces en cada conversación. Mide el impacto.",
"Hoy intenta hacer las 4 preguntas SPIN (Situación, Problema, Implicación, Necesidad) con al menos 1 cliente.",
"Hoy practica Los 2 SÍ antes del cierre. Dos preguntas obvias con respuesta SÍ antes de la pregunta de cierre.",
"Hoy tu meta es superar AL MENOS 1 objeción. Cuando te digan 'no', no te rindas. Usa las respuestas del Objection Killer.",
"Hoy ofrece un seguro a TODOS los clientes que atiendas, sin excepción. Mide tu tasa de conversión.",
"Hoy usa el RESUMEN INVERSO en al menos 1 cierre. Resume lo que el cliente dijo y muéstrale cómo tu producto lo resuelve.",
"Hoy practica el ANCLAJE DE PRECIO. Muestra primero el producto caro, luego el accesible. Mide la reacción."
];
