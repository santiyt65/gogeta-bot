import fs from 'fs';
import { writeFileSync, readFileSync } from 'fs';

const archivoPendientes = './lib/preguntas_pendientes.json';
const archivoAprobadas = './lib/preguntas_aprobadas.json';

/**
 * Comando: .moderarpreguntas
 * Solo administradores. Revisa preguntas pendientes con botones.
 */
export async function comandoModeracionPreguntas(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  if (!fs.existsSync(archivoPendientes)) return sock.sendMessage(jid, { text: '📭 No hay preguntas pendientes.' }, { quoted: msg });

  const pendientes = JSON.parse(readFileSync(archivoPendientes));
  const keys = Object.keys(pendientes);

  if (keys.length === 0) return sock.sendMessage(jid, { text: '📭 No hay preguntas pendientes para revisar.' }, { quoted: msg });

  const id = keys[0];
  const { pregunta, respuesta, autor } = pendientes[id];

  await sock.sendMessage(jid, {
    text: `📝 *Pregunta sugerida por:* @${autor.split('@')[0]}

❓ Pregunta: ${pregunta}
✅ Respuesta: ${respuesta}

¿Aprobar o rechazar esta pregunta?`,
    mentions: [autor],
    footer: 'Gogeta Bot',
    buttons: [
      { buttonId: `.aprobar_${id}`, buttonText: { displayText: '✅ Aprobar' }, type: 1 },
      { buttonId: `.rechazar_${id}`, buttonText: { displayText: '❌ Rechazar' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: msg });
}
export async function manejarBotonRespuesta(sock, msg) {
  const jid = msg.key.remoteJid;
  const idBoton = msg?.message?.buttonsResponseMessage?.selectedButtonId;

  if (!idBoton) return;

  const [accion, id] = idBoton.split('_');

  if (!fs.existsSync(archivoPendientes)) return;

  const pendientes = JSON.parse(readFileSync(archivoPendientes));

  if (!pendientes[id]) return;

  const pregunta = pendientes[id];
  const autor = pregunta.autor;

  if (accion === 'aprobar') {
    let aprobadas = [];
    if (fs.existsSync(archivoAprobadas)) {
      aprobadas = JSON.parse(readFileSync(archivoAprobadas));
    }

    aprobadas.push(pregunta);
    writeFileSync(archivoAprobadas, JSON.stringify(aprobadas, null, 2));
    delete pendientes[id];
    writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

    await sock.sendMessage(jid, { text: '✅ Pregunta aprobada.' }, { quoted: msg });
    await sock.sendMessage(autor, { text: '✅ ¡Tu pregunta fue aprobada! Gracias por contribuir a Gogeta Bot 🙌' });
  }

  if (accion === 'rechazar') {
    delete pendientes[id];
    writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

    await sock.sendMessage(jid, { text: '❌ Pregunta rechazada.' }, { quoted: msg });
    await sock.sendMessage(autor, { text: '❌ Tu pregunta fue rechazada. ¡Gracias igual por participar!' });
  }
}
