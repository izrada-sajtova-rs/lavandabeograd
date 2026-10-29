// Slika se učitava normalno, bez animacije. Oko 3,5 s posle učitavanja stranice preuzima se
// GPU animacija: vezica se razleti u latice, pa se ponovo sklopi.
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

  let timer = 0, cancelled = false, requested = false;

  function cancel() {
    if (requested) return; // Kad animacija krene, ona sama reaguje na skrol.
    cancelled = true;
    clearTimeout(timer);
  }

  function load() {
    if (cancelled || requested) return;
    const rect = stage.getBoundingClientRect();
    if (document.hidden || motion.matches || window.scrollY > 80 ||
        rect.bottom <= 0 || rect.top >= window.innerHeight) {
      cancel();
      return;
    }
    requested = true;
    stage.classList.add('is-pending');
    const script = document.createElement('script');
    script.src = 'js/hero-lavender.js?v=20261029-burst1';
    script.async = true;
    script.onerror = () => stage.classList.remove('is-pending');
    document.body.append(script);
  }

  function schedule() {
    if (cancelled) return;
    timer = setTimeout(() => {
      // Sačeka i slobodan trenutak pregledača, da ne smeta drugim poslovima.
      if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1000 });
      else load();
    }, 3500);
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  window.addEventListener('scroll', () => { if (window.scrollY > 80) cancel(); }, { passive: true });
  motion.addEventListener('change', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
})();
