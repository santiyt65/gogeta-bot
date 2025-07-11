import fs from 'fs';
import { esAdmin, OWNERS } from '../lib/admin.js';

const RANKING_PATH = './data/ranking.json';

export async function resetRanking(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const jid = msg.key.remoteJid;

  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, {
      text: '🚫 Solo el *owner* o un *admin del grupo* puede usar este comando.'
    }, { quoted: msg });
  }

  fs.writeFileSync(RANKING_PATH, '{}');
  await sock.sendMessage(jid, {
    text: '✅ ¡Ranking reseteado correctamente por un administrador!'
  }, { quoted: msg });
}
