import fs from 'fs';

export async function comandoRankingTrivia(sock, msg) {
  const jid = msg.key.remoteJid;
  const ranking = JSON.parse(fs.readFileSync('./lib/ranking_trivia.json'));

  const top = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (top.length === 0) {
    return sock.sendMessage(jid, {
      text: '📊 No hay jugadores en el ranking todavía.',
    }, { quoted: msg });
  }

  const texto = top.map(([id, puntos], i) => {
    const numero = id.split('@')[0];
    return `${i + 1}. @${numero} — *${puntos} punto(s)*`;
  }).join('\n');

  await sock.sendMessage(jid, {
    text: `🏆 *Ranking Trivia*\n\n${texto}`,
    mentions: top.map(([id]) => id),
  }, { quoted: msg });
}
