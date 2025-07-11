import { esAdmin, OWNERS } from '../lib/admin.js';

export async function comandoMute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);

  if (!jid.endsWith('@g.us')) {
    return await sock.sendMessage(jid, { text: '⚠️ Este comando solo funciona en grupos.' }, { quoted: msg });
  }

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, { text: '🚫 Solo un admin puede mutear el grupo.' }, { quoted: msg });
  }

  await sock.groupSettingUpdate(jid, 'announcement');
  await sock.sendMessage(jid, { text: '🔇 Grupo muteado. Solo admins pueden escribir.' }, { quoted: msg });
}
