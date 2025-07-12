import fs from 'fs';

const partidas = new Map();
const cooldowns = new Map();
const rankingPath = './data/ranking.json';

const opciones = ['piedra', 'papel', 'tijera'];

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

function ganador(op1, op2) {
  if (op1 === op2) return 'empate';
  if ((op1 === 'piedra' && op2 === 'tijera') || (op1 === 'papel' && op2 === 'piedra') || (op1 === 'tijera' && op2 === 'papel')) return 'jugador1';
  return 'jugador2';
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

export async function comandoPpt(sock, msg, store) {
  const jid = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

  const args = text.trim().split(/\s+/);
  const cmd = args[0];
  const eleccion = args[1]?.toLowerCase();

  const cooldown = estaEnCooldown(from);
  if (cooldown) {
    await sock.sendMessage(jid, { text: `⏳ Espera ${cooldown}s antes de jugar de nuevo.` }, { quoted: msg });
    return;
  }

  cooldowns.set(from, Date.now() + 5000);

  if (cmd === '.ppt') {
    if (!opciones.includes(eleccion)) {
      await sock.sendMessage(jid, {
        text: '✊ *Piedra, Papel o Tijera*\nUsa: `.ppt piedra`, `.ppt papel` o `.ppt tijera`'
      }, { quoted: msg });
      return;
    }

    if (!partidas.has(jid)) {
      partidas.set(jid, {
        jugadores: {
          [from]: eleccion
        },
        tiempo: setTimeout(() => {
          partidas.delete(jid);
          sock.sendMessage(jid, { text: '⏰ Se canceló la partida por falta de jugadores.' });
        }, 60000)
      });

      await sock.sendMessage(jid, { text: `✅ Esperando a otro jugador...` }, { quoted: msg });
      return;
    }

    const partida = partidas.get(jid);
    if (partida.jugadores[from]) {
      await sock.sendMessage(jid, { text: '⚠️ Ya enviaste tu jugada.' }, { quoted: msg });
      return;
    }

    partida.jugadores[from] = eleccion;
    clearTimeout(partida.tiempo);

    const jugadores = Object.entries(partida.jugadores);
    if (jugadores.length < 2) {
      await sock.sendMessage(jid, { text: `✅ Esperando a otro jugador...` }, { quoted: msg });
      return;
    }

    const [j1, j2] = jugadores;
    const res = ganador(j1[1], j2[1]);
    const ranking = loadRanking();

    if (!ranking[j1[0]]) ranking[j1[0]] = { nombre: j1[0], puntos: 0, juegos: { ppt: 0 } };
    if (!ranking[j2[0]]) ranking[j2[0]] = { nombre: j2[0], puntos: 0, juegos: { ppt: 0 } };

    let resultado = `🤜 *${j1[0].split('@')[0]}:* ${j1[1]}\n🤛 *${j2[0].split('@')[0]}:* ${j2[1]}\n\n`;

    if (res === 'empate') {
      resultado += '🤝 ¡Empate!';
    } else {
      const ganadorID = res === 'jugador1' ? j1[0] : j2[0];
      resultado += `🎉 ¡Gana *${ganadorID.split('@')[0]}*! +1 punto`;
      ranking[ganadorID].puntos += 1;
    }

    ranking[j1[0]].juegos.ppt += 1;
    ranking[j2[0]].juegos.ppt += 1;

    partidas.delete(jid);
    saveRanking(ranking);

    await sock.sendMessage(jid, { text: resultado }, { quoted: msg });
  }
}
