// ============================================================
// PokeTaka Alert - Service worker (background)
// Recibe el aviso del content script y muestra la notificación
// y el badge (con color según el tipo) sobre el icono.
// ============================================================

// --- Configuración del badge ---

// Máximo de caracteres que cabe en un badge
const BADGE_MAX_CHARS = 4;

// Color de respaldo si aparece un tipo que no está en el mapa
const DEFAULT_COLOR = "#E53935";

// Colores por tipo (clave en minúsculas, tal como llega en el alt).
// Para cambiar un color, solo hay que editar su línea.
const TYPE_COLORS = {
  normal:   "#A8A878",
  fire:     "#F08030",
  water:    "#6890F0",
  electric: "#F8D030",
  grass:    "#78C850",
  ice:      "#98D8D8",
  fighting: "#C03028",
  poison:   "#A040A0",
  ground:   "#E0C068",
  flying:   "#A890F0",
  psychic:  "#F85888",
  bug:      "#A8B820",
  rock:     "#B8A038",
  ghost:    "#705898",
  dragon:   "#7038F8",
  dark:     "#705848",
  steel:    "#B8B8D0",
  fairy:    "#EE99AC"
};

// Tipos con fondo claro: el texto del badge se pone negro para que se lea
const LIGHT_TYPES = new Set(["electric", "ice", "ground", "steel", "fairy", "normal"]);

// --- Utilidades ---

// Devuelve el color de fondo para un tipo (o el de respaldo)
function getColor(type) {
  return TYPE_COLORS[type.toLowerCase()] ?? DEFAULT_COLOR;
}

// Devuelve el color del texto según el brillo del fondo
function getTextColor(type) {
  return LIGHT_TYPES.has(type.toLowerCase()) ? "#000000" : "#FFFFFF";
}

// --- Escucha del aviso del content script ---

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "typeChanged") return;

  // 1. Notificación de escritorio
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "PokeTaka Alert",
    message: `Type changed: ${msg.previousType} → ${msg.newType}`,
    priority: 2
  });

  // 2. Badge sobre el icono, con el color del nuevo tipo
  chrome.action.setBadgeText({ text: msg.newType.slice(0, BADGE_MAX_CHARS) });
  chrome.action.setBadgeBackgroundColor({ color: getColor(msg.newType) });
  chrome.action.setBadgeTextColor({ color: getTextColor(msg.newType) });
});

// Al hacer clic en el icono, se borra el badge (alerta vista)
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
});