(() => {
  document.querySelectorAll("[data-spotlight]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  document.querySelectorAll(".mockup-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const pressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!pressed));
    });
  });

  const releaseLabels = document.querySelectorAll("[data-release-version]");
  if (releaseLabels.length) {
    fetch("https://api.github.com/repos/NoizWorks/MediaLatch/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => response.ok ? response.json() : null)
      .then((release) => {
        if (!release?.tag_name) return;
        releaseLabels.forEach((label) => { label.textContent = `Latest release: ${release.tag_name} ↗`; });
      })
      .catch(() => {});
  }
})();
