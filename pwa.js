const installApp = document.getElementById("installApp");
const installHelp = document.getElementById("installHelp");
let installPrompt = null;

const isIos =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isInstalled =
  window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

if (!isInstalled && isIos) installApp.hidden = false;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installApp.hidden = false;
});

installApp.addEventListener("click", async () => {
  if (!installPrompt) {
    if (isIos) {
      installHelp.textContent = "No Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”.";
      installHelp.hidden = false;
    }
    return;
  }

  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installApp.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installApp.hidden = true;
  installHelp.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Não foi possível registrar o modo offline do Fino.", error);
    });
  });
}
