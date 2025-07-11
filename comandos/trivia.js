import fs from 'fs';
const archivoRanking = './lib/ranking_trivia.json';
let ranking = fs.existsSync(archivoRanking)
  ? JSON.parse(fs.readFileSync(archivoRanking))
  : {};

const baseTrivia = {
  general: [
    {
      pregunta: '¿Cuántos días tiene un año bisiesto?',
      opciones: ['365', '366', '364', '360'],
      correcta: 1
    },
    {
      pregunta: '¿Qué gas respiramos para vivir?',
      opciones: ['Oxígeno', 'Hidrógeno', 'Dióxido de carbono', 'Nitrógeno'],
      correcta: 0
    }
  ],
  ciencia: [
    {
      pregunta: '¿Cuál es el metal más ligero?',
      opciones: ['Hierro', 'Oro', 'Litio', 'Cobre'],
      correcta: 2
    }
  ],
  cultura: [
    {
      pregunta: '¿Qué país es famoso por el sushi?',
      opciones: ['China', 'Corea', 'Tailandia', 'Japón'],
      correcta: 3
    }
  ],
  anime: [
    {
      pregunta: '¿Quién es el protagonista de Dragon Ball?',
      opciones: ['Gohan', 'Goku', 'Vegeta', 'Krillin'],
      correcta: 1
    }
  ]
};

const sesionesTrivia = new Map();

export async function comandoTrivia(sock, msg) {
  const jid = msg.key.remoteJid;

  await sock.sendMessage(jid, {
    text: '🧠 *Elige una categoría de trivia:*',
    footer: 'GOGETA\\BOT - Trivia por categoría',
    buttons: [
      { buttonId: '.trivia general', buttonText: { displayText: '🌐 General' }, type: 1 },
      { buttonId: '.trivia ciencia', buttonText: { displayText: '🔬 Ciencia' }, type: 1 },
      { buttonId: '.trivia cultura', buttonText: { displayText: '🎭 Cultura' }, type: 1 },
      { buttonId: '.trivia anime', buttonText: { displayText: '🎌 Anime' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: msg });
}

export async function iniciarTriviaCategoria(sock, msg, categoria) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const preguntas = baseTrivia[categoria];
  if (!preguntas || preguntas.length === 0) {
    return sock.sendMessage(jid, {
      text: `❌ No hay preguntas cargadas para la categoría *${categoria}*.`,
    }, { quoted: msg });
  }

  if (sesionesTrivia.has(jid)) {
    return sock.sendMessage(jid, {
      text: '❗ Ya hay una trivia activa en este chat.',
    }, { quoted: msg });
  }

  const trivia = preguntas[Math.floor(Math.random() * preguntas.length)];
  sesionesTrivia.set(jid, {
    respuesta: trivia.correcta,
    user: sender,
    tiempo: Date.now()
  });

  const opciones = trivia.opciones.map((op, i) => `${i + 1}. ${op}`).join('\n');

  await sock.sendMessage(jid, {
    text: `🧠 *Trivia - ${categoria.toUpperCase()}*\n\n❓ ${trivia.pregunta}\n\n${opciones}\n\nResponde con *1*, *2*, *3* o *4*.`,
  }, { quoted: msg });

  setTimeout(() => {
    if (sesionesTrivia.has(jid)) {
      sesionesTrivia.delete(jid);
      sock.sendMessage(jid, {
        text: '⌛ Tiempo agotado. ⏳ Usa `.trivia` para jugar de nuevo.',
      }, { quoted: msg });
    }
  }, 15000);
}

export async function verificarRespuesta(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const sesion = sesionesTrivia.get(jid);
  if (!sesion) return;

  if (sender !== sesion.user) return;

  const respuesta = parseInt(msg.message?.conversation?.trim());
  if (![1, 2, 3, 4].includes(respuesta)) return;

  if (respuesta - 1 === sesion.respuesta) {
    const id = sender;
    if (!ranking[id]) ranking[id] = 0;
    ranking[id] += 1;
    fs.writeFileSync(archivoRanking, JSON.stringify(ranking, null, 2));

    await sock.sendMessage(jid, {
      text: `✅ ¡Correcto! 🎉 Ganaste 1 punto.`,
    }, { quoted: msg });
  } else {
    await sock.sendMessage(jid, {
      text: `❌ Incorrecto. La respuesta era la opción ${sesion.respuesta + 1}.`,
    }, { quoted: msg });
  }

  sesionesTrivia.delete(jid);
}
