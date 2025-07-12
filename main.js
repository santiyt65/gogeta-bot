import fs from 'fs';
import { mostrarPerfil } from './comandos/perfil.js';
import { manejarAhorcado } from './comandos/ahorcado.js';
import { resetRanking } from './comandos/reset.js';
import { comandoBan } from './comandos/admin/ban.js';
import { comandoUnban } from './comandos/admin/unban.js';
import { comandoMute } from './comandos/mute.js';
import { mostrarMenuAdmin } from './comandos/adminmenu.js';
import { comandoPromote } from './comandos/promote.js';
import { comandoDemote } from './comandos/demote.js';
import { comandoUnmute } from './comandos/admin/unmute.js';
import { comandoListaMute } from './comandos/admin/listamute.js';
import { comandoLinkGrupo } from './comandos/linkgrupo.js';
import { comandoInfoGrupo } from './comandos/infogrupo.js';
import { comandoEtiquetar } from './comandos/etiquetar.js';
import { comandoInfoBot } from './comandos/infobot.js';
import { comandoMenu } from './comandos/menu.js';
import { comandoSubMenu } from './comandos/menu_secciones.js';
import { comandoTrivia, iniciarTriviaCategoria, verificarRespuesta } from './comandos/trivia.js';
import { comandoRankingTrivia } from './comandos/ranking_trivia.js';
import { comandoAgregarPregunta } from './comandos/agregarpregunta.js';
import { comandoMisPreguntas } from './comandos/mispreguntas.js';
import { comandoEliminarPregunta } from './comandos/eliminarpregunta.js';
import { comandoModificarPregunta } from './comandos/modificarpregunta.js';
import { comandoRevisarPreguntas, comandoAprobarPregunta, comandoRechazarPregunta } from './comandos/moderacion_preguntas.js';
import { comandoEstadoPregunta } from './comandos/admin/estadopregunta.js';
import comandos from './comandos/index.js';
import { comandoDonar } from './comandos/general/donar.js';
import { comandoModeracionPreguntas, manejarBotonRespuesta } from './comandos/index.js'; // <--- NUEVO IMPORT

const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// === BANEO ===
const archivoBan = './lib/baneados.json';
let baneados = fs.existsSync(archivoBan)
  ? JSON.parse(fs.readFileSync(archivoBan))
  : [];

// === MUTEADOS ===
const archivoMute = './lib/muteados.json';
let muteados = fs.existsSync(archivoMute)
  ? JSON.parse(fs.readFileSync(archivoMute))
  : [];

// === EJEMPLO de función para validar admin ===
function isAdmin(message) {
  const adminNumbers = [
    '5491112345678@c.us', // <-- cambia esto por los números reales de admin
  ];
  return adminNumbers.includes(message.author || message.from);
}

// Si usas sock/msg en vez de client/message, define sock y msg:
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});
const sock = client;

client.on('qr', (qr) => {
    console.log('Escanea el siguiente QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡El bot está listo y conectado a WhatsApp!');
});

client.on('message', async message => {
    const text = message.body;
    const msg = message;
    const sender = msg.key?.participant || msg.key?.remoteJid;

    // Verificar muteados
    if (muteados.includes(sender)) return; // El bot ignora al usuario muteado

    // Verificar baneados
    if (baneados.includes(sender)) return; // el bot no responde

    // Comando .perfil
    if (text === '.perfil') {
        await mostrarPerfil(client, message);
        return;
    }

    // Comando .reset ranking
    if (text === '.reset ranking') {
        await resetRanking(client, message);
        return;
    }

    // Comandos de administración
    if (text === '.admin') await mostrarMenuAdmin(client, message);
    if (text === '.promote') await comandoPromote(client, message);
    if (text === '.demote') await comandoDemote(client, message);

    // Comando .unmute con validación de admin
    if (text === '.unmute') await comandoUnmute(sock, msg, isAdmin);

    // Comando .listamute con validación de admin
    if (text === '.listamute') await comandoListaMute(sock, msg, isAdmin);

    // Comando .ban desde index.js (funciona bien)
    if (text.startsWith('.ban')) await comandos.comandoBan(sock, msg, isAdmin);

    // Comando .moderarpreguntas (nuevo)
    if (text === '.moderarpreguntas') {
      await comandoModeracionPreguntas(sock, msg, isAdmin);
    }

    // Botón de aprobar/rechazar pregunta (nuevo)
    if (msg.message?.buttonsResponseMessage?.selectedButtonId?.startsWith('.aprobar_') ||
        msg.message?.buttonsResponseMessage?.selectedButtonId?.startsWith('.rechazar_')) {
      await manejarBotonRespuesta(sock, msg);
    }

    if (text === '.linkgrupo') await comandoLinkGrupo(client, message);
    if (text === '.infogrupo') await comandoInfoGrupo(client, message);

    // Comando .infobot
    if (text === '.infobot') await comandoInfoBot(client, message);

    // Comando .donar
    if (text === '.donar') await comandoDonar(sock, msg);

    // .menu y submenús
    if (text === '.menu') await comandoMenu(client, message);
    if (text.startsWith('.menu ')) await comandoSubMenu(client, message, text.split(' '));

    // Comando .trivia simple
    if (text === '.trivia') await comandoTrivia(client, message);

    // Comando .trivia <categoria>
    if (text.startsWith('.trivia ')) {
        const categoria = text.split(' ')[1];
        await iniciarTriviaCategoria(client, message, categoria);
    }

    // Comando ranking trivia
    if (text === '.ranking') await comandoRankingTrivia(client, message);

    // Manejo de respuestas de trivia (números)
    if (['1', '2', '3', '4'].includes(text.trim())) await verificarRespuesta(client, message);

    // Comando para agregar preguntas de trivia
    if (text.startsWith('.agregarpregunta')) await comandoAgregarPregunta(client, message);

    // Comando para mostrar las preguntas del usuario
    if (text === '.mispreguntas') await comandoMisPreguntas(client, message);

    // Comando para eliminar preguntas de trivia
    if (text.startsWith('.eliminarpregunta')) await comandoEliminarPregunta(client, message);

    // Comando para modificar preguntas de trivia
    if (text.startsWith('.modificarpregunta')) await comandoModificarPregunta(client, message);

    // Comandos de moderación de preguntas (requiere admin)
    if (text === '.revisarpreguntas') await comandoRevisarPreguntas(client, message, isAdmin(message));
    if (text === '.aprobarpregunta') await comandoAprobarPregunta(client, message, isAdmin(message));
    if (text === '.rechazarpregunta') await comandoRechazarPregunta(client, message, isAdmin(message));

    // Comando para ver estado de una pregunta (requiere admin)
    if (text === '.estadopregunta') await comandoEstadoPregunta(sock, msg, isAdmin);

    // Comando .unban (nuevo import y handler)
    if (text.startsWith('.unban')) await comandoUnban(client, message);

    // Comando .etiquetar (soporta variantes)
    if (text.startsWith('.etiquetar')) await comandoEtiquetar(client, message);

    // Comando .mute
    if (text.startsWith('.mute')) await comandoMute(client, message);

    // Comando para manejar ahorcado (siempre lo intenta manejar)
    await manejarAhorcado(client, message);

    // Menú interactivo con botones personalizados (antiguo "menu")
    if (text.toLowerCase() === 'menu') {
        const buttons = new Buttons(
            'Selecciona una opción del menú:',
            [
                { body: 'Menu 1️⃣' },
                { body: 'Menu 2️⃣' },
                { body: 'Menu 3️⃣' }
            ],
            '💫Menu De Gogeta💫',
            ''
        );
        await message.reply(buttons);
    }

    // Respuesta personalizada al "Menu 1️⃣"
    if (text === 'Menu 1️⃣') {
        const menu1 = `
🔴Menu 1️⃣

🎲Juegos
1 - Verdad o Reto
2 - Ahorcado
3 - papel, piedra o tijera

😂Comando Trols 😂
1 - Gay @username
2 - puto @usarname
3 - zorra @usarname
        `;
        await message.reply(menu1);
    }

    // Respuestas genéricas para los otros menús
    if (text === 'Menu 2️⃣') {
        await message.reply('Has seleccionado Menu 2️⃣. Aquí puedes agregar las funcionalidades del segundo menú.');
    }
    if (text === 'Menu 3️⃣') {
        await message.reply('Has seleccionado Menu 3️⃣. Aquí puedes agregar las funcionalidades del tercer menú.');
    }
});

// === Escuchar respuestas de botones (si usas sock) ===
// Si usas Baileys, este bloque es necesario
if (typeof sock !== "undefined" && sock.ev && typeof sock.ev.on === "function") {
  sock.ev.on('messages.upsert', async (m) => {
    const msgs = m.messages;
    if (!msgs || msgs.length === 0) return;

    for (const message of msgs) {
      if (message.message?.buttonsResponseMessage) {
        await manejarBotonRespuesta(sock, message);
      }
    }
  });
}

client.on('auth_failure', msg => {
    console.error('Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('El cliente se desconectó por:', reason);
});

client.initialize();