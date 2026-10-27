// Jednokratno sklapanje cele JPG fotografije iz teksturisanih latica.
(() => {
  const stage = document.querySelector('.hero-lavender');
  if (!stage) return;
  const photo = stage.querySelector('.hero-lavender-base');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!photo || motion.matches || typeof Path2D === 'undefined') return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.className = 'hero-lavender-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  document.body.append(canvas);
  photo.style.visibility = 'hidden';
  let timer = 0, frame = 0, done = false, scheduled = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = t => t * t * (3 - 2 * t);
  const duration = 4600;
  function finish() {
    done = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    photo.style.visibility = '';
    canvas.remove();
  }
  function start() {
    if (done) return;
    const bounds = photo.getBoundingClientRect();
    if (motion.matches || document.hidden || !photo.complete || !photo.naturalWidth ||
        !bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
      finish();
      return;
    }
    try {
      const vw = window.innerWidth, vh = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      // CSS procenat moze iskljuciti sirinu scrollbara, dok innerWidth ukljucuje tu sirinu.
      // Zato platno ima iste eksplicitne dimenzije kao koordinatni prostor fotografije.
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const pixelScaleX = canvas.width / vw;
      const pixelScaleY = canvas.height / vh;
      // Ista meka ivica kao na JPG elementu, da zavrsna zamena ne napravi skok.
      const texture = document.createElement('canvas');
      texture.width = photo.naturalWidth;
      texture.height = photo.naturalHeight;
      const textureCtx = texture.getContext('2d');
      if (!textureCtx) { finish(); return; }
      textureCtx.drawImage(photo, 0, 0);
      textureCtx.globalCompositeOperation = 'destination-in';
      for (const [x, y] of [[texture.width, 0], [0, texture.height]]) {
        const gradient = textureCtx.createLinearGradient(0, 0, x, y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.04, '#000');
        gradient.addColorStop(0.96, '#000');
        gradient.addColorStop(1, 'transparent');
        textureCtx.fillStyle = gradient;
        textureCtx.fillRect(0, 0, texture.width, texture.height);
      }
      const cols = 96, rows = 54;
      const cellW = bounds.width / cols, cellH = bounds.height / rows;
      // Preklapajuce latice na kraju pokriju svaki piksel, bez rupa izmedju njih.
      const rx = cellW * 1.35, ry = cellH * 1.35;
      const shape = new Path2D();
      shape.moveTo(-rx, 0);
      shape.quadraticCurveTo(0, -ry * 1.6, rx, 0);
      shape.quadraticCurveTo(0, ry * 1.6, -rx, 0);
      shape.closePath();
      // Mapa JPG uzoraka ukljucuje biljku i meku senku; preskace cistu belu pozadinu.
      const plantCells = atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAD8PgAAAAAAAAAAAAD8//8AAAAMAAAAAAD8//8/AMAcwAAAAADg/v//AOAfwAMAgAMA/v//APAfgP8BwD8M/P//A3Af8P8DgP99/v//P3Ae+P8DAP///////+Oe//8DANj///////////8HAMD///////////8PAMD///////////8PAMD9//////////8HQAD8//////////8P4C/+//////////8f4P////////////8fwP////////////8fgP////////////8fgP////////////8fgP////////////8f4P////////////8f8P////////////8f4P////////////8fAO////////////8fAOD///////////8PAOD///////////8HAPj///////////8BAP7///////////8AAP////////////8AgP///////////z8AgP//////////DwAAgP//////////AQAAgP////////+/AQAAAPz///////8PAAAAAP7///////8DAAAAAPj///////8AAAAAAPj//////38AAAAAAPj//////w8AAAAAAMD//////wAAAAAAAADH////DwAAAAAAAACA////BwAAAAAAAAAA/v/DAAAAAAAAAAAA8P8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      const pieces = [];
      let seed = 7381;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const margin = Math.max(rx, ry) * 5 + 40;
      const sourceX = photo.naturalWidth / bounds.width;
      const sourceY = photo.naturalHeight / bounds.height;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          if (!(plantCells.charCodeAt(index >> 3) & (1 << (index & 7)))) continue;
          const cx = (col + 0.5) * cellW, cy = (row + 0.5) * cellH;
          const targetX = bounds.left + cx, targetY = bounds.top + cy;
          const side = Math.floor(random() * 4);
          let sx, sy;
          if (side === 0) { sx = -margin; sy = random() * vh; }
          else if (side === 1) { sx = vw + margin; sy = random() * vh; }
          else if (side === 2) { sx = random() * vw; sy = -margin; }
          else { sx = random() * vw; sy = vh + margin; }
          const sign = row < rows / 2 ? -1 : 1;
          const left = Math.max(0, cx - rx), top = Math.max(0, cy - ry);
          const right = Math.min(bounds.width, cx + rx), bottom = Math.min(bounds.height, cy + ry);
          pieces.push({ targetX, targetY, sx, sy,
            ax: sx + (targetX - sx) * 0.25 + (random() - 0.5) * bounds.width,
            ay: sy + sign * bounds.height * (0.5 + random()),
            bx: targetX + bounds.width * (0.2 + random() * 0.5),
            by: targetY - sign * bounds.height * (0.5 + random()),
            delay: col / cols * 0.16 + random() * 0.08,
            spin: (random() - 0.5) * Math.PI * 4,
            source: [left * sourceX, top * sourceY, (right - left) * sourceX, (bottom - top) * sourceY],
            destination: [left - cx, top - cy, right - left, bottom - top] });
        }
      }
      canvas.hidden = false;
      let began;
      function draw(now) {
        if (done) return;
        if (began === undefined) began = now;
        const progress = clamp((now - began) / duration);
        ctx.setTransform(pixelScaleX, 0, 0, pixelScaleY, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
        try {
          for (const p of pieces) {
            const t = ease(clamp((progress - p.delay) / 0.76));
            const u = 1 - t;
            const x = u ** 3 * p.sx + 3 * u * u * t * p.ax + 3 * u * t * t * p.bx + t ** 3 * p.targetX;
            const y = u ** 3 * p.sy + 3 * u * u * t * p.ay + 3 * u * t * t * p.by + t ** 3 * p.targetY;
            const angle = p.spin * u;
            const scale = t === 1 ? 1 : 1 + Math.sin(t * Math.PI) * 0.45;
            const cos = Math.cos(angle) * scale, sin = Math.sin(angle) * scale;
            ctx.save();
            ctx.setTransform(pixelScaleX * cos, pixelScaleY * sin,
              -pixelScaleX * sin, pixelScaleY * cos, pixelScaleX * x, pixelScaleY * y);
            ctx.clip(shape);
            // Svaka latica nosi pravi komadic fotografije, ukljucujuci zelene stabljike.
            ctx.drawImage(texture, ...p.source, ...p.destination);
            ctx.restore();
          }
        } catch {
          ctx.restore();
          finish();
          return;
        }
        // Prvo nacrtaj potpuno sklopljen kadar, pa tek u sledecem kadru zameni platno JPG-om.
        if (progress >= 1) frame = requestAnimationFrame(finish);
        else frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    } catch {
      finish();
    }
  }
  function schedule() {
    if (done || scheduled) return;
    scheduled = true;
    start();
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  window.addEventListener('resize', finish, { passive: true });
  window.addEventListener('scroll', finish, { passive: true });
  motion.addEventListener('change', finish);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
})();
