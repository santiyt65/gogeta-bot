export async function comandoInfoGrupo(sock, msg, store) {
  const jid = msg.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    return await sock.sendMessage(jid, { text: 'ℹ️ Este comando solo se puede usar en grupos.' }, { quoted: msg });
  }

  const info = await sock.groupMetadata(jid);
  const admins = info.participants.filter(p => p.admin);
  const texto = `📘 *Info del grupo*\n
📛 Nombre: ${info.subject}
🆔 ID: ${jid}
👥 Miembros: ${info.participants.length}
🛡️ Admins: ${admins.length}
🗓️ Creado: ${new Date(info.creation * 1000).toLocaleDateString()}
👤 Creador: ${info.owner || 'Desconocido'}
`;

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
