/**
 * Comando: .donar
 * Muestra cómo donar al desarrollador del bot
 */
export async function comandoDonar(sock, msg) {
  const jid = msg.key.remoteJid;

  const texto = `💸 *¡Apoyá el desarrollo de Gogeta Bot!*

Tu donación nos ayuda a mantener el proyecto activo, mejorar funciones, agregar más juegos y ofrecerte la mejor experiencia 🧠🎮

✨ *Podés donar desde PayPal con el siguiente botón:*`;

  const botones = [
    {
      buttonId: `.menu`,
      buttonText: { displayText: '📋 Volver al Menú' },
      type: 1
    },
    {
      buttonId: `.infobot`,
      buttonText: { displayText: '🤖 Info del Bot' },
      type: 1
    }
  ];

  const mensaje = {
    text: texto,
    footer: 'Gracias por tu apoyo ❤️',
    buttons: botones,
    headerType: 1,
    externalAdReply: {
      title: 'Donar al creador',
      body: 'Gogeta Bot',
      thumbnailUrl: 'https://imgur.com/a/JSseCDm', // Cambiable por tu imagen
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: 'https://paypal.me/santiyt65'
    }
  };

  await sock.sendMessage(jid, mensaje, { quoted: msg });
}
