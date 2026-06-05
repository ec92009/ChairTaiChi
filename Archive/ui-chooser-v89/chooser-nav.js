/**
 * Marks the active option in the chooser nav from body[data-proposal].
 */
(function initChooserNav() {
  const proposal = document.body.dataset.proposal;
  if (!proposal) {
    return;
  }

  document.querySelectorAll("[data-chooser-option]").forEach((link) => {
    const isActive = link.dataset.chooserOption === proposal;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();
