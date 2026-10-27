// Preuzimanje i inicijalizacija GPU animacije tek tri sekunde nakon load dogadjaja.
(() => {
  const stage = document.querySelector('.hero-lavender');
  const photo = stage && stage.querySelector('.hero-lavender-base');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !photo || motion.matches) return;
  let timer = 0, watchdog = 0, requested = false, cancelled = false;
  stage.classList.add('is-pending');
  function revealPhoto() {
    stage.classList.remove('is-pending', 'is-forming');
    photo.style.visibility = '';
  }
  function cancel() {
    if (stage.classList.contains('is-forming')) return;
    cancelled = true;
    clearTimeout(timer);
    clearTimeout(watchdog);
    revealPhoto();
  }
  function load() {
    if (cancelled || requested) return;
    const rect = stage.getBoundingClientRect();
    if (document.hidden || motion.matches || rect.bottom <= 0 || rect.top >= window.innerHeight) {
      cancel(); return;
    }
    requested = true;
    const script = document.createElement('script');
    script.src = 'js/hero-lavender.js?v=20261027-perf2';
    script.async = true;
    script.onerror = cancel;
    script.onload = () => {
      clearTimeout(watchdog);
      if (!stage.classList.contains('is-forming')) revealPhoto();
    };
    watchdog = setTimeout(cancel, 8000);
    document.body.append(script);
  }
  function schedule() {
    if (!cancelled) timer = setTimeout(load, 3000);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  window.addEventListener('scroll', cancel, { passive: true, once: true });
  motion.addEventListener('change', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
})();
