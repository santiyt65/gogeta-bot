import { esAdmin, OWNERS } from '../lib/admin.js';

export async function comandoUnmute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);

  if (!jid.endsWith('@g.us')) return;

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, { text: '🚫 Solo un admin puede activar el grupo.' }, { quoted: msg });
  }

  await sock.groupSettingUpdate(jid, 'not_announcement');
  await sock.sendMessage(jid, { text: '🔊 Grupo activado. Todos pueden escribir.' }, { quoted: msg });
}
