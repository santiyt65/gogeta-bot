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

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  const categorias = Object.keys(pendientes);
  if (categorias.length === 0) {
    return sock.sendMessage(jid, { text: '✅ No hay preguntas pendientes para revisar.' }, { quoted: msg });
  }

  for (const categoria of categorias) {
    const preguntasCat = pendientes[categoria];
    if (!preguntasCat || preguntasCat.length === 0) continue;

    const pregunta = preguntasCat[0];
    const texto = `📝 *Revisión de pregunta*\n\nCategoría: *${categoria}*\nPregunta: ${pregunta.pregunta}\nOpciones:\n${pregunta.opciones.map((o, i) => `${i + 1}. ${o}`).join('\n')}\nCorrecta: ${pregunta.correcta + 1}`;

    await sock.sendMessage(jid, {
      text: texto,
      footer: 'Presiona un botón para aprobar o rechazar esta pregunta.',
      buttons: [
        { buttonId: 'aprobar_pregunta', buttonText: { displayText: '✅ Aprobar' }, type: 1 },
        { buttonId: 'rechazar_pregunta', buttonText: { displayText: '❌ Rechazar' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: msg });

    break; // mostramos solo una pregunta a la vez
  }
}

export async function manejarBotonRespuesta(sock, msg) {
  const { from, message, key } = msg;
  if (!message?.buttonsResponseMessage) return;
  const buttonId = message.buttonsResponseMessage.selectedButtonId;

  // Solo admins pueden manejar estos botones, debes implementar tu función isAdmin
  const isAdmin = await verificarAdmin(sock, from, key.participant || from);
  if (!isAdmin) {
    return sock.sendMessage(from, { text: '❌ Solo admins pueden usar estos botones.' }, { quoted: msg });
  }

  if (buttonId === 'aprobar_pregunta') {
    await aprobarPregunta(sock, from, msg);
  } else if (buttonId === 'rechazar_pregunta') {
    await rechazarPregunta(sock, from, msg);
  }
}

async function aprobarPregunta(sock, jid, msg) {
  if (Object.keys(pendientes).length === 0) {
    return sock.sendMessage(jid, { text: '❗ No hay preguntas pendientes.' }, { quoted: msg });
  }

  const categoria = Object.keys(pendientes)[0];
  const pregunta = pendientes[categoria].shift();

  if (!personalizadas[categoria]) personalizadas[categoria] = [];
  personalizadas[categoria].push(pregunta);

  fs.writeFileSync(archivoPersonalizadas, JSON.stringify(personalizadas, null, 2));
  fs.writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

  await sock.sendMessage(pregunta.autor, { text: `✅ Tu pregunta en categoría *${categoria}* fue aprobada y está disponible.` });
  await sock.sendMessage(jid, { text: '✅ Pregunta aprobada y agregada.' }, { quoted: msg });
}

async function rechazarPregunta(sock, jid, msg) {
  if (Object.keys(pendientes).length === 0) {
    return sock.sendMessage(jid, { text: '❗ No hay preguntas pendientes.' }, { quoted: msg });
  }

  const categoria = Object.keys(pendientes)[0];
  const pregunta = pendientes[categoria].shift();

  fs.writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

  await sock.sendMessage(pregunta.autor, { text: `❌ Tu pregunta en categoría *${categoria}* fue rechazada.` });
  await sock.sendMessage(jid, { text: '✅ Pregunta rechazada y eliminada.' }, { quoted: msg });
}

// Esta función debes adaptarla según tu sistema para verificar admin
async function verificarAdmin(sock, jid, participant) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const admins = metadata.participants.filter(u => u.admin === 'admin' || u.admin === 'superadmin').map(u => u.id);
    return admins.includes(participant);
  } catch {
    return false;
  }
}
