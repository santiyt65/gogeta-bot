import fs from 'fs';

const archivoMute = './lib/muteados.json';
let muteados = fs.existsSync(archivoMute)
  ? JSON.parse(fs.readFileSync(archivoMute))
  : [];

/**
 * Comando: .unmute
 * Quita el silencio a un usuario (el bot vuelve a responderle)
 */
export async function comandoUnmute(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(jid, { text: '❌ Este comando solo se usa en grupos.' }, { quoted: msg });
  }

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  const mention = msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (!mention) {
    return sock.sendMessage(jid, { text: '📌 Mencioná a un usuario para quitarle el silencio.\n\nEj: .unmute @usuario' }, { quoted: msg });
  }

  if (!muteados.includes(mention)) {
    return sock.sendMessage(jid, { text: '⚠️ Ese usuario no está silenciado.' }, { quoted: msg });
  }

  muteados = muteados.filter(id => id !== mention);
  fs.writeFileSync(archivoMute, JSON.stringify(muteados, null, 2));

  await sock.sendMessage(jid, {
    text: `🔊 El usuario @${mention.split('@')[0]} fue *desmuteado*.`,
    mentions: [mention]
  }, { quoted: msg });
}
