export default {
  nombre: 'infobot',
  descripcion: 'Muestra información del bot',
  async ejecutar(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🤖 *Información del Bot*\n\n👨‍💻 Creador: @santiyt65\n🌐 GitHub: https://github.com/santiyt65\n💰 Donaciones: https://paypal.me/tuenlace`,
      footer: '¿Querés apoyar el proyecto?',
      buttons: [
        { buttonId: '.donar', buttonText: { displayText: '❤️ Donar' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: msg });
  }
};
