import fs from 'fs';

const archivosRanking = [
  './lib/ranking_trivia.json',
  './lib/ranking_adivina.json',
  './lib/ranking_ppt.json',
];

/**
 * Comando: .resetranking
 * Resetea los rankings de todos los juegos.
 * Solo administradores.
 */
export async function comandoResetRanking(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    return sock.sendMessage(jid, { text: '❌ Este comando solo se puede usar en grupos.' }, { quoted: msg });
  }

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  try {
    for (const archivo of archivosRanking) {
      fs.writeFileSync(archivo, JSON.stringify({}, null, 2));
    }

    await sock.sendMessage(jid, { text: '✅ Todos los rankings han sido reiniciados.' }, { quoted: msg });
  } catch (err) {
    console.error('Error al resetear rankings:', err);
    await sock.sendMessage(jid, { text: '❌ Hubo un error al intentar reiniciar los rankings.' }, { quoted: msg });
  }
}
