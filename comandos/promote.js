import { esAdmin, OWNERS } from '../lib/admin.js';

export async function comandoPromote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);
  const target = msg.message?.extendedTextMessage?.contextInfo?.participant;

  if (!jid.endsWith('@g.us')) return;

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, { text: '🚫 Solo un admin puede promover a otro usuario.' }, { quoted: msg });
  }

  if (!target) {
    return await sock.sendMessage(jid, { text: '❗ Responde al mensaje del usuario que quieras promover.' }, { quoted: msg });
  }

  await sock.groupParticipantsUpdate(jid, [target], 'promote');
  await sock.sendMessage(jid, { text: `✅ Usuario promovido a admin.` }, { quoted: msg });
}
