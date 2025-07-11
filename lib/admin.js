export async function esAdmin(sock, jid, sender) {
  if (!jid.endsWith('@g.us')) return true; // En privado, todos son "admin"

  try {
    const metadata = await sock.groupMetadata(jid);
    const participantes = metadata.participants || [];

    const miembro = participantes.find(p => p.id === sender);
    return miembro?.admin !== null && miembro?.admin !== undefined;
  } catch (e) {
    console.error('[ADMIN ERROR]', e);
    return false;
  }
}

export const OWNERS = ['549123456789@s.whatsapp.net']; // Tu número como owner
