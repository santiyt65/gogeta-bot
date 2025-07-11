export async function comandoAprobarPregunta(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isAdmin) return sock.sendMessage(jid, { text: '❌ Solo admins pueden aprobar preguntas.' }, { quoted: msg });

  if (Object.keys(pendientes).length === 0) {
    return sock.sendMessage(jid, { text: '❗ No hay preguntas pendientes.' }, { quoted: msg });
  }

  // Tomamos la primera pregunta pendiente
  const categoria = Object.keys(pendientes)[0];
  const pregunta = pendientes[categoria].shift();

  if (!personalizadas[categoria]) personalizadas[categoria] = [];
  personalizadas[categoria].push(pregunta);

  fs.writeFileSync(archivoPersonalizadas, JSON.stringify(personalizadas, null, 2));
  fs.writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

  // Notificamos al autor
  await sock.sendMessage(pregunta.autor, { text: `✅ Tu pregunta en categoría *${categoria}* fue aprobada y ya está disponible en la trivia.` });

  await sock.sendMessage(jid, { text: '✅ Pregunta aprobada y agregada.' }, { quoted: msg });
}

export async function comandoRechazarPregunta(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isAdmin) return sock.sendMessage(jid, { text: '❌ Solo admins pueden rechazar preguntas.' }, { quoted: msg });

  if (Object.keys(pendientes).length === 0) {
    return sock.sendMessage(jid, { text: '❗ No hay preguntas pendientes.' }, { quoted: msg });
  }

  const categoria = Object.keys(pendientes)[0];
  const pregunta = pendientes[categoria].shift();

  fs.writeFileSync(archivoPendientes, JSON.stringify(pendientes, null, 2));

  // Notificamos al autor
  await sock.sendMessage(pregunta.autor, { text: `❌ Tu pregunta en categoría *${categoria}* fue rechazada.` });

  await sock.sendMessage(jid, { text: '✅ Pregunta rechazada y eliminada.' }, { quoted: msg });
}
