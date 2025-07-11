export async function comandoDonar(sock, msg) {
  const jid = msg.key.remoteJid;
  const texto = `💖 *Gracias por apoyar el bot*  
Podés donar en el siguiente enlace:

🔗 https://paypal.me/santiyt65`;

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
