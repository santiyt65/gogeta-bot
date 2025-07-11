import fs from 'fs';

/**
 * Comando: .listamute
 * Muestra los usuarios silenciados en ese grupo
 */
export async function comandoListaMute(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(jid, { text: '❌ Este comando solo se puede usar en grupos.' }, { quoted: msg });
  }

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  const archivoMute = './lib/muteados.json';
  let muteados = fs.existsSync(archivoMute)
    ? JSON.parse(fs.readFileSync(archivoMute))
    : [];

  // Filtrar solo los del grupo actual
  const muteadosGrupo = muteados.filter(id => id.endsWith('@g.us') || id.includes(jid));

  if (muteados.length === 0) {
    return sock.sendMessage(jid, { text: '✅ No hay usuarios silenciados actualmente.' }, { quoted: msg });
  }

  const texto = `🔇 *Usuarios silenciados actualmente:*\n\n` +
    muteados.map((u, i) => `*${i + 1}.* @${u.split('@')[0]}`).join('\n');

  await sock.sendMessage(jid, {
    text: texto,
    mentions: muteados
  }, { quoted: msg });
}
