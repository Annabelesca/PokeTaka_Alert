
chrome.runtime.onMessage.addListener(message => {
  if (message.action !== "typeChanged") return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "¡Ha cambiado el Favored Type!",
    message: `${message.previousType} → ${message.newType}`,
    priority: 2
  });
});
