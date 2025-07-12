import fs from 'fs';

const partidas = new Map();
const cooldowns = new Map();
const palabras = ['gogeta', 'android', 'saiyajin', 'fusion', 'kamehameha', 'dragon', 'whis', 'zeno', 'broly'];

const rankingPath = './data/ranking.json';

function elegirPalabra() {
  return palabras[Math.floor(Math.random() * palabras.length)];
}

function ocultar(palabra, letras) {
  return palabra.split('').map(l => letras.includes(l) ? l : '◻️').join(' ');
}

function loadRanking() {
  try {
    return JSON.parse(fs.readFileSync(rankingPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveRanking(data) {
  fs.writeFileSync(rankingPath, JSON.stringify(data, null, 2));
}

function estaEnCooldown(jid) {
  const espera = cooldowns.get(jid);
  if (!espera) return false;
  const ahora = Date.now();
  const restante = espera - ahora;
  if (restante > 0) return Math.ceil(restante / 1000);
  cooldowns.delete(jid);
  return false;
}

export async function comandoAhorcado(sock, msg, store)  {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

  const args = text.trim().split(/\s+/);
  const cmd = args[0];
  const letra = args[1]?.toLowerCase();

  const cooldown = estaEnCooldown(from);
  if (cooldown) {
    await sock.sendMessage(jid, { text: `⏳ Espera ${cooldown}s antes de enviar otra letra.` }, { quoted: msg });
    return;
  }

  cooldowns.set(from, Date.now() + 5000);

  if (cmd === '.ahorcado') {
    if (partidas.has(jid)) {
      await sock.sendMessage(jid, { text: '🕹️ Ya hay un juego activo. Escribe una letra para seguir jugando.' }, { quoted: msg });
      return;
    }

    const palabra = elegirPalabra();
    const estado = {
      palabra,
      letras: [],
      errores: [],
      intentosRestantes: 6,
      jugadores: {},
      tiempo: setTimeout(() => {
        partidas.delete(jid);
        sock.sendMessage(jid, { text: `⏱️ Tiempo agotado. La palabra era *${palabra}*.` });
      }, 120000) // 2 minutos
    };

    partidas.set(jid, estado);
    const oculta = ocultar(palabra, estado.letras);
    await sock.sendMessage(jid, { text: `🎮 *Ahorcado iniciado!*\n\n${oculta}\n\n❗ Escribe una letra.` }, { quoted: msg });
    return;
  }

  // Si hay partida activa
  if (partidas.has(jid) && /^[a-zA-Z]$/.test(text.trim())) {
    const letraIngresada = text.trim().toLowerCase();
    const estado = partidas.get(jid);

    if (estado.letras.includes(letraIngresada) || estado.errores.includes(letraIngresada)) {
      await sock.sendMessage(jid, { text: '⚠️ Esa letra ya fue usada.' }, { quoted: msg });
      return;
    }

    if (estado.palabra.includes(letraIngresada)) {
      estado.letras.push(letraIngresada);
    } else {
      estado.errores.push(letraIngresada);
      estado.intentosRestantes -= 1;
    }

    const palabraMostrada = ocultar(estado.palabra, estado.letras);

    if (!palabraMostrada.includes('◻️')) {
      clearTimeout(estado.tiempo);
      partidas.delete(jid);

      const ranking = loadRanking();
      const jugador = ranking[from] || { nombre: from, puntos: 0, juegos: { ahorcado: 0 } };
      jugador.puntos += 1;
      jugador.juegos.ahorcado = (jugador.juegos.ahorcado || 0) + 1;
      ranking[from] = jugador;
      saveRanking(ranking);

      await sock.sendMessage(jid, { text: `🎉 ¡${from.split('@')[0]} completó la palabra *${estado.palabra}*! +1 punto 🏆` }, { quoted: msg });
      return;
    }

    if (estado.intentosRestantes <= 0) {
      clearTimeout(estado.tiempo);
      partidas.delete(jid);
      await sock.sendMessage(jid, { text: `💀 ¡Perdieron! La palabra era *${estado.palabra}*.` }, { quoted: msg });
      return;
    }

    const intentos = '❤️'.repeat(estado.intentosRestantes) + '🤍'.repeat(6 - estado.intentosRestantes);
    const errores = estado.errores.length ? `❌ Letras malas: ${estado.errores.join(', ')}` : '';

    await sock.sendMessage(jid, {
      text: `🔤 ${palabraMostrada}\n${errores}\n${intentos}\n\nEscribe otra letra...`
    }, { quoted: msg });
  }
}
