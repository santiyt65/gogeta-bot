import fs from 'fs';

const archivoPendientes = './lib/preguntas_pendientes.json';
const archivoPersonalizadas = './lib/preguntas_personalizadas.json';

let pendientes = fs.existsSync(archivoPendientes)
  ? JSON.parse(fs.readFileSync(archivoPendientes))
  : {};

let personalizadas = fs.existsSync(archivoPersonalizadas)
  ? JSON.parse(fs.readFileSync(archivoPersonalizadas))
  : {};

export async function comandoRevisarPreguntas(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;

  if (!isAdmin) return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });

  const categorias = Object.keys(pendientes);
  if (categorias.length === 0) {
    return sock.sendMessage(jid, { text: '✅ No hay preguntas pendientes para revisar.' }, { quoted: msg });
  }

  for (const categoria of categorias) {
    const preguntasCat = pendientes[categoria];
    if (!preguntasCat || preguntasCat.length === 0) continue;

    // Mostramos la primera pendiente de la categoría
    const pregunta = preguntasCat[0];
    const texto = `📝 *Revisión de pregunta* \n\nCategoría: *${categoria}*\nPregunta: ${pregunta.pregunta}\nOpciones:\n${pregunta.opciones.map((o,i) => `${i+1}. ${o}`).join('\n')}\nCorrecta: ${pregunta.correcta + 1}`;

    await sock.sendMessage(jid, {
      text: texto,
      footer: 'Usa .aprobarpregunta o .rechazarpregunta para gestionar esta pregunta',
    }, { quoted: msg });

    // Solo mostramos una pregunta a la vez por simplicidad
    break;
  }
}
