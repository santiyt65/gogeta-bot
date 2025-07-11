import fs from 'fs';

const partidas = new Map();
const rankingPath = './data/ranking.json';

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadRanking() {
  try {
    return JSON.parse(fs.readFileSync(rankingPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveRanking(ranking) {
  fs.writeFileSync(rankingPath, JSON.stringify(ranking, null, 2));
}

export async function manejarAdivina(sock, msg) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

  const args = text.trim().split(/\s+/);
  const cmd = args[0];
  const input = args[1];

  if (cmd === '.adivina') {
    if (partidas.has(jid)) {
      await sock.sendMessage(jid, { text: '❗ Ya hay una partida activa en este chat. Escribe un número del 1 al 10.' }, { quoted: msg });
      return;
    }

    const numero = getRandom(1, 10);
    partidas.set(jid, {
      numero,
      jugadores: {},
      tiempo: setTimeout(() => {
        partidas.delete(jid);
        sock.sendMessage(jid, { text: `⏱️ ¡Se acabó el tiempo! El número era *${numero}*.` });
      }, 60000) // 1 minuto para adivinar
    });

    await sock.sendMessage(jid, { text: '🎯 *Adivina el número entre 1 y 10!*\nResponde escribiendo un número en el chat.' }, { quoted: msg });
    return;
  }

  // Si hay partida activa y escriben un número
  if (partidas.has(jid) && /^\d+$/.test(text.trim())) {
    const partida = partidas.get(jid);
    const numero = parseInt(text.trim());

    if (numero === partida.numero) {
      clearTimeout(partida.tiempo);
      partidas.delete(jid);

      const ranking = loadRanking();
      const user = ranking[from] || { nombre: from, puntos: 0, juegos: { adivina: 0 } };

      user.puntos += 1;
      user.juegos.adivina = (user.juegos.adivina || 0) + 1;
      ranking[from] = user;
      saveRanking(ranking);

      await sock.sendMessage(jid, { text: `🎉 ¡${from.split('@')[0]} adivinó el número *${numero}*! +1 punto 🏆` }, { quoted: msg });
    } else {
      await sock.sendMessage(jid, { text: `❌ ${from.split('@')[0]} dijo *${numero}*, pero no es.` }, { quoted: msg });
    }
  }
}
