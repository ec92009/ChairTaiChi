/**
 * Day/night toggle for chooser proposal pages. Persists per proposal in sessionStorage.
 */
(function initProposalThemeToggle() {
  const toggle = document.getElementById("themeModeToggle");
  if (!toggle) {
    return;
  }

  const proposalId = document.body.dataset.proposal || "original";
  const storageKey = `chair-taichi-proposal-theme-${proposalId}`;
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

  const saved = sessionStorage.getItem(storageKey);
  const initial =
    saved === "day" || saved === "night"
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "day";

  applyTheme(initial);

  toggle.addEventListener("click", () => {
    const next = document.body.dataset.theme === "night" ? "day" : "night";
    sessionStorage.setItem(storageKey, next);
    applyTheme(next);
  });
})();
