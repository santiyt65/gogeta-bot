import fs from 'fs';

const archivo = './lib/preguntas_personalizadas.json';

export async function comandoEliminarPregunta(sock, msg, store) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const texto = msg.message?.conversation?.trim();
  // Esperamos formato: .eliminarpregunta categoria numero
  const partes = texto.split(' ');
  if (partes.length !== 3) {
    return sock.sendMessage(jid, {
      text: `❗ Uso incorrecto.\nEjemplo: .eliminarpregunta cultura 2`,
    }, { quoted: msg });
  }

  const categoria = partes[1].toLowerCase();
  const numero = parseInt(partes[2], 10) - 1;

  if (!categoria || isNaN(numero)) {
    return sock.sendMessage(jid, {
      text: `❗ Datos inválidos. Usa el formato: .eliminarpregunta categoria número`,
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

  const pregunta = data[categoria][numero];
  if (pregunta.autor !== sender) {
    return sock.sendMessage(jid, {
      text: '❌ Solo podés eliminar tus propias preguntas.',
    }, { quoted: msg });
  }

  data[categoria].splice(numero, 1);
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2));

  await sock.sendMessage(jid, {
    text: `✅ Pregunta número ${numero + 1} eliminada de la categoría *${categoria}*.`,
  }, { quoted: msg });
}
