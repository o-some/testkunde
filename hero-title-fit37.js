(() => {
  'use strict';
  const heading = document.querySelector('.hero h1');
  if (!heading) return;
  const lines = [...heading.querySelectorAll('.hero-title-line')];
  if (!lines.length) return;
  let queued = false;
  let previousWidth = 0;
  const fit = () => {
    queued = false;
    heading.style.removeProperty('--hero-title-fit');
    const available = heading.clientWidth;
    const widest = Math.max(...lines.map(line => line.getBoundingClientRect().width));
    const base = parseFloat(getComputedStyle(heading).fontSize);
    // Reserve a little space for italic glyphs extending beyond their advance width.
    if (available > 0 && widest > available - 8) {
      heading.style.setProperty('--hero-title-fit', `${base * (available - 8) / widest}px`);
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fit);
  };
  fit();
  document.fonts.ready.then(schedule);
  document.fonts.addEventListener('loadingdone', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  const observer = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - previousWidth) > .5) {
      previousWidth = width;
      schedule();
    }
  });
  observer.observe(heading);
})();
