/* =========================================================
   ASIA PISCINAS — Interacciones
   Sin dependencias. Cada módulo se inicializa por separado.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = 'https://wa.me/51981475523?text=';

  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[' + name + ']', e); } };

  /* ---------- Loader ---------- */
  safe('loader', () => {
    const loader = $('.loader');
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      loader && loader.classList.add('is-done');
      root.classList.add('is-ready');
    };
    const minTime = reduced ? 0 : 1300;
    const start = performance.now();
    const go = () => setTimeout(finish, Math.max(0, minTime - (performance.now() - start)));
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
    setTimeout(finish, 3200); // nunca bloquear más de 3.2s
  });

  /* ---------- Año ---------- */
  safe('year', () => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); });

  /* ---------- Header + menú ---------- */
  safe('header', () => {
    const header = $('.header');
    const burger = $('.burger');
    const menu = $('#mobileMenu');
    let lastY = scrollY;

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    window.addEventListener('scroll', () => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      const menuOpen = document.body.classList.contains('menu-open');
      if (!menuOpen) header.classList.toggle('is-hidden', y > lastY && y > 400);
      lastY = y;
    }, { passive: true });

    // Enlace activo
    const links = $$('.nav a');
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove('is-active'));
          const l = map.get(en.target.id); if (l) l.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  });

  /* ---------- Scroll suave para anclas ---------- */
  safe('anchors', () => {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + scrollY - (id === '#inicio' ? 0 : 84);
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  });

  /* ---------- Cursor burbuja ---------- */
  const cursor = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, el: $('.cursor') };
  safe('cursor', () => {
    if (!finePointer || !cursor.el) return;
    const label = $('.cursor__label', cursor.el);
    window.addEventListener('pointermove', e => {
      cursor.tx = e.clientX; cursor.ty = e.clientY;
      cursor.el.classList.add('is-visible');
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.el.classList.remove('is-visible'));
    window.addEventListener('pointerdown', () => cursor.el.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.el.classList.remove('is-down'));

    document.addEventListener('pointerover', e => {
      const withLabel = e.target.closest('[data-cursor]');
      const interactive = e.target.closest('a, button, label, input, select, textarea, summary');
      if (withLabel && !(interactive && withLabel.contains(interactive) && interactive !== withLabel && interactive.matches('a, button'))) {
        label.textContent = withLabel.dataset.cursor;
        cursor.el.classList.add('has-label'); cursor.el.classList.remove('is-hover');
      } else {
        cursor.el.classList.remove('has-label');
        cursor.el.classList.toggle('is-hover', !!interactive);
      }
    });
  });

  /* ---------- Botones magnéticos ---------- */
  safe('magnetic', () => {
    if (!finePointer || reduced) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', ((x - r.width / 2) * 0.25).toFixed(1) + 'px');
        el.style.setProperty('--my', ((y - r.height / 2) * 0.35).toFixed(1) + 'px');
        el.style.setProperty('--hx', x + 'px');
        el.style.setProperty('--hy', y + 'px');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    });
  });

  /* ---------- Tarjetas con inclinación 3D ---------- */
  safe('tilt', () => {
    if (!finePointer || reduced) return;
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - .5) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 8).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  });

  /* ---------- Reveal + contadores ---------- */
  safe('reveal', () => {
    const items = $$('.reveal');
    // escalonado por grupo de hermanos
    const groups = new Map();
    items.forEach(el => {
      const p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach(list => list.forEach((el, i) => { el.style.transitionDelay = Math.min(i * 80, 400) + 'ms'; }));

    if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
        // limpiar el retraso para que hover/tilt respondan al instante
        setTimeout(() => { en.target.style.transitionDelay = ''; }, 1600);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => io.observe(el));

    // Contadores
    const counters = $$('[data-count]');
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target;
        const target = +el.dataset.count;
        const plain = el.hasAttribute('data-plain');
        const from = plain ? target - 40 : 0;
        const dur = reduced ? 1 : 1800;
        const t0 = performance.now();
        const step = now => {
          const t = clamp((now - t0) / dur, 0, 1);
          const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = Math.round(from + (target - from) * e);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    counters.forEach(c => cio.observe(c));
  });

  /* ---------- Burbujas ---------- */
  safe('bubbles', () => {
    if (reduced) return;
    $$('.bubbles').forEach(box => {
      const n = innerWidth < 700 ? 8 : 16;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('span');
        b.className = 'bubble';
        const s = 6 + Math.random() * 26;
        b.style.width = b.style.height = s + 'px';
        b.style.left = (Math.random() * 100) + '%';
        b.style.animationDuration = (10 + Math.random() * 16) + 's';
        b.style.animationDelay = (-Math.random() * 20) + 's';
        b.style.setProperty('--sway', ((Math.random() - .5) * 80) + 'px');
        box.appendChild(b);
      }
    });
  });

  /* ---------- HERO: simulación de ondas sobre la foto ---------- */
  safe('ripple', () => {
    const canvas = $('.hero__water');
    const img = $('.hero__img');
    const hero = $('.hero');
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const src = document.createElement('canvas');
    const sctx = src.getContext('2d', { willReadFrequently: true });

    let w = 0, h = 0, scale = 1, cur, prev, texture, output, visible = true, ready = false, lastAmbient = 0;

    const setup = () => {
      const r = hero.getBoundingClientRect();
      const maxW = innerWidth < 700 ? 420 : 760;
      scale = Math.min(1, maxW / r.width);
      w = Math.max(4, Math.round(r.width * scale));
      h = Math.max(4, Math.round(r.height * scale));
      canvas.width = src.width = w;
      canvas.height = src.height = h;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(w / iw, h / ih);
      const dw = iw * s, dh = ih * s;
      output = ctx.createImageData(w, h);
      try {
        // Modo refracción: necesita leer los píxeles de la foto (requiere servir por http/https)
        sctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        texture = sctx.getImageData(0, 0, w, h).data;
        output.data.set(texture); // bordes = textura (sin huecos)
      } catch (_) {
        // Abierto como archivo local: el navegador bloquea la lectura → modo solo brillos
        texture = null;
      }
      cur = new Int16Array(w * h);
      prev = new Int16Array(w * h);
      ready = true;
    };

    const drop = (x, y, radius, strength) => {
      x = x | 0; y = y | 0;
      for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
          if (i * i + j * j > radius * radius) continue;
          const xx = x + i, yy = y + j;
          if (xx > 1 && xx < w - 2 && yy > 1 && yy < h - 2) cur[yy * w + xx] += strength;
        }
      }
    };

    const frame = () => {
      // propagación
      for (let y = 1; y < h - 1; y++) {
        let i = y * w + 1;
        for (let x = 1; x < w - 1; x++, i++) {
          let v = ((cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w]) >> 1) - prev[i];
          v -= v >> 5;
          prev[i] = v;
        }
      }
      const t = cur; cur = prev; prev = t;
      const out = output.data;
      if (!texture) {
        // solo brillos y sombras sobre la foto
        for (let y = 1; y < h - 1; y++) {
          let i = y * w + 1;
          for (let x = 1; x < w - 1; x++, i++) {
            const s = (cur[i - 1] - cur[i + 1]) >> 2;
            const oi = i << 2;
            const c = s > 0 ? 255 : 0;
            const a = s > 0 ? s : -s;
            out[oi] = c; out[oi + 1] = c; out[oi + 2] = c;
            out[oi + 3] = a > 140 ? 140 : a;
          }
        }
        ctx.putImageData(output, 0, 0);
        return;
      }
      // refracción
      for (let y = 1; y < h - 1; y++) {
        let i = y * w + 1;
        for (let x = 1; x < w - 1; x++, i++) {
          const dx = cur[i - 1] - cur[i + 1];
          const dy = cur[i - w] - cur[i + w];
          let sx = x + (dx >> 4), sy = y + (dy >> 4);
          if (sx < 0) sx = 0; else if (sx >= w) sx = w - 1;
          if (sy < 0) sy = 0; else if (sy >= h) sy = h - 1;
          const si = (sy * w + sx) << 2, oi = i << 2;
          const shade = dx >> 3;
          let r = texture[si] + shade, g = texture[si + 1] + shade, b = texture[si + 2] + shade;
          out[oi] = r < 0 ? 0 : r > 255 ? 255 : r;
          out[oi + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
          out[oi + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
        }
      }
      ctx.putImageData(output, 0, 0);
    };

    const loop = now => {
      if (visible && ready && !document.hidden) {
        if (now - lastAmbient > 700) {
          lastAmbient = now;
          drop(Math.random() * w, Math.random() * h, 2, 220 + Math.random() * 260);
        }
        frame();
      }
      requestAnimationFrame(loop);
    };

    const start = () => {
      setup();
      canvas.classList.add('is-on');
      requestAnimationFrame(loop);
    };
    if (img.complete && img.naturalWidth) start();
    else img.addEventListener('load', start, { once: true });

    let lastX = -1, lastY = -1;
    const onMove = (cx, cy, strength) => {
      if (!ready) return;
      const r = hero.getBoundingClientRect();
      const x = (cx - r.left) * scale, y = (cy - r.top) * scale;
      const d = Math.hypot(x - lastX, y - lastY);
      if (d < 1.5) return;
      lastX = x; lastY = y;
      drop(x, y, 3, strength);
    };
    hero.addEventListener('pointermove', e => onMove(e.clientX, e.clientY, 520), { passive: true });
    hero.addEventListener('pointerdown', e => { if (ready) { const r = hero.getBoundingClientRect(); drop((e.clientX - r.left) * scale, (e.clientY - r.top) * scale, 6, 1400); } }, { passive: true });

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (img.naturalWidth) setup(); }, 200); });
  });

  /* ---------- Tarjetas flotantes arrastrables ---------- */
  safe('draggable', () => {
    $$('.draggable').forEach(el => {
      let sx = 0, sy = 0, ox = 0, oy = 0, x = 0, y = 0, dragging = false;
      el.addEventListener('pointerdown', e => {
        dragging = true; el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        sx = e.clientX; sy = e.clientY; ox = x; oy = y;
        el.style.transition = 'none';
      });
      el.addEventListener('pointermove', e => {
        if (!dragging) return;
        const hero = el.parentElement.getBoundingClientRect();
        const base = el.getBoundingClientRect();
        let nx = ox + (e.clientX - sx), ny = oy + (e.clientY - sy);
        // limitar dentro del hero
        const left0 = base.left - x, top0 = base.top - y;
        nx = clamp(nx, hero.left - left0 + 8, hero.right - left0 - base.width - 8);
        ny = clamp(ny, hero.top - top0 + 80, hero.bottom - top0 - base.height - 8);
        x = nx; y = ny;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${clamp((e.clientX - sx) * .04, -8, 8)}deg)`;
      });
      const end = () => {
        if (!dragging) return;
        dragging = false; el.classList.remove('is-dragging');
        el.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
        el.style.transform = `translate(${x}px, ${y}px)`;
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('dblclick', () => { x = y = 0; el.style.transform = ''; });
    });
  });

  /* ---------- Ticker con velocidad de scroll ---------- */
  const tickers = [];
  safe('ticker', () => {
    $$('.ticker__row').forEach(row => {
      const track = $('.ticker__track', row);
      const state = { row, track, x: 0, w: 0, dir: +row.dataset.speed || 1 };
      const build = () => {
        $$('.ticker__track', row).slice(1).forEach(n => n.remove());
        state.w = track.getBoundingClientRect().width;
        const copies = Math.ceil((innerWidth * 2) / Math.max(1, state.w)) + 1;
        for (let i = 0; i < copies; i++) row.appendChild(track.cloneNode(true));
      };
      build();
      state.build = build;
      tickers.push(state);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => tickers.forEach(t => t.build()));
    window.addEventListener('resize', () => tickers.forEach(t => t.build()));
  });

  /* ---------- Proceso: scroll horizontal ---------- */
  const proc = { el: $('.process'), track: $('.process__track'), dist: 0, active: false };
  safe('process', () => {
    if (!proc.el) return;
    const mq = window.matchMedia('(min-width: 901px) and (min-height: 561px)');
    const dots = $$('.process__step-dot');
    proc.drop = $('.process__drop');
    proc.dots = dots;
    const measure = () => {
      proc.active = mq.matches && !reduced;
      if (!proc.active) { proc.el.style.height = ''; proc.track.style.transform = ''; return; }
      proc.dist = Math.max(0, proc.track.scrollWidth - innerWidth);
      proc.el.style.height = (innerHeight + proc.dist) + 'px';
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  });

  /* ---------- Bucle principal (cursor, ticker, parallax, proceso, profundidad) ---------- */
  safe('loop', () => {
    const parallax = $$('[data-parallax]');
    const parallaxImg = $$('[data-parallax-img]');
    const depth = $('.depth');
    const depthWater = $('.depth__water');
    const depthVal = $('.depth__value b');
    let lastScroll = scrollY, vel = 0;

    const tick = () => {
      const sy = scrollY;
      const vh = innerHeight;

      // cursor
      if (cursor.el && finePointer) {
        cursor.x = lerp(cursor.x, cursor.tx, .2);
        cursor.y = lerp(cursor.y, cursor.ty, .2);
        cursor.el.style.translate = `${cursor.x}px ${cursor.y}px`;
      }

      // velocidad de scroll
      const dv = sy - lastScroll; lastScroll = sy;
      vel = lerp(vel, dv, .12);

      // ticker
      if (!reduced) {
        tickers.forEach(t => {
          if (!t.w) return;
          t.x -= (0.6 + Math.abs(vel) * 0.45) * t.dir * (vel < -0.5 ? -1 : 1);
          if (t.x <= -t.w) t.x += t.w;
          if (t.x > 0) t.x -= t.w;
          t.row.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0) skewX(${clamp(-vel * .25, -8, 8).toFixed(2)}deg)`;
        });
      }

      // parallax
      if (!reduced) {
        parallax.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const c = r.top + r.height / 2 - vh / 2;
          el.style.translate = `0 ${(c * +el.dataset.parallax).toFixed(1)}px`;
        });
        parallaxImg.forEach(el => {
          const r = el.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const p = (r.top + r.height) / (vh + r.height); // 1 → 0
          el.style.transform = `translate3d(0, ${((p - .5) * 14).toFixed(2)}%, 0)`;
        });
      }

      // proceso horizontal
      if (proc.active) {
        const top = proc.el.offsetTop;
        const p = clamp((sy - top) / Math.max(1, proc.dist), 0, 1);
        proc.track.style.transform = `translate3d(${(-p * proc.dist).toFixed(1)}px,0,0)`;
        if (proc.drop) proc.drop.style.width = (p * 100).toFixed(2) + '%';
        const idx = p < .3 ? 0 : p < .62 ? 1 : 2;
        proc.dots.forEach((d, i) => d.classList.toggle('is-active', i <= idx));
      }

      // profundidad
      if (depth) {
        const max = document.documentElement.scrollHeight - vh;
        const p = clamp(sy / Math.max(1, max), 0, 1);
        depthWater.style.height = (p * 100).toFixed(1) + '%';
        depthVal.textContent = (p * 2.4).toFixed(2);
        depth.classList.toggle('is-visible', sy > vh * .6);
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Diseña tu piscina ---------- */
  safe('builder', () => {
    const plot = $('#plot'); if (!plot) return;
    const pool = $('#pool');
    const handle = $('#poolHandle');
    const inL = $('#inLargo'), inA = $('#inAncho'), inP = $('#inProf');
    const outL = $('#outLargo'), outA = $('#outAncho'), outP = $('#outProf');
    const rulerX = $('#rulerX'), rulerY = $('#rulerY');
    const rArea = $('#resArea'), rVol = $('#resVol'), rLit = $('#resLit'), rTime = $('#resTime'), rTimeU = $('#resTimeU');
    let ppm = 40;

    const fmt = (n, d = 1) => n.toFixed(d);
    const thousands = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const fill = input => {
      const p = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', p + '%');
    };

    const tween = (el, to, dec, fmtFn) => {
      const from = parseFloat(el.dataset.v || to);
      el.dataset.v = to;
      if (reduced) { el.textContent = fmtFn ? fmtFn(to) : to.toFixed(dec); return; }
      const t0 = performance.now();
      const run = now => {
        const t = clamp((now - t0) / 420, 0, 1);
        const v = from + (to - from) * (1 - Math.pow(1 - t, 3));
        el.textContent = fmtFn ? fmtFn(v) : v.toFixed(dec);
        if (t < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    };

    const tipo = () => ($('input[name="tipo"]:checked') || {}).value || 'Concreto';
    const extras = () => $$('input[name="extra"]:checked').map(i => i.value);

    const update = () => {
      const L = +inL.value, A = +inA.value, P = +inP.value;
      outL.textContent = fmt(L) + ' m'; outA.textContent = fmt(A) + ' m'; outP.textContent = fmt(P, 2) + ' m';
      [inL, inA, inP].forEach(fill);
      pool.style.width = (L * ppm) + 'px';
      pool.style.height = (A * ppm) + 'px';
      const pw = plot.clientWidth, ph = plot.clientHeight;
      plot.style.setProperty('--rx-w', Math.min(L * ppm, pw) + 'px');
      plot.style.setProperty('--ry-h', A * ppm + 'px');
      const rx = $('.plot__ruler--x'), ry = $('.plot__ruler--y');
      rx.style.top = Math.min(ppm * .5 + A * ppm + 14, ph - 28) + 'px';
      ry.style.left = Math.min(ppm * .5 + L * ppm + 26, pw - 64) + 'px';
      rulerX.textContent = fmt(L) + ' m';
      rulerY.textContent = fmt(A) + ' m';

      const area = L * A, vol = area * P;
      tween(rArea, area, 1);
      tween(rVol, vol, 1);
      tween(rLit, vol * 1000, 0, thousands);
      const t = tipo();
      if (t === 'Concreto') { rTime.textContent = '4–6'; rTimeU.textContent = 'semanas'; }
      else if (t === 'Fibra de vidrio') { rTime.textContent = '2–3'; rTimeU.textContent = 'semanas'; }
      else { rTime.textContent = 'A medida'; rTimeU.textContent = ''; }

      const ex = $$('input[name="extra"]');
      pool.classList.toggle('has-light', ex.some(i => i.checked && i.dataset.fx === 'light'));
      pool.classList.toggle('has-ladder', ex.some(i => i.checked && i.dataset.fx === 'ladder'));
      pool.classList.toggle('no-steps', !ex.some(i => i.checked && i.dataset.fx === 'steps'));
    };

    const measure = () => {
      ppm = plot.clientWidth / 16;
      plot.style.setProperty('--ppm', ppm + 'px');
      update();
    };

    [inL, inA, inP].forEach(i => i.addEventListener('input', update));
    $$('#builderForm input[type="radio"], #builderForm input[type="checkbox"]').forEach(i => i.addEventListener('change', update));

    // Arrastrar la esquina
    let dragging = false;
    handle.addEventListener('pointerdown', e => {
      dragging = true; handle.setPointerCapture(e.pointerId);
      pool.classList.add('is-dragging'); plot.classList.add('is-dragging');
      e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const r = plot.getBoundingClientRect();
      const L = clamp(Math.round(((e.clientX - r.left) / ppm - .5) * 2) / 2, +inL.min, +inL.max);
      const A = clamp(Math.round(((e.clientY - r.top) / ppm - .5) * 2) / 2, +inA.min, +inA.max);
      if (L !== +inL.value || A !== +inA.value) { inL.value = L; inA.value = A; update(); }
    });
    const end = () => { dragging = false; pool.classList.remove('is-dragging'); plot.classList.remove('is-dragging'); };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', e => {
      const k = e.key; let used = true;
      if (k === 'ArrowRight') inL.value = +inL.value + .5;
      else if (k === 'ArrowLeft') inL.value = +inL.value - .5;
      else if (k === 'ArrowDown') inA.value = +inA.value + .5;
      else if (k === 'ArrowUp') inA.value = +inA.value - .5;
      else used = false;
      if (used) { e.preventDefault(); update(); }
    });

    window.addEventListener('resize', measure);
    measure();

    $('#sendDesign').addEventListener('click', () => {
      const L = +inL.value, A = +inA.value, P = +inP.value;
      const ex = extras();
      const msg = [
        'Hola Asia Piscinas, diseñé mi piscina en su web:',
        '• Tipo: ' + tipo(),
        '• Medidas: ' + fmt(L) + ' m x ' + fmt(A) + ' m',
        '• Profundidad promedio: ' + fmt(P, 2) + ' m',
        '• Espejo de agua: ' + fmt(L * A) + ' m² · Volumen aprox.: ' + fmt(L * A * P) + ' m³',
        '• Extras: ' + (ex.length ? ex.join(', ') : 'ninguno'),
        'Quisiera una asesoría gratuita.'
      ].join('\n');
      window.open(WA + encodeURIComponent(msg), '_blank', 'noopener');
    });
  });

  /* ---------- Tienda: productos + carrusel con inercia ---------- */
  safe('shop', () => {
    const P = 'assets/img/productos/';
    const products = [
      { c: 'equipamiento', n: 'Electrobomba Hayward', d: 'Para piscinas, de 1 a 3 HP', i: 'equipamiento2.jpg' },
      { c: 'equipamiento', n: 'Filtro de cuarzo', d: 'De diferentes medidas', i: 'equipamiento4.jpg' },
      { c: 'quimicos', n: 'Cloro granulado', d: 'Presentación de 1 kg a 50 kg', i: 'cloro-granulado-en-asia-lima.jpg' },
      { c: 'equipamiento', n: 'Faro acuático de colores', d: 'Diferentes potencias para piscinas', i: 'faro-de-colores-en-asia.jpg' },
      { c: 'equipamiento', n: 'Escalera de acero inoxidable', d: 'A medida (diferentes pasos)', i: 'escalera-de-acero-inoxidable-para-piscinas-en-asia.jpg' },
      { c: 'quimicos', n: 'Cloro granulado HTH', d: 'Peso: 45 kg', i: 'cloro-granulado-htl-en-asia-lima-peru.jpg' },
      { c: 'equipamiento', n: 'Panel de control de iluminación', d: 'Consulta modelos disponibles', i: 'equipamiento6.jpg' },
      { c: 'quimicos', n: 'Medidor de pH y cloro', d: 'Kit de medición', i: 'quimico4.jpg' },
      { c: 'equipamiento', n: 'Faro acuático halógeno', d: 'De 100 a 340 watts', i: 'equipamiento1.jpg' },
      { c: 'quimicos', n: 'Cloro en pastilla ACL americana', d: 'Peso: 4 kg', i: 'cloro-granulado-acl-americana-en-asia-lima.jpg' },
      { c: 'equipamiento', n: 'Desnatador para piscinas', d: 'Diferentes diámetros', i: 'equipamiento5.jpg' },
      { c: 'quimicos', n: 'Cloro en pastilla', d: '5 unidades', i: 'quimico6.jpg' },
      { c: 'equipamiento', n: 'Flotador tipo OVNI', d: 'Dosificador flotante', i: 'equipamiento3.jpg' },
      { c: 'quimicos', n: 'Reductor de pH', d: 'Medida: 1 L', i: 'quimico5.jpg' },
      { c: 'equipamiento', n: 'Palo telescópico', d: 'De 1 a 3 metros', i: 'bara-telescopia-piscinas-en-asia-lima.jpg' },
      { c: 'quimicos', n: 'Sulfato de aluminio', d: 'Peso: 1 kg', i: 'quimico1.jpg' },
      { c: 'equipamiento', n: 'Manguera para aspirar', d: 'De 6 a 10 metros', i: 'manguera-para-aspirar-piscinas-en-asia-lima.jpg' },
      { c: 'quimicos', n: 'Sulfato de cobre', d: 'Peso: 1 kg', i: 'quimico2.jpg' },
      { c: 'equipamiento', n: 'Rejilla de fondo', d: 'De diferentes diámetros', i: 'rejilla-piscinas-asia-lima-peru.jpg' },
      { c: 'quimicos', n: 'Ácido muriático', d: 'Medida: 4 L', i: 'quimico3.jpg' }
    ];
    const track = $('#productTrack');
    const carousel = $('#carousel');
    const bar = $('#carouselBar');

    const esc = s => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const render = filter => {
      const list = products.filter(p => filter === 'all' || p.c === filter);
      track.innerHTML = list.map((p, k) => {
        const msg = encodeURIComponent('Hola, deseo información del producto: ' + p.n + ' (' + p.d + ')');
        const q = p.c === 'quimicos';
        return `<article class="product" style="transition-delay:${Math.min(k * 40, 400)}ms">
          <div class="product__img"><span class="product__cat${q ? ' product__cat--q' : ''}">${q ? 'Químico' : 'Equipamiento'}</span>
            <img src="${P + p.i}" alt="${esc(p.n)}" loading="lazy" draggable="false"></div>
          <div class="product__body"><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p>
            <a class="product__btn" href="${WA + msg}" target="_blank" rel="noopener">Solicitar <span aria-hidden="true">→</span></a></div>
        </article>`;
      }).join('');
      // entrada escalonada
      $$('.product', track).forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(30px)'; });
      requestAnimationFrame(() => requestAnimationFrame(() => $$('.product', track).forEach(el => { el.style.opacity = ''; el.style.transform = ''; })));
      setTimeout(() => $$('.product', track).forEach(el => { el.style.transitionDelay = ''; }), 1200);
      x = 0; v = 0; apply();
    };

    // Física del carrusel
    let x = 0, v = 0, dragging = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, raf = 0, pid = null;
    const bounds = () => {
      const max = 0;
      const min = Math.min(0, carousel.clientWidth - track.scrollWidth);
      return { min, max };
    };
    const apply = () => {
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      const { min } = bounds();
      const p = min === 0 ? 1 : clamp(x / min, 0, 1);
      const visibleRatio = clamp(carousel.clientWidth / track.scrollWidth, .08, 1);
      bar.style.width = (visibleRatio * 100) + '%';
      bar.style.transform = `translateX(${(p * (1 / visibleRatio - 1) * 100).toFixed(2)}%)`;
    };
    const glide = () => {
      cancelAnimationFrame(raf);
      const step = () => {
        const { min, max } = bounds();
        x += v; v *= .94;
        if (x > max) { x = lerp(x, max, .18); v *= .5; }
        if (x < min) { x = lerp(x, min, .18); v *= .5; }
        apply();
        if (Math.abs(v) > .2 || x > max + .5 || x < min - .5) raf = requestAnimationFrame(step);
        else { x = clamp(x, min, max); apply(); }
      };
      raf = requestAnimationFrame(step);
    };

    carousel.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; moved = false; pid = e.pointerId;
      startX = lastX = e.clientX; startPos = x; lastT = performance.now(); v = 0;
      cancelAnimationFrame(raf);
    });
    carousel.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true; carousel.classList.add('is-dragging');
        try { carousel.setPointerCapture(pid); } catch (_) {}
      }
      if (!moved) return;
      const { min, max } = bounds();
      let nx = startPos + dx;
      if (nx > max) nx = max + (nx - max) * .35;
      if (nx < min) nx = min + (nx - min) * .35;
      x = nx;
      const now = performance.now();
      v = (e.clientX - lastX) / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
      apply();
    });
    const release = () => {
      if (!dragging) return;
      dragging = false; carousel.classList.remove('is-dragging');
      glide();
    };
    carousel.addEventListener('pointerup', release);
    carousel.addEventListener('pointercancel', release);
    carousel.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    carousel.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const { min, max } = bounds();
        x = clamp(x - e.deltaX, min, max); apply();
      }
    }, { passive: false });

    $$('.shop__nav .round-btn').forEach(b => b.addEventListener('click', () => {
      const card = $('.product', track);
      const stepW = card ? card.getBoundingClientRect().width + 18 : 300;
      const { min, max } = bounds();
      const target = clamp(x - (+b.dataset.dir) * stepW * 2, min, max);
      const from = x, t0 = performance.now();
      cancelAnimationFrame(raf);
      const run = now => {
        const t = clamp((now - t0) / 650, 0, 1);
        x = from + (target - from) * (1 - Math.pow(1 - t, 4)); apply();
        if (t < 1) raf = requestAnimationFrame(run);
      };
      raf = requestAnimationFrame(run);
    }));

    // Tabs con tinta animada
    const tabs = $$('.tab');
    const ink = $('.tabs__ink');
    const moveInk = t => { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft - 6}px)`; };
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(o => { o.classList.toggle('is-active', o === t); o.setAttribute('aria-selected', String(o === t)); });
      moveInk(t);
      render(t.dataset.filter);
    }));
    const activeTab = () => moveInk($('.tab.is-active'));
    window.addEventListener('resize', () => { activeTab(); const { min, max } = bounds(); x = clamp(x, min, max); apply(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(activeTab);
    activeTab();
    render('all');
  });

  /* ---------- Testimonios: mazo deslizable ---------- */
  safe('deck', () => {
    const deck = $('#deck'); if (!deck) return;
    let cards = $$('.quote', deck);
    const idxEl = $('#deckIdx');
    $('#deckTotal').textContent = cards.length;
    let current = 0;

    const layout = () => {
      cards.forEach((c, i) => {
        c.style.zIndex = String(cards.length - i);
        c.style.transform = `translate3d(${i * 14}px, ${i * 14}px, 0) scale(${1 - i * .045}) rotate(${i * 1.6}deg)`;
        c.style.opacity = i > 2 ? '0' : '1';
        c.style.filter = i === 0 ? '' : `brightness(${1 - i * .18})`;
        c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      });
      idxEl.textContent = (current % cards.length) + 1;
    };

    const next = (dir = 1) => {
      const top = cards[0];
      top.style.transform = `translate3d(${dir * 130}%, -6%, 0) rotate(${dir * 18}deg)`;
      top.style.opacity = '0';
      setTimeout(() => {
        cards.push(cards.shift());
        current = (current + 1) % cards.length;
        layout();
      }, 280);
    };
    const prev = () => {
      const last = cards.pop();
      cards.unshift(last);
      current = (current - 1 + cards.length) % cards.length;
      last.style.transition = 'none';
      last.style.transform = 'translate3d(-130%, -6%, 0) rotate(-18deg)';
      last.style.opacity = '0';
      last.style.zIndex = String(cards.length + 1);
      requestAnimationFrame(() => requestAnimationFrame(() => { last.style.transition = ''; layout(); }));
    };

    let sx = 0, dx = 0, dragging = false, card = null;
    deck.addEventListener('pointerdown', e => {
      card = cards[0];
      if (!card.contains(e.target)) return;
      dragging = true; sx = e.clientX; dx = 0;
      card.classList.add('is-dragging');
      card.setPointerCapture(e.pointerId);
    });
    deck.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - sx;
      card.style.transform = `translate3d(${dx}px, ${Math.abs(dx) * -.05}px, 0) rotate(${dx * .05}deg)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; card.classList.remove('is-dragging');
      if (Math.abs(dx) > 100) next(Math.sign(dx)); else layout();
    };
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
    $('#deckNext').addEventListener('click', () => next(1));
    $('#deckPrev').addEventListener('click', prev);
    deck.tabIndex = 0;
    deck.setAttribute('role', 'region');
    deck.setAttribute('aria-label', 'Testimonios de clientes');
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(1); if (e.key === 'ArrowLeft') prev(); });
    layout();
  });

  /* ---------- FAQ con animación de altura ---------- */
  safe('faq', () => {
    $$('.acc').forEach(d => {
      const summary = $('summary', d);
      const body = $('.acc__body', d);
      summary.addEventListener('click', e => {
        if (reduced || !body.animate) return;
        e.preventDefault();
        if (d.open) {
          const a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
          a.onfinish = () => { d.open = false; };
        } else {
          d.open = true;
          const h = body.offsetHeight;
          body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      });
    });
  });

  /* ---------- Formulario de contacto → WhatsApp / correo ---------- */
  safe('contact', () => {
    const form = $('#contactForm'); if (!form) return;
    const err = $('#formError');
    const mail = $('#mailAlt');
    const val = n => (form.elements[n].value || '').trim();
    const compose = () => [
      'Hola Asia Piscinas, quisiera un presupuesto.',
      'Nombre: ' + val('nombre'),
      'Teléfono: ' + val('telefono'),
      val('correo') ? 'Correo: ' + val('correo') : '',
      'Servicio: ' + val('servicio'),
      val('mensaje') ? 'Proyecto: ' + val('mensaje') : ''
    ].filter(Boolean).join('\n');

    const syncMail = () => {
      mail.href = 'mailto:informes@asiapiscinas.com?subject=' + encodeURIComponent('Solicitud de presupuesto — ' + val('servicio')) + '&body=' + encodeURIComponent(compose());
    };
    form.addEventListener('input', syncMail);
    syncMail();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [];
      ['nombre', 'telefono'].forEach(n => {
        const el = form.elements[n];
        const ok = n === 'telefono' ? /[0-9]{6,}/.test(el.value.replace(/\D/g, '')) : el.value.trim().length > 1;
        el.classList.toggle('is-invalid', !ok);
        if (!ok) bad.push(el);
      });
      const email = form.elements.correo;
      if (email.value && !email.checkValidity()) { email.classList.add('is-invalid'); bad.push(email); } else email.classList.remove('is-invalid');
      if (bad.length) {
        err.textContent = 'Revisa los campos marcados: nombre, teléfono' + (bad.includes(email) ? ' y correo' : '') + '.';
        bad[0].focus();
        return;
      }
      err.textContent = '';
      window.open(WA + encodeURIComponent(compose()), '_blank', 'noopener');
    });
  });
})();
