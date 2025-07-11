import fs from 'fs';

const rankingPath = './data/ranking.json';

function loadRanking() {
  try {
    return JSON.parse(fs.readFileSync(rankingPath, 'utf8'));
  } catch {
    return {};
  }
}

export async function mostrarPerfil(sock, msg) {
  const jid = msg.key.participant || msg.key.remoteJid;
  const ranking = loadRanking();

  const usuario = ranking[jid];
  if (!usuario) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: '📉 No tienes estadísticas registradas aún. ¡Juega algo para comenzar!',
    }, { quoted: msg });
  }

  const juegos = usuario.juegos || {};
  const estadisticas = Object.entries(juegos)
    .map(([nombre, cantidad]) => `• ${nombre}: ${cantidad} partidas`)
    .join('\n');

  const texto = `📇 *Tu perfil:*\n\n👤 Usuario: ${usuario.nombre.split('@')[0]}\n🏆 Puntos: ${usuario.puntos}\n🎮 Juegos jugados:\n${estadisticas || 'Aún no jugaste.'}`;

  await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
}
