(() => {
  const hero = document.querySelector('[data-graphite-hero]');
  if (!hero) return;

  const deck = hero.querySelector('.graphite-deck');
  const tablist = hero.querySelector('[role="tablist"]');
  const tabs = Array.from(hero.querySelectorAll('[role="tab"]'));
  const panels = Array.from(hero.querySelectorAll('[role="tabpanel"]'));
  const pauseBtn = hero.querySelector('[data-hero-pause]');
  const themeRing = hero.querySelector('[data-theme-ring]');
  const themeBadge = hero.querySelector('[data-theme-name]');
  if (!tabs.length || panels.length !== tabs.length) return;

  const THEMES = [
    { name: 'Obsidian', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.24)' },
    { name: 'Sakura', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.24)' },
    { name: 'Dark', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.22)' },
    { name: 'Light', color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.24)' },
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = panels.length;
  let active = 0;
  let themeIndex = 0;
  let userPaused = false;
  let hovered = false;
  let focused = false;
  let timer = null;
  let dotTimer = null;

  function applyThemeAccent(idx) {
    themeIndex = ((idx % THEMES.length) + THEMES.length) % THEMES.length;
    const t = THEMES[themeIndex];
    hero.style.setProperty('--hero-theme-color', t.color);
    hero.style.setProperty('--hero-accent-glow', t.glow);
    hero.dataset.themeStep = String(themeIndex);
    if (themeRing) themeRing.dataset.quad = String(themeIndex);
    if (themeBadge) themeBadge.textContent = t.name;
  }

  function render(index, opts = {}) {
    active = ((index % total) + total) % total;
    hero.dataset.activeSlide = String(active);

    tabs.forEach((tab, i) => {
      const selected = i === active;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      if (selected && opts.scrollTab) {
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });

    panels.forEach((panel, i) => {
      const pos = (i - active + total) % total;
      panel.dataset.pos = String(pos);
      if (pos === 0) {
        panel.removeAttribute('aria-hidden');
        panel.removeAttribute('inert');
      } else {
        panel.setAttribute('aria-hidden', 'true');
        if (pos > 1) panel.setAttribute('inert', '');
        else panel.removeAttribute('inert');
      }
    });

    applyThemeAccent(active === 3 ? themeIndex : active);
  }

  function isPaused() {
    return userPaused || hovered || focused || reducedMotion.matches || document.hidden;
  }

  function syncPauseButton() {
    if (!pauseBtn) return;
    const paused = userPaused || reducedMotion.matches;
    const label = paused ? pauseBtn.dataset.labelPlay : pauseBtn.dataset.labelPause;
    if (label) {
      pauseBtn.setAttribute('aria-label', label);
      pauseBtn.setAttribute('title', label);
    }
    pauseBtn.dataset.state = paused ? 'paused' : 'playing';
  }

  function stopTimers() {
    if (timer) { clearInterval(timer); timer = null; }
    if (dotTimer) { clearInterval(dotTimer); dotTimer = null; }
  }

  function startTimers() {
    stopTimers();
    if (isPaused()) return;
    timer = window.setInterval(() => {
      if (active === 3) {
        themeIndex = (themeIndex + 1) % THEMES.length;
      }
      render(active + 1);
    }, 4000);
    dotTimer = window.setInterval(() => {
      applyThemeAccent(themeIndex + 1);
    }, 2400);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (i === 3 && active === 3) {
        applyThemeAccent(themeIndex + 1);
      } else {
        if (i === 3) themeIndex = (themeIndex + 1) % THEMES.length;
        render(i, { scrollTab: true });
      }
      startTimers();
    });

    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % total;
      else if (e.key === 'ArrowLeft') next = (i - 1 + total) % total;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = total - 1;
      if (next === null) return;
      e.preventDefault();
      tabs[next].focus();
      render(next, { scrollTab: true });
      startTimers();
    });
  });

  panels.forEach((panel, i) => {
    panel.addEventListener('click', () => {
      if (panel.dataset.pos === '1') {
        render(i, { scrollTab: true });
        startTimers();
      }
    });
  });

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPauseButton();
      if (userPaused) stopTimers();
      else startTimers();
    });
  }

  // Scope hover and keyboard-focus pause strictly to interactive showcase controls
  const interactiveTargets = [deck, tablist].filter(Boolean);
  const hoveredTargets = new Set();
  interactiveTargets.forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      hoveredTargets.add(el);
      hovered = true;
      stopTimers();
    });
    el.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      hoveredTargets.delete(el);
      hovered = hoveredTargets.size > 0;
      if (!hovered) startTimers();
    });
    el.addEventListener('focusin', (e) => {
      if (e.target && typeof e.target.matches === 'function' && e.target.matches(':focus-visible')) {
        focused = true;
        stopTimers();
      }
    });
    el.addEventListener('focusout', (e) => {
      const stillFocused = interactiveTargets.some((target) => target.contains(e.relatedTarget));
      if (!stillFocused) {
        focused = false;
        startTimers();
      }
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimers();
    else startTimers();
  });
  reducedMotion.addEventListener?.('change', () => {
    syncPauseButton();
    if (reducedMotion.matches) stopTimers();
    else startTimers();
  });

  // Expose minimal read/select helper for deterministic Playwright capture & testing
  hero.__graphiteHero = {
    select: (slideIdx, themeIdx) => {
      stopTimers();
      userPaused = true;
      syncPauseButton();
      if (typeof themeIdx === 'number') applyThemeAccent(themeIdx);
      render(slideIdx);
    },
    setTheme: (themeIdx) => applyThemeAccent(themeIdx),
    getState: () => ({ active, themeIndex, paused: isPaused() }),
  };

  render(0);
  syncPauseButton();
  startTimers();
})();
