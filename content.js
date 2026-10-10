
const SELECTOR = 'img[src*="/img/types/"]';
let lastType = null;

function detectType() {
  const images = [...document.querySelectorAll(SELECTOR)];

  // Buscamos la imagen del tipo favorecido,
  // no los iconos de tipos de otras zonas.
  const img = images.find(image => {
    const label = (image.alt || "").trim().toLowerCase();
    return label && image.width === 18 && image.height === 18;
  });

  if (!img) return;

  const type = (img.alt || "").trim();

  if (!type) return;

  if (lastType === null) {
    lastType = type;
    console.log("[PokeTaka Alert] Tipo inicial:", type);
    return;
  }

  if (type !== lastType) {
    const previousType = lastType;
    lastType = type;

    chrome.runtime.sendMessage({
      action: "typeChanged",
      previousType,
      newType: type
    });
  }
}

detectType();

const observer = new MutationObserver(detectType);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "alt", "width", "height"]
});
