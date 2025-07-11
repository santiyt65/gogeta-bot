// lang.js
// Módulo de idioma para internacionalización (i18n)

const lang = {
  es: {
    greeting: "Hola",
    farewell: "Adiós",
    welcome: "Bienvenido",
    error: "Ha ocurrido un error",
    loading: "Cargando...",
    submit: "Enviar",
    cancel: "Cancelar",
    yes: "Sí",
    no: "No",
    // Agrega más traducciones según lo necesites
  },
  en: {
    greeting: "Hello",
    farewell: "Goodbye",
    welcome: "Welcome",
    error: "An error has occurred",
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    // Add more translations as needed
  }
};

// Función para obtener traducción según idioma y clave
function t(key, locale = "es") {
  return (lang[locale] && lang[locale][key]) || key;
}

module.exports = { lang, t };