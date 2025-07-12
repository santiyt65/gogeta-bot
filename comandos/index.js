// comandos/index.js

// Admin
export { comandoBan } from './admin/ban.js';
export { comandoUnban } from './admin/unban.js';
export { comandoMute } from './admin/mute.js';
export { comandoUnmute } from './admin/unmute.js';
export { comandoListaMute } from './admin/listamute.js';
export { comandoResetRanking } from './admin/resetRanking.js';
export { comandoModeracionpreguntas, manejarBotonRespuesta } from './admin/moderacionpreguntas.js';
export { comandoEstadoPregunta } from './admin/estadopregunta.js';

// Juegos
export { comandoAdivina } from './juegos/adivina.js';
export { comandoPpt } from './juegos/ppt.js';
export { comandoAhorcado } from './ahorcado.js';
export { comandoTrivia } from './trivia.js';
export { comandoAgregarPregunta } from './agregarpregunta.js';
export { comandoMisPreguntas } from './mispreguntas.js';
export { comandoEliminarPregunta } from './eliminarpregunta.js';
export { comandoModificarPregunta } from './modificarpregunta.js';

// Generales
export { comandoPing } from './general/ping.js';
export { comandoInfoBot } from './infobot.js';
export { comandoMenu } from './menu.js';
export { comandoPerfil } from './perfil.js';
export { comandoEtiquetar } from './etiquetar.js';
