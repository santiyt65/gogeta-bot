import { esAdmin, OWNERS } from '../lib/admin.js';

export async function comandoLinkGrupo(sock, msg, store) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);

  if (!jid.endsWith('@g.us')) return;

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, { text: '🚫 Solo admins pueden ver el link.' }, { quoted: msg });
  }

  const code = await sock.groupInviteCode(jid);
  const link = `https://chat.whatsapp.com/${code}`;

  await sock.sendMessage(jid, { text: `🔗 Enlace del grupo:\n${link}` }, { quoted: msg });
}
