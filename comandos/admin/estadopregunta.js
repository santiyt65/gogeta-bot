import fs from 'fs';

const archivoPendientes = './lib/preguntas_pendientes.json';
const archivoPersonalizadas = './lib/preguntas_personalizadas.json';

export async function comandoEstadoPregunta(sock, msg, isAdmin) {
  const jid = msg.key.remoteJid;

  if (!isAdmin) {
    return sock.sendMessage(jid, { text: '❌ Solo administradores pueden usar este comando.' }, { quoted: msg });
  }

  let pendientes = {};
  let personalizadas = {};

  if (fs.existsSync(archivoPendientes)) {
    pendientes = JSON.parse(fs.readFileSync(archivoPendientes));
  }
  if (fs.existsSync(archivoPersonalizadas)) {
    personalizadas = JSON.parse(fs.readFileSync(archivoPersonalizadas));
  }

  // Contar totales por categoría
  const contarPreguntas = (obj) => {
    let total = 0;
    for (const cat in obj) {
      if (Array.isArray(obj[cat])) total += obj[cat].length;
    }
    return total;
  };

  const totalPendientes = contarPreguntas(pendientes);
  const totalAprobadas = contarPreguntas(personalizadas);

  const texto = 
`📊 *Estado de preguntas:*

🕐 Pendientes de revisión: *${totalPendientes}*
✅ Aprobadas y en la trivia: *${totalAprobadas}*`;

  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}
