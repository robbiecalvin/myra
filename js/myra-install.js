(() => {
  const button = document.getElementById("myraInstall");
  const help = document.getElementById("myraInstallHelp");
  const standalone = window.matchMedia("(display-mode: standalone)");
  const isInstalled = () => standalone.matches || navigator.standalone === true;
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installPrompt;

  function updateVisibility() {
    button.hidden = isInstalled();
    if (isInstalled()) hideHelp();
  }

  function hideHelp() {
    help.hidden = true;
    help.textContent = "";
    button.setAttribute("aria-expanded", "false");
  }

  function showHelp() {
    if (isAppleMobile) {
      help.textContent = "Open Myra in Safari, tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.";
    } else if (/Android/.test(navigator.userAgent)) {
      help.textContent = "Open Myra in Chrome, tap the three-dot menu, then Add to Home screen. Choose Install if offered.";
    } else {
      help.textContent = "Open your browser menu and look for Install Myra or an option to install this site as an app.";
    }
    help.hidden = false;
    button.setAttribute("aria-expanded", "true");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = undefined;
    hideHelp();
    button.hidden = true;
  });

  standalone.addEventListener("change", updateVisibility);
  updateVisibility();

  button.addEventListener("click", async () => {
    if (!installPrompt) {
      if (help.hidden) showHelp();
      else hideHelp();
      return;
    }

    const prompt = installPrompt;
    installPrompt = undefined;
    hideHelp();
    try {
      await prompt.prompt();
    } catch {
      showHelp();
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./myra-sw.js").catch((error) => {
      console.warn("Myra service worker registration failed", error);
    });
  }
})();
