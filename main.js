import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const comandos = new Map();

async function cargarComandos() {
  const dir = path.join(__dirname, 'comandos');
  const files = await readdir(dir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const { default: cmd } = await import(`./comandos/${file}`);
      if (cmd?.nombre) comandos.set(cmd.nombre, cmd);
    }
  }
}

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('[🔄] Reconectando...');
        iniciarBot();
      } else {
        console.log('[❌] Sesión cerrada.');
      }
    } else if (connection === 'open') {
      console.log('[✅] Bot conectado');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!body.startsWith('.')) return;

    const [cmd, ...args] = body.slice(1).split(/\s+/);
    const comando = comandos.get(cmd.toLowerCase());
    if (comando) {
      try {
        await comando.ejecutar(sock, msg, args);
      } catch (e) {
        console.error(`Error en .${cmd}:`, e);
      }
    }
  });
}

await cargarComandos();
iniciarBot();
