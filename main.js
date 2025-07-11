import { mostrarPerfil } from './comandos/perfil.js';
import { manejarAhorcado } from './comandos/ahorcado.js';
import { resetRanking } from './comandos/reset.js';
import { comandoBan } from './comandos/ban.js';
import { comandoUnban } from './comandos/unban.js';
import { comandoMute } from './comandos/mute.js';
import { mostrarMenuAdmin } from './comandos/adminmenu.js';
import { comandoPromote } from './comandos/promote.js';
import { comandoDemote } from './comandos/demote.js';
import { comandoUnmute } from './comandos/unmute.js';
import { comandoLinkGrupo } from './comandos/linkgrupo.js';
import { comandoInfoGrupo } from './comandos/infogrupo.js';
import { comandoEtiquetar } from './comandos/etiquetar.js';
import { comandoInfoBot } from './comandos/infobot.js';
import { comandoDonar } from './comandos/donar.js';
import { comandoMenu } from './comandos/menu.js';
import { comandoSubMenu } from './comandos/menu_secciones.js';
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configuración e inicialización del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Evento para mostrar el QR en la terminal
client.on('qr', (qr) => {
    console.log('Escanea el siguiente QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento que indica que el bot está listo
client.on('ready', () => {
    console.log('¡El bot está listo y conectado a WhatsApp!');
});

// Lógica de manejo de mensajes
client.on('message', async message => {
    const text = message.body;

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
    if (text === '.unmute') await comandoUnmute(client, message);
    if (text === '.linkgrupo') await comandoLinkGrupo(client, message);
    if (text === '.infogrupo') await comandoInfoGrupo(client, message);

    // Comando .infobot
    if (text === '.infobot') await comandoInfoBot(client, message);

    // Comando .donar
    if (text === '.donar') await comandoDonar(client, message);

    // Comando .menu y submenús
    if (text === '.menu') await comandoMenu(client, message);
    if (text.startsWith('.menu ')) await comandoSubMenu(client, message, text.split(' '));

    // Comando .etiquetar (soporta variantes)
    if (text.startsWith('.etiquetar')) await comandoEtiquetar(client, message);

    // Comandos ban/unban/mute
    if (text.startsWith('.ban')) await comandoBan(client, message);
    if (text.startsWith('.unban')) await comandoUnban(client, message);
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

// Manejo de errores de autenticación
client.on('auth_failure', msg => {
    console.error('Error de autenticación:', msg);
});

// Evento cuando el cliente se desconecta
client.on('disconnected', (reason) => {
    console.log('El cliente se desconectó por:', reason);
});

// Inicializa el cliente
client.initialize();