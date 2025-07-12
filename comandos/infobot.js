import pkg from '../package.json' assert { type: 'json' };

const name = pkg.name || 'GogetaBot';
const version = pkg.version || '1.0.0';
const author = pkg.author || 'SantiYT65';

/**
 * Comando: .infobot
 * Muestra información del bot
 */
export async function comandoInfoBot(sock, msg, store) {
  const jid = msg.key.remoteJid;

  const texto = `🤖 *${name}* - Información del Bot

📦 Versión: ${version}
👤 Creador: ${author}

📎 GitHub: https://github.com/santiyt65
📣 Canal Oficial: https://whatsapp.com/channel/0029VajKFjlJJhzU8fvTPn2L
💬 Grupo Oficial: https://chat.whatsapp.com/CHDMJCKuPMiLt4NuhaK1rv?mode=ac_c
💰 Donaciones: https://paypal.me/santiyt65`;

  const botones = [
    { buttonId: `.menu`, buttonText: { displayText: '📋 Menú Principal' }, type: 1 },
    { buttonId: `.donar`, buttonText: { displayText: '💸 Donar' }, type: 1 },
  ];

  const mensaje = {
    text: texto,
    footer: 'Gogeta Bot 💥',
    buttons: botones,
    headerType: 1
  };

  await sock.sendMessage(jid, mensaje, { quoted: msg });
}
