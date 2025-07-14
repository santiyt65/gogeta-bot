export default {
  nombre: 'ping',
  descripcion: 'Responde con la latencia del bot',
  async ejecutar(sock, msg) {
    const start = Date.now();
    await sock.sendMessage(msg.key.remoteJid, {
      text: '🏓 Pong!'
    }, { quoted: msg });
  }
};
