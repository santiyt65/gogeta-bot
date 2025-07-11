import fs from 'fs';

const archivo = './lib/preguntas_personalizadas.json';

export async function comandoMisPreguntas(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!fs.existsSync(archivo)) {
    return await sock.sendMessage(jid, { text: '❗ No hay preguntas personalizadas aún.' }, { quoted: msg });
  }

  const personalizadas = JSON.parse(fs.readFileSync(archivo));

  let texto = `📝 *Tus preguntas agregadas:*\n\n`;

  let count = 0;

  for (const categoria in personalizadas) {
    const preguntas = personalizadas[categoria].filter(p => p.autor === sender);
    if (preguntas.length > 0) {
      texto += `📂 *Categoría:* ${categoria}\n`;
      preguntas.forEach((p, i) => {
        texto += `${i + 1}. ${p.pregunta}\n`;
      });
      texto += '\n';
      count += preguntas.length;
    }
  }

  if (count === 0) texto = '❗ No encontré preguntas agregadas por vos.';

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
