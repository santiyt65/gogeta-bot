export async function comandoSubMenu(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const seccion = args[1]?.toLowerCase();

  let texto = '';

  switch (seccion) {
    case 'juegos':
      texto = `🎮 *Menú de Juegos*

• .adivina 🧠
• .ppt ✊✋✌️
• .ahorcado 💀
• .ranking 🏆
• .perfil 📊`;
      break;

    case 'admin':
      texto = `👑 *Menú de Administración*

• .etiquetar [texto]
• .ban / .unban
• .mute / .unmute
• .promote / .demote
• .infogrupo
• .reset ranking`;
      break;

    case 'info':
      texto = `📚 *Información*

• .infobot 🤖
• .ping 📶
• .donar 💰
• .grupooficial 👥
• .canaloficial 📣`;
      break;

    case 'util':
      texto = `🧰 *Utilidades*

• .idioma
• .estado
• .ayuda
• .bugreport`;
      break;

    default:
      texto = '❗ Sección no válida. Usa `.menu` para ver las opciones.';
  }

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
