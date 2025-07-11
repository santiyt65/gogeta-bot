import fs from 'fs';

const archivoBan = './lib/baneados.json';

// Cargar o crear archivo
let baneados = fs.existsSync(archivoBan)
  ? JSON.parse(fs.readFileSync(archivoBan))
  : [];

/**
 * Comando: .ban (solo en grupos y solo admin puede usarlo)
 * Permite banear a un usuario. El bot no responderá más a sus mensajes.
 */
export async function comandoBan(sock, msg, isAdmin) {
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
    return sock.sendMessage(jid, { text: '📌 Mencioná a un usuario para banear.\n\nEj: .ban @usuario' }, { quoted: msg });
  }

  if (baneados.includes(mention)) {
    return sock.sendMessage(jid, { text: '⚠️ Ese usuario ya está baneado.' }, { quoted: msg });
  }

  baneados.push(mention);
  fs.writeFileSync(archivoBan, JSON.stringify(baneados, null, 2));

  await sock.sendMessage(jid, {
    text: `✅ El usuario @${mention.split('@')[0]} fue *baneado* correctamente.`,
    mentions: [mention]
  }, { quoted: msg });
}
