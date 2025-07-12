import fs from 'fs';

const archivoPendientes = './lib/preguntas_pendientes.json';
let pendientes = fs.existsSync(archivoPendientes)
  ? JSON.parse(fs.readFileSync(archivoPendientes))
  : {};

export async function comandoAgregarPregunta(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const partes = msg.message?.conversation?.split('|');
  if (!partes || partes.length < 7) {
    return sock.sendMessage(jid, {
      text: `❗ Uso incorrecto del comando.\n\n📌 *Ejemplo:*\n.agregarpregunta general | ¿Capital de Perú? | Lima | Cusco | Arequipa | Trujillo | 1`,
    }, { quoted: msg });
  }

  const [_, categoria, pregunta, op1, op2, op3, op4, correctaStr] = partes.map(p => p.trim());
  const correcta = parseInt(correctaStr) - 1;

  if (![0, 1, 2, 3].includes(correcta)) {
    return sock.sendMessage(jid, {
      text: `❌ La opción correcta debe ser entre 1 y 4.`,
    }, { quoted: msg });
  }

  const nueva = {
    pregunta,
    opciones: [op1, op2, op3, op4],
    correcta,
    autor: sender,
    categoria
  };

  if (!pendientes[categoria]) pendientes[categoria] = [];
  pendientes[categoria].push(nueva);
  fs.writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

  await sock.sendMessage(jid, {
    text: `✅ Pregunta enviada para revisión en la categoría *${categoria}*.\nUn administrador la revisará pronto.`,
  }, { quoted: msg });
}
