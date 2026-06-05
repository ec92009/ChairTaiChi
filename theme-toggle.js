/**
 * Day/night appearance toggle for the promoted Sunrise Editorial UI.
 */
(function initThemeToggle() {
  const toggle = document.getElementById("themeModeToggle");
  if (!toggle) {
    return;
  }

  const storageKey = "chair-taichi-theme";
  const label = toggle.querySelector(".theme-mode-toggle__label");
  const icon = toggle.querySelector(".theme-mode-toggle__icon");

  function applyTheme(mode) {
    const isNight = mode === "night";
    document.body.dataset.theme = mode;
    toggle.setAttribute("aria-pressed", String(isNight));
    toggle.setAttribute("aria-label", isNight ? "Switch to day mode" : "Switch to night mode");
    if (label) {
      label.textContent = isNight ? "Night" : "Day";
    }
    if (icon) {
      icon.textContent = isNight ? "🌙" : "☀️";
    }
  }

  const saved = localStorage.getItem(storageKey);
  const initial =
    saved === "day" || saved === "night"
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "day";

  applyTheme(initial);

  toggle.addEventListener("click", () => {
    const next = document.body.dataset.theme === "night" ? "day" : "night";
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  });
})();
