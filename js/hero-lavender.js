// Jedan GPU poziv po kadru umesto hiljada canvas clip/drawImage operacija.
(() => {
  const photo = document.querySelector('.hero-lavender-base');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!photo || motion.matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-lavender-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false,
    depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return; // Obicna fotografija ostaje vidljiva bez GPU podrske.
  document.body.append(canvas);
  canvas.hidden = true;
  photo.style.visibility = 'hidden';
  let frame = 0, done = false, started = false;
  let program, buffer, texture;
  const shaders = [];
  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    photo.style.visibility = '';
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    canvas.remove();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }
  function shader(type, source) {
    const result = gl.createShader(type);
    shaders.push(result);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
    return result;
  }
  function start() {
    if (done || started) return;
    started = true;
    const bounds = photo.getBoundingClientRect();
    if (motion.matches || document.hidden || !photo.complete || !photo.naturalWidth ||
        !bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
      finish(); return;
    }
    try {
      const vw = window.innerWidth, vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, vw < 768 ? 1.25 : 1.5);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      program = gl.createProgram();
      const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision ? 'highp' : 'mediump';
      gl.attachShader(program, shader(gl.VERTEX_SHADER, `
        precision highp float;
        attribute vec2 aCorner, aTarget, aStart, aControl0, aControl1, aTiming;
        uniform vec2 uViewport, uRadius;
        uniform vec4 uBounds;
        uniform float uProgress;
        varying ${precision} vec2 vCorner, vUV;
        void main() {
          float p = clamp((uProgress - aTiming.x) / 0.76, 0.0, 1.0);
          float t = p * p * (3.0 - 2.0 * p);
          float u = 1.0 - t;
          vec2 center = u*u*u*aStart + 3.0*u*u*t*aControl0 + 3.0*u*t*t*aControl1 + t*t*t*aTarget;
          float angle = aTiming.y * u;
          float size = 1.0 + sin(t * 3.14159265359) * 0.45;
          vec2 local = aCorner * uRadius;
          vec2 rotated = vec2(cos(angle)*local.x - sin(angle)*local.y,
                              sin(angle)*local.x + cos(angle)*local.y) * size;
          vec2 point = (center + rotated) / uViewport;
          gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
          vCorner = aCorner;
          vUV = (aTarget - uBounds.xy + local) / uBounds.zw;
        }
      `));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
        precision ${precision} float;
        uniform sampler2D uImage;
        varying ${precision} vec2 vCorner, vUV;
        void main() {
          float edge = 0.8 * (1.0 - vCorner.x * vCorner.x) - abs(vCorner.y);
          if (edge < 0.0 || min(vUV.x, vUV.y) < 0.0 || max(vUV.x, vUV.y) > 1.0) discard;
          vec4 color = texture2D(uImage, vUV);
          vec2 mask = clamp(vUV / 0.04, 0.0, 1.0) * clamp((1.0 - vUV) / 0.04, 0.0, 1.0);
          float alpha = color.a * mask.x * mask.y * smoothstep(0.0, 0.055, edge);
          gl_FragColor = vec4(color.rgb * alpha, alpha);
        }
      `));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
      gl.useProgram(program);
      const cols = 96, rows = 54;
      const cellW = bounds.width / cols, cellH = bounds.height / rows;
      const rx = cellW * 1.35, ry = cellH * 1.35;
      const cells = atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAD8PgAAAAAAAAAAAAD8//8AAAAMAAAAAAD8//8/AMAcwAAAAADg/v//AOAfwAMAgAMA/v//APAfgP8BwD8M/P//A3Af8P8DgP99/v//P3Ae+P8DAP///////+Oe//8DANj///////////8HAMD///////////8PAMD///////////8PAMD9//////////8HQAD8//////////8P4C/+//////////8f4P////////////8fwP////////////8fgP////////////8fgP////////////8fgP////////////8f4P////////////8f8P////////////8f4P////////////8fAO////////////8fAOD///////////8PAOD///////////8HAPj///////////8BAP7///////////8AAP////////////8AgP///////////z8AgP//////////DwAAgP//////////AQAAgP////////+/AQAAAPz///////8PAAAAAP7///////8DAAAAAPj///////8AAAAAAPj//////38AAAAAAPj//////w8AAAAAAMD//////wAAAAAAAADH////DwAAAAAAAACA////BwAAAAAAAAAA/v/DAAAAAAAAAAAA8P8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      const pieces = [];
      let seed = 7381;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const margin = Math.max(rx, ry) * 5 + 40;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          if (!(cells.charCodeAt(index >> 3) & (1 << (index & 7)))) continue;
          const tx = bounds.left + (col + 0.5) * cellW;
          const ty = bounds.top + (row + 0.5) * cellH;
          const side = Math.floor(random() * 4);
          let sx, sy;
          if (side === 0) { sx = -margin; sy = random() * vh; }
          else if (side === 1) { sx = vw + margin; sy = random() * vh; }
          else if (side === 2) { sx = random() * vw; sy = -margin; }
          else { sx = random() * vw; sy = vh + margin; }
          const sign = row < rows / 2 ? -1 : 1;
          pieces.push([tx, ty, sx, sy,
            sx + (tx - sx) * 0.25 + (random() - 0.5) * bounds.width,
            sy + sign * bounds.height * (0.5 + random()),
            tx + bounds.width * (0.2 + random() * 0.5),
            ty - sign * bounds.height * (0.5 + random()),
            col / cols * 0.16 + random() * 0.08,
            (random() - 0.5) * Math.PI * 4]);
        }
      }
      const corners = [-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1];
      const vertices = new Float32Array(pieces.length * 6 * 12);
      let offset = 0;
      for (const piece of pieces) {
        for (let i = 0; i < 12; i += 2) {
          vertices[offset++] = corners[i];
          vertices[offset++] = corners[i + 1];
          for (const value of piece) vertices[offset++] = value;
        }
      }
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      ['aCorner','aTarget','aStart','aControl0','aControl1','aTiming'].forEach((name, i) => {
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 48, i * 8);
      });
      texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photo);
      gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
      gl.uniform2f(gl.getUniformLocation(program, 'uViewport'), vw, vh);
      gl.uniform2f(gl.getUniformLocation(program, 'uRadius'), rx, ry);
      gl.uniform4f(gl.getUniformLocation(program, 'uBounds'), bounds.left, bounds.top, bounds.width, bounds.height);
      const progressLocation = gl.getUniformLocation(program, 'uProgress');
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      canvas.hidden = false;
      const duration = 4600;
      let began, previous = -Infinity;
      function draw(now) {
        if (done) return;
        if (began === undefined) began = now;
        const progress = Math.min(1, (now - began) / duration);
        // 30 fps je dovoljno za blag pokret, uz prepolovljen broj GPU kadrova.
        if (now - previous >= 32 || progress === 1) {
          previous = now;
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(progressLocation, progress);
          gl.drawArrays(gl.TRIANGLES, 0, pieces.length * 6);
        }
        if (progress >= 1) frame = requestAnimationFrame(finish);
        else frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    } catch {
      finish(); // Ako GPU ili tekstura nisu dostupni, prikazi JPG odmah.
    }
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  window.addEventListener('resize', finish, { passive: true });
  window.addEventListener('scroll', finish, { passive: true });
  motion.addEventListener('change', finish);
  canvas.addEventListener('webglcontextlost', finish);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
})();
