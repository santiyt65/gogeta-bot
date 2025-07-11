export async function comandoPing(sock, msg) {
  const jid = msg.key.remoteJid;

  const inicio = Date.now();
  await sock.sendMessage(jid, { text: '🏓 Calculando ping...' }, { quoted: msg });
  const fin = Date.now();

  const ping = fin - inicio;

  // Emoji dinámico según velocidad
  let velocidadEmoji = '';
  if (ping < 300) velocidadEmoji = '🟢 Excelente';
  else if (ping < 800) velocidadEmoji = '🟡 Medio';
  else velocidadEmoji = '🔴 Lento';

  // Uptime
  const uptime = process.uptime() * 1000;
  const horas = Math.floor(uptime / (1000 * 60 * 60));
  const minutos = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((uptime % (1000 * 60)) / 1000);

  const texto = `✅ *Bot activo*
📶 *Ping:* ${ping} ms (${velocidadEmoji})
⏱️ *Uptime:* ${horas}h ${minutos}m ${segundos}s`;

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
