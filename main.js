import makeWASocket from '@whiskeysockets/baileys';
import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, './session'));

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[ ℹ️ ] Usando la versión de WhatsApp: ${version.join('.')}, última: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('[ 📲 ] Escanea el QR con tu WhatsApp');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const motivo = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (motivo === DisconnectReason.loggedOut) {
        console.log('[ 🔒 ] Sesión cerrada. Borra la carpeta "session" para volver a emparejar.');
      } else {
        console.log('[ ❌ ] Desconectado. Reintentando...');
        iniciarBot(); // Reconectar
      }
    } else if (connection === 'open') {
      console.log('[ ✅ ] ¡Conectado exitosamente a WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Comandos de ejemplo:
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const mensaje = m.message.conversation || m.message.extendedTextMessage?.text || '';
    const comando = mensaje.trim().toLowerCase();

    const jid = m.key.remoteJid;

    if (comando === '.ping') {
      const tInicio = Date.now();
      await sock.sendMessage(jid, { text: '🏓 Pong!' });
      const tFinal = Date.now();
      await sock.sendMessage(jid, { text: `📶 Latencia: ${tFinal - tInicio} ms` });
    }

    if (comando === '.menu') {
      await sock.sendMessage(jid, {
        image: { url: './media/menu.jpg' },
        caption: `🌟 *GOGETA-BOT* 🌟\n\n👋 Hola, este es el menú principal.\n\n✅ .ping\n✅ .infobot\n✅ .donar`,
        footer: 'Gogeta-Bot',
        buttons: [
          { buttonId: '.infobot', buttonText: { displayText: '📘 InfoBot' }, type: 1 },
          { buttonId: '.donar', buttonText: { displayText: '💖 Donar' }, type: 1 },
        ],
        headerType: 4,
      });
    }

    if (comando === '.infobot') {
      await sock.sendMessage(jid, {
        text: `🤖 *Gogeta-Bot*\n\n🔧 Versión: 1.0\n📦 Repositorio: https://github.com/santiyt65/gogeta-bot\n📱 Contacto: wa.me/549XXXXXXXXXX\n💸 PayPal: https://paypal.me/tuusuario`
      });
    }

    if (comando === '.donar') {
      await sock.sendMessage(jid, {
        text: `💖 Si quieres apoyar el proyecto:\n\n🔗 https://paypal.me/tuusuario`
      });
    }
  });
}

iniciarBot();
