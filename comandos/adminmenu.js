export async function mostrarMenuAdmin(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const texto = `
🛡️ *Menú de Administración*

📌 *Moderación*
• .ban (responder a usuario)
• .unban [número]
• .mute (silenciar grupo)
• .unmute (activar grupo)

👤 *Gestión de miembros*
• .promote (hacer admin, responder)
• .demote (quitar admin, responder)

🔗 *Grupo*
• .linkgrupo
• .infogrupo
• .reset ranking

👑 Solo el owner o admins pueden usar estos comandos.
`;

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
