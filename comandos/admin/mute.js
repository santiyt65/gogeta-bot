import fs from 'fs';

const archivoMute = './lib/muteados.json';
let muteados = fs.existsSync(archivoMute)
  ? JSON.parse(fs.readFileSync(archivoMute))
  : [];

/**
 * Comando: .mute
 * Silencia a un usuario (el bot ya no le responderá)
 * Solo admins pueden usarlo en grupos.
 */
export async function comandoMute(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(jid, { text: '❌ Este comando solo se puede usar en grupos.' }, { quoted: msg });
  }

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  const mention = msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (!mention) {
    return sock.sendMessage(jid, { text: '📌 Mencioná a un usuario para silenciarlo.\n\nEj: .mute @usuario' }, { quoted: msg });
  }

  if (muteados.includes(mention)) {
    return sock.sendMessage(jid, { text: '⚠️ Ese usuario ya está silenciado.' }, { quoted: msg });
  }

  muteados.push(mention);
  fs.writeFileSync(archivoMute, JSON.stringify(muteados, null, 2));

  await sock.sendMessage(jid, {
    text: `🔇 El usuario @${mention.split('@')[0]} fue *silenciado*.`,
    mentions: [mention]
  }, { quoted: msg });
}
