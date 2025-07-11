import os from 'os';
import { name, version, author } from '../package.json' assert { type: 'json' };

export async function comandoInfoBot(sock, msg) {
  const jid = msg.key.remoteJid;

  const uptime = process.uptime() * 1000;
  const horas = Math.floor(uptime / (1000 * 60 * 60));
  const minutos = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((uptime % (1000 * 60)) / 1000);

  const texto = `
🤖 *Información del Bot*

📛 Nombre: ${name.toUpperCase()}
🧑‍💻 Autor: ${author}
📦 Versión: ${version}
📶 Plataforma: ${os.platform()} (${os.arch()})
⚙️ Node.js: ${process.version}
⏱️ Uptime: ${horas}h ${minutos}m ${segundos}s
🧠 Memoria: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB

🔗 GitHub: github.com/santiyt65  
💬 WhatsApp: wa.me/549123456789  
💰 Donaciones: paypal.me/santiyt65  
📣 Canal oficial: https://whatsapp.com/channel/0029VajKFjlJJhzU8fvTPn2L  
👥 Grupo oficial: https://chat.whatsapp.com/CHDMJCKuPMiLt4NuhaK1rv?mode=ac_c
`;

  await sock.sendMessage(jid, {
    text: texto.trim(),
    footer: 'GOGETA\\BOT - Hecho por santiyt65',
    buttons: [
      { buttonId: '.menu', buttonText: { displayText: '📜 Menú principal' }, type: 1 },
      { buttonId: '.ping', buttonText: { displayText: '📶 Ver ping' }, type: 1 },
      { buttonId: '.donar', buttonText: { displayText: '💰 Donar' }, type: 1 },
      { buttonId: '.grupooficial', buttonText: { displayText: '👥 Grupo Oficial' }, type: 1 },
      { buttonId: '.canaloficial', buttonText: { displayText: '📣 Canal Oficial' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: msg });
}
