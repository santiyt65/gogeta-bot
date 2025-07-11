import fs from 'fs';
const menuImage = fs.readFileSync('./media/menu.jpg');

export async function comandoMenu(sock, msg) {
  const jid = msg.key.remoteJid;

  const texto = `👋 ¡Hola! Soy *GOGETA\\BOT*

Seleccioná una categoría para ver los comandos disponibles:`;

  await sock.sendMessage(jid, {
    image: menuImage,
    caption: texto,
    footer: 'Menú Principal - creado por santiyt65',
    buttons: [
      { buttonId: '.menu juegos', buttonText: { displayText: '🎮 Juegos' }, type: 1 },
      { buttonId: '.menu admin', buttonText: { displayText: '👑 Administración' }, type: 1 },
      { buttonId: '.menu info', buttonText: { displayText: '📚 Información' }, type: 1 },
      { buttonId: '.menu util', buttonText: { displayText: '🧰 Utilidades' }, type: 1 }
    ],
    headerType: 4 // Imagen con botones
  }, { quoted: msg });
}
