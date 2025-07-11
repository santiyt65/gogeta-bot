import fs from 'fs';

const archivoBan = './lib/baneados.json';
let baneados = fs.existsSync(archivoBan)
  ? JSON.parse(fs.readFileSync(archivoBan))
  : [];

/**
 * Comando: .unban
 * Desbanea a un usuario previamente baneado
 */
export async function comandoUnban(sock, msg, isAdmin) {
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
    return sock.sendMessage(jid, { text: '📌 Mencioná a un usuario para quitar el ban.\n\nEj: .unban @usuario' }, { quoted: msg });
  }

  if (!baneados.includes(mention)) {
    return sock.sendMessage(jid, { text: '⚠️ Ese usuario no está baneado.' }, { quoted: msg });
  }

  baneados = baneados.filter(id => id !== mention);
  fs.writeFileSync(archivoBan, JSON.stringify(baneados, null, 2));

  await sock.sendMessage(jid, {
    text: `✅ El usuario @${mention.split('@')[0]} fue *desbaneado*.`,
    mentions: [mention]
  }, { quoted: msg });
}
