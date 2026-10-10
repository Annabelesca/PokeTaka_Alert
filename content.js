// ============================================================
// PokeTaka Alert - Content script
// Vigila el icono del "tipo favorecido" en la página y avisa
// al background cuando cambia.
// ============================================================

// --- Configuración (lo único que habrá que tocar si la web cambia) ---

// Imágenes de iconos de tipo (incluye los de otras zonas de la página)
const SELECTOR = 'img[src*="/img/types/"]';

// Tamaño en px del icono del tipo favorecido. Es lo que lo distingue
// de los iconos de tipos de otras zonas.
const ICON_SIZE = 18;

// Espera (ms) tras el último cambio del DOM antes de comprobar
const DEBOUNCE_MS = 150;

// Clave con la que se guarda el último tipo en chrome.storage.local
const STORAGE_KEY = "lastType";

let timer = null;

// --- Lectura del tipo actual desde la página ---

// Devuelve el tipo favorecido (texto del alt) o null si no se encuentra.
function readCurrentType() {
  const img = [...document.querySelectorAll(SELECTOR)].find(el => {
    // naturalWidth/Height es más fiable que width/height si la imagen
    // aún no se ha pintado; si no existe, se usa el tamaño renderizado.
    const w = el.naturalWidth || el.width;
    const h = el.naturalHeight || el.height;
    return el.alt?.trim() && w === ICON_SIZE && h === ICON_SIZE;
  });

  return img ? img.alt.trim() : null;
}

// --- Lógica principal ---

async function detectType() {
  const type = readCurrentType();
  if (!type) return; // No hay icono válido en este momento

  // Recuperamos el último tipo guardado (persiste entre recargas y pestañas)
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const lastType = stored[STORAGE_KEY];

  // Primera vez que se detecta un tipo: lo guardamos sin avisar
  if (lastType === undefined) {
    await chrome.storage.local.set({ [STORAGE_KEY]: type });
    console.log("[PokeTaka Alert] Tipo inicial:", type);
    return;
  }

  // Mismo tipo que antes: no hay nada que notificar
  if (type === lastType) return;

  // El tipo ha cambiado: guardamos el nuevo y avisamos al background
  await chrome.storage.local.set({ [STORAGE_KEY]: type });

  try {
    chrome.runtime.sendMessage({
      action: "typeChanged",
      previousType: lastType,
      newType: type
    });
  } catch (e) {
    // La extensión se recargó con la pestaña abierta: el contexto
    // ya no es válido, así que dejamos de observar.
    observer.disconnect();
  }
}

// --- Observación del DOM ---

// Agrupa ráfagas de cambios en una sola comprobación
function scheduleDetect() {
  clearTimeout(timer);
  timer = setTimeout(detectType, DEBOUNCE_MS);
}

// Comprobación inicial al cargar la página
detectType();

// Comprobación cada vez que cambian nodos o los atributos src/alt
const observer = new MutationObserver(scheduleDetect);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "alt"]
});
