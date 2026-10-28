// Preuzimanje GPU animacije odmah; slika ostaje vidljiva kao bleda silueta dok se vezica sklapa.
(() => {
  const stage = document.querySelector('.hero-lavender');
  const photo = stage && stage.querySelector('.hero-lavender-base');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !photo || motion.matches) return;

  // Slabi uređaji i ušteda podataka: bez animacije, samo slika.
  const connection = navigator.connection || {};
  const weakDevice = connection.saveData === true ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (weakDevice) return;

  let watchdog = 0, cancelled = false;
  stage.classList.add('is-pending');

  function cancel() {
    if (cancelled || stage.classList.contains('is-forming')) return;
    cancelled = true;
    clearTimeout(watchdog);
    stage.classList.remove('is-pending', 'is-forming');
  }

  const rect = stage.getBoundingClientRect();
  if (document.hidden || rect.bottom <= 0 || rect.top >= window.innerHeight) {
    cancel();
    return;
  }

  const script = document.createElement('script');
  script.src = 'js/hero-lavender.js?v=20261028-speed2';
  script.async = true;
  script.onerror = cancel;
  // Ako se animacija ne pokrene na vreme (spora mreža), prikazuje se obična slika.
  watchdog = setTimeout(cancel, 6000);
  document.body.append(script);

  window.addEventListener('scroll', cancel, { passive: true, once: true });
  motion.addEventListener('change', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
})();
