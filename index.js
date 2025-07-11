const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa el cliente de WhatsApp con autenticación local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Muestra el QR en la terminal para escanear con WhatsApp
client.on('qr', (qr) => {
    console.log('Escanea este código QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Mensaje cuando el bot está listo
client.on('ready', () => {
    console.log('¡Bot de WhatsApp está listo!');
});

// Escucha mensajes entrantes y responde con un mensaje básico
client.on('message', async message => {
    if (message.body.toLowerCase() === 'hola') {
        await message.reply('¡Hola! Soy tu bot de WhatsApp 🤖 ¿En qué puedo ayudarte?');
    }
    // Puedes agregar más comandos/respuestas aquí
});

// Maneja errores
client.on('auth_failure', msg => {
    console.error('Fallo de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('El cliente se ha desconectado:', reason);
});

// Inicia el cliente
client.initialize();