import fs from 'fs';

const archivo = './lib/preguntas_personalizadas.json';

export async function comandoModificarPregunta(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const texto = msg.message?.conversation;
  // Esperamos formato:
  // .modificarpregunta categoria numero | Pregunta nueva | Opción1 | Opción2 | Opción3 | Opción4 | correcta(1-4)

  if (!texto.includes('|')) {
    return sock.sendMessage(jid, {
      text: `❗ Uso incorrecto.\nEjemplo:\n.modificarpregunta cultura 2 | ¿Pregunta nueva? | Op1 | Op2 | Op3 | Op4 | 3`,
    }, { quoted: msg });
  }

  const [comandoYCategoriaNumero, pregunta, op1, op2, op3, op4, correctaStr] = texto.split('|').map(s => s.trim());

  const partes = comandoYCategoriaNumero.split(' ');
  if (partes.length !== 2) {
    return sock.sendMessage(jid, {
      text: `❗ Formato inválido en categoría y número.`,
    }, { quoted: msg });
  }

  const categoria = partes[0].toLowerCase();
  const numero = parseInt(partes[1], 10) - 1;

  const correcta = parseInt(correctaStr, 10) - 1;

  if (isNaN(numero) || isNaN(correcta) || correcta < 0 || correcta > 3) {
    return sock.sendMessage(jid, {
      text: `❗ Número o respuesta correcta inválidos.`,
    }, { quoted: msg });
  }

  if (!fs.existsSync(archivo)) {
    return sock.sendMessage(jid, {
      text: '❗ No hay preguntas personalizadas aún.',
    }, { quoted: msg });
  }

  const data = JSON.parse(fs.readFileSync(archivo));

  if (!data[categoria] || data[categoria].length <= numero || numero < 0) {
    return sock.sendMessage(jid, {
      text: `❗ No existe la pregunta número ${numero + 1} en la categoría *${categoria}*.`,
    }, { quoted: msg });
  }

  const preguntaOriginal = data[categoria][numero];
  if (preguntaOriginal.autor !== sender) {
    return sock.sendMessage(jid, {
      text: '❌ Solo podés modificar tus propias preguntas.',
    }, { quoted: msg });
  }

  data[categoria][numero] = {
    pregunta,
    opciones: [op1, op2, op3, op4],
    correcta,
    autor: sender
  };

  fs.writeFileSync(archivo, JSON.stringify(data, null, 2));

  await sock.sendMessage(jid, {
    text: `✅ Pregunta número ${numero + 1} modificada en la categoría *${categoria}*.`,
  }, { quoted: msg });
}
