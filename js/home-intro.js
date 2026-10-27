// Miran ulazak elemenata pocetne strane, uskladjen sa sklapanjem lavande.
(() => {
  const hero = document.getElementById('pocetna');
  if (!hero) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  let introStarted = false;
  let timer;
  function intro() {
    if (introStarted) return;
    introStarted = true;
    const run = () => {
      if (motion.matches || document.hidden || window.scrollY > 80) return;
      // Podela po recima cuva normalno prelamanje; slova ostaju u svom konacnom rasporedu.
      const letterGroups = [];
      for (const selector of ['.hero-title', '.hero-text']) {
        const element = document.querySelector(selector);
        if (!element || !element.animate) continue;
        const text = element.textContent.trim().replace(/\s+/g, ' ');
        const readable = document.createElement('span');
        readable.className = 'intro-readable';
        readable.textContent = text;
        const visual = document.createElement('span');
        visual.setAttribute('aria-hidden', 'true');
        const letters = [];
        const words = text.split(' ');
        const total = Array.from(text.replace(/ /g, '')).length;
        let index = 0;
        words.forEach((word, wordIndex) => {
          if (wordIndex) visual.append(document.createTextNode(' '));
          const wrapper = document.createElement('span');
          wrapper.className = 'intro-word';
          for (const character of Array.from(word)) {
            const letter = document.createElement('span');
            letter.className = 'intro-letter';
            letter.textContent = character;
            if (selector === '.hero-title') {
              const blend = Math.max(0, (index / Math.max(1, total - 1) - 0.69) / 0.31);
              letter.style.color = `rgb(${Math.round(76 + 97 * blend)}, ${Math.round(29 * (1 - blend))}, ${Math.round(149 + 84 * blend)})`;
            }
            wrapper.append(letter);
            letters.push(letter);
            index++;
          }
          visual.append(wrapper);
        });
        element.replaceChildren(readable, visual);
        letterGroups.push({ letters, title: selector === '.hero-title' });
      }
      // Sva merenja nakon izgradnje teksta, pre pokretanja animacija.
      const flights = letterGroups.flatMap(group => group.letters.map((letter, i) => {
        const rect = letter.getBoundingClientRect();
        const side = i % 4;
        const spread = ((i * 37) % 121) - 60;
        let x = spread, y = spread;
        if (side === 0) x = -rect.right - 50;
        if (side === 1) x = window.innerWidth - rect.left + 50;
        if (side === 2) y = -rect.bottom - 50;
        if (side === 3) y = window.innerHeight - rect.top + 50;
        return { letter, x, y, rotation: ((i * 29) % 91) - 45,
          delay: ((group.title ? 100 : 380) + ((i * 47) % 850)) * 0.8,
          duration: group.title ? 1840 : 2000 };
      }));
      for (const flight of flights) {
        animations.push(flight.letter.animate([
          { transform: `translate(${flight.x}px, ${flight.y}px) rotate(${flight.rotation}deg)` },
          { transform: 'translate(0, 0) rotate(0deg)' },
        ], { duration: flight.duration, delay: flight.delay,
          easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }));
      }
      const items = [
        ['.header-container', -90, 0, 950],
        ['.music-player', 90, 650, 1100],
      ];
      for (const [selector, distance, delay, duration] of items) {
        const element = document.querySelector(selector);
        if (!element || !element.animate) continue;
        animations.push(element.animate([
          { transform: `translateY(${distance}px)` },
          { transform: 'translateY(0)' },
        ], { duration, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }));
      }
      const button = document.querySelector('.hero-content > .btn');
      if (button && button.animate) {
        const bounds = button.getBoundingClientRect();
        animations.push(button.animate([
          { transform: `translateX(${-bounds.right - 48}px) rotate(-5deg)` },
          { transform: 'translateX(0) rotate(0deg)' },
        ], { duration: 1400, delay: 1900,
          easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }));
      }
    };
    run();
  }
  function stopIntro() {
    clearTimeout(timer);
    animations.forEach(animation => animation.cancel());
  }
  if (document.readyState === 'complete') intro();
  else window.addEventListener('load', intro, { once: true });
  motion.addEventListener('change', stopIntro);
  window.addEventListener('scroll', stopIntro, { passive: true, once: true });

  const call = document.querySelector('.call-after-hero');
  const nextSection = document.getElementById('o-nama');
  const header = document.querySelector('.sticky-header');
  if (!call || !nextSection) return;
  let frame = 0;
  function updateCall() {
    frame = 0;
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const visible = nextSection.getBoundingClientRect().top <= headerBottom + 1;
    call.classList.toggle('is-visible', visible);
    call.inert = !visible;
    if (visible) call.removeAttribute('aria-hidden');
    else call.setAttribute('aria-hidden', 'true');
  }
  function scheduleCall() {
    if (!frame) frame = requestAnimationFrame(updateCall);
  }
  updateCall();
  window.addEventListener('scroll', scheduleCall, { passive: true });
  window.addEventListener('resize', scheduleCall, { passive: true });
  window.addEventListener('pageshow', scheduleCall);
  window.addEventListener('load', scheduleCall, { once: true });
})();
