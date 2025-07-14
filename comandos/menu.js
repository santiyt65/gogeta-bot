export default {
  nombre: 'menu',
  descripcion: 'Muestra el menú principal',
  async ejecutar(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: 'https://i.imgur.com/ZTnB2eV.jpeg' },
      caption: `🌌 *GOGETA-BOT | MENÚ PRINCIPAL*\n\n🧩 Comandos disponibles:\n• .ping\n• .infobot\n• .menu`,
      footer: '© GogetaBot - Santiyt65',
      buttons: [
        { buttonId: '.ping', buttonText: { displayText: '📡 Ping' }, type: 1 },
        { buttonId: '.infobot', buttonText: { displayText: '🤖 InfoBot' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: msg });
  }
};
