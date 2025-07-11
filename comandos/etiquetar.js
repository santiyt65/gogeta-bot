import { esAdmin, OWNERS } from '../lib/admin.js';

const cooldowns = new Map(); // Limita un uso cada 60 segundos por grupo

export async function comandoEtiquetar(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    return await sock.sendMessage(jid, {
      text: '⚠️ Este comando solo se puede usar en grupos.'
    }, { quoted: msg });
  }

  const isOwner = OWNERS.includes(sender);
  const isAdmin = await esAdmin(sock, jid, sender);

  if (!isOwner && !isAdmin) {
    return await sock.sendMessage(jid, {
      text: '🚫 Solo administradores pueden etiquetar a todos.'
    }, { quoted: msg });
  }

  // Cooldown: 60 segundos por grupo
  const cooldown = cooldowns.get(jid);
  const ahora = Date.now();
  if (cooldown && ahora - cooldown < 60000) {
    const restante = Math.ceil((60000 - (ahora - cooldown)) / 1000);
    return await sock.sendMessage(jid, {
      text: `⏳ Espera ${restante}s antes de volver a usar el comando.`
    }, { quoted: msg });
  }

  cooldowns.set(jid, ahora);

  const metadata = await sock.groupMetadata(jid);
  const participantes = metadata.participants.map(p => p.id);

  const textoEntrada = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const mensajePersonalizado = textoEntrada.split(' ').slice(1).join(' ') || '📣 *Atención a todos los miembros!*';

  const mensajeFinal = `${mensajePersonalizado}\n\n${participantes.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join('\n')}`;

  await sock.sendMessage(jid, {
    text: mensajeFinal,
    mentions: participantes
  }, { quoted: msg });
}
