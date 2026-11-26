(() => {
  const modes = {
    agents: { yaw: '-17deg', pitch: '12deg', project: 'mcptape' },
    systems: { yaw: '24deg', pitch: '7deg', project: 'shellparity' },
    language: { yaw: '-8deg', pitch: '-17deg', project: 'paknevis' }
  };
  const section = document.querySelector('.studio-entry');
  if (!section) return;
  const scene = section.querySelector('.studio-scene');
  const mark = scene.querySelector('.studio-emblem');
  const launch = section.querySelector('.studio-launch');
  const buttons = [...section.querySelectorAll('[data-studio-mode]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame;

  function updateLink() {
    const language = document.documentElement.lang === 'fa' ? 'fa' : 'en';
    launch.href = '/playground/?project=' + modes[section.dataset.mode].project + '&lang=' + language;
  }

  function applyPreset() {
    const preset = modes[section.dataset.mode];
    mark.style.setProperty('--yaw', preset.yaw);
    mark.style.setProperty('--pitch', preset.pitch);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      section.dataset.mode = button.dataset.studioMode;
      buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      applyPreset();
      updateLink();
      scene.classList.remove('is-pulsing');
      if (!reduced.matches) {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(() => {
          animationFrame = requestAnimationFrame(() => scene.classList.add('is-pulsing'));
        });
      }
    });
  }

  scene.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    mark.classList.add('is-tracking');
    mark.style.setProperty('--yaw', (x * 62) + 'deg');
    mark.style.setProperty('--pitch', (-y * 50) + 'deg');
  });
  scene.addEventListener('pointerleave', () => {
    mark.classList.remove('is-tracking');
    applyPreset();
  });
  new MutationObserver(updateLink).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang'] });
  updateLink();
})();
