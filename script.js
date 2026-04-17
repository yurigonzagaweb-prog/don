/* ==========================================================
   SCRIPT.JS — IMERSÃO D.O.N
========================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------
   MATRIX RAIN
---------------------------------------------------------- */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cols, drops;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコ∆∑≠≈∞∂∫ΩΦΨΣπ';

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols  = Math.floor(W / 16);
    drops = Array(cols).fill(1);
  }
  function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.055)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '13px Share Tech Mono';
    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle   = Math.random() > 0.96 ? '#FFFFFF' : '#00FF41';
      ctx.globalAlpha = Math.random() * 0.45 + 0.08;
      ctx.fillText(ch, i * 16, drops[i] * 16);
      ctx.globalAlpha = 1;
      if (drops[i] * 16 > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  init();
  setInterval(draw, 55);
  window.addEventListener('resize', init);
})();

/* ----------------------------------------------------------
   GREEN SMOKE — full-page ambient, very soft
   Particle system: slow-drifting blobs that travel upward
   across the entire page height, visible but subtle.
---------------------------------------------------------- */
(function () {
  const canvas = document.getElementById('smoke-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  /* Particles */
  const PARTICLE_COUNT = 18;
  const particles = [];

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticle(forceBottom) {
    const startY = forceBottom
      ? H + rand(50, 200)
      : rand(-200, H + 200);

    return {
      x:       rand(0, W),
      y:       startY,
      radius:  rand(120, 320),       /* big, soft blobs */
      speedX:  rand(-0.15, 0.15),    /* barely drifting sideways */
      speedY:  rand(-0.25, -0.55),   /* slow rise */
      opacity: rand(0.018, 0.048),   /* very transparent */
      opacitySpeed: rand(0.0003, 0.0008),
      opacityDir: 1,
      opacityMin: 0.008,
      opacityMax: rand(0.035, 0.065),
      wobble:  rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.003, 0.008),
    };
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(false));
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      /* Update position */
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.12;
      p.y += p.speedY;

      /* Fade in/out pulsing */
      p.opacity += p.opacitySpeed * p.opacityDir;
      if (p.opacity >= p.opacityMax) p.opacityDir = -1;
      if (p.opacity <= p.opacityMin) p.opacityDir = 1;

      /* Recycle when fully above screen */
      if (p.y < -p.radius * 2) {
        Object.assign(p, createParticle(true));
      }

      /* Draw soft radial gradient blob */
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grd.addColorStop(0,   `rgba(0, 255, 65, ${p.opacity})`);
      grd.addColorStop(0.4, `rgba(0, 200, 50, ${p.opacity * 0.4})`);
      grd.addColorStop(1,   `rgba(0, 255, 65, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    requestAnimationFrame(drawFrame);
  }

  resize();
  window.addEventListener('resize', resize);
  drawFrame();
})();

/* ----------------------------------------------------------
   CUSTOM CURSOR
---------------------------------------------------------- */
(function () {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx - 6, y: my - 6 });
  });
  (function loop() {
    rx += (mx - rx - 18) * 0.12;
    ry += (my - ry - 18) * 0.12;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .pain-card, .module-item, .nav-cta, .btn-primary, .btn-secondary, .btn-cta-final')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

/* ----------------------------------------------------------
   HUD — clock
---------------------------------------------------------- */
(function () {
  const el = document.getElementById('hud-time');
  const tick = () => { el.textContent = new Date().toTimeString().slice(0, 8); };
  tick(); setInterval(tick, 1000);
})();

/* ----------------------------------------------------------
   HUD — scroll %
---------------------------------------------------------- */
(function () {
  const bar = document.getElementById('scroll-progress');
  const pctEl = document.getElementById('hud-scroll');
  window.addEventListener('scroll', () => {
    const pct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    bar.style.width = pct + '%';
    pctEl.textContent = String(pct).padStart(3, '0');
  });
})();

/* ----------------------------------------------------------
   HUD — FPS
---------------------------------------------------------- */
(function () {
  const el = document.getElementById('hud-frame');
  let last = performance.now(), frames = 0;
  (function tick(now) {
    frames++;
    if (now - last >= 1000) { el.textContent = frames; frames = 0; last = now; }
    requestAnimationFrame(tick);
  })(performance.now());
})();

/* ----------------------------------------------------------
   SMOOTH SCROLL
---------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ----------------------------------------------------------
   HERO — entrance (no parallax on desktop image — stays fixed)
---------------------------------------------------------- */
const heroTL = gsap.timeline({ delay: 0.3 });
heroTL
  .to('#hero-tag',      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0)
  .to('#hero-headline', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.3)
  .to('#hero-sub',      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.6)
  .to('#hero-ecg',      { opacity: 1,       duration: 0.6, ease: 'power2.out' }, 0.8)
  .to('#hero-cta',      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.9);

/* ----------------------------------------------------------
   DEPTH TRANSITION — 3D perspective shift between sections
   As a section exits the top: it scales down + blurs out.
   As a section enters: it scales up + unblurs into focus.
   Uses ScrollTrigger scrub for smooth continuous feel.
---------------------------------------------------------- */
(function () {
  const sections = gsap.utils.toArray('section');

  sections.forEach(section => {
    /* Exiting (scrolling section out of view upward) */
    gsap.to(section, {
      scrollTrigger: {
        trigger: section,
        start: 'bottom 40%',   /* só começa quando a seção está saindo */
        end:   'bottom top',
        scrub: 1,
      },
      scale:   0.96,
      opacity: 0.7,
      filter:  'blur(2px)',
      transformOrigin: '50% 50%',
      ease: 'none',
    });

    /* Entering (section coming into view from below) */
    gsap.fromTo(section,
      { scale: 0.97, opacity: 0.6, filter: 'blur(3px)', y: 24 },
      {
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end:   'top 30%',
          scrub: 1.2,
        },
        scale:   1,
        opacity: 1,
        filter:  'blur(0px)',
        y:       0,
        ease:    'none',
      }
    );
  });
})();

/* ----------------------------------------------------------
   SECTION DIVIDERS — reveal
---------------------------------------------------------- */
gsap.utils.toArray('.scene-divider').forEach(div => {
  const badge = div.querySelector('.divider-badge');
  const rails = div.querySelectorAll('.divider-rail');
  gsap.set([badge, rails], { opacity: 0 });
  ScrollTrigger.create({
    trigger: div, start: 'top 88%',
    onEnter: () => {
      gsap.to(rails,  { opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
      gsap.to(badge,  { opacity: 1, duration: 0.5, delay: 0.2,   ease: 'power2.out' });
    },
  });
});

/* ----------------------------------------------------------
   MANIFESTO — line reveal
---------------------------------------------------------- */
gsap.utils.toArray('.manifesto-line span').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' },
    y: 0, duration: 0.85, ease: 'power3.out', delay: i * 0.08,
  });
});
gsap.to('.manifesto-divider', {
  scrollTrigger: { trigger: '.manifesto-divider', start: 'top 86%' },
  opacity: 1, scaleY: 1, duration: 1, ease: 'power3.out',
});

/* ----------------------------------------------------------
   PAIN CARDS — stagger + 3D tilt
---------------------------------------------------------- */
gsap.utils.toArray('.pain-card').forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.12,
  });
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) / r.width;
    const y = (e.clientY - r.top  - r.height / 2) / r.height;
    gsap.to(card, { rotateY: x * 12, rotateX: -y * 12, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.7)' });
  });
});

/* ----------------------------------------------------------
   FADE-UP ELEMENTS
---------------------------------------------------------- */
gsap.utils.toArray('.fade-up').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 60 },
    { scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' },
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
  );
});

/* ----------------------------------------------------------
   SOLUTION PANELS
---------------------------------------------------------- */
gsap.utils.toArray('.sol-panel').forEach((panel, i) => {
  gsap.to(panel, {
    scrollTrigger: { trigger: panel, start: 'top 85%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.18,
  });
});

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const dur    = 1600;
  const start  = performance.now();
  (function update(now) {
    const progress = Math.min((now - start) / dur, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  })(start);
}

ScrollTrigger.create({
  trigger: '#solution', start: 'top 70%',
  onEnter: () => {
    document.querySelectorAll('.sol-meter-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });
    document.querySelectorAll('.sol-meter-value').forEach(animateCounter);
  },
});

ScrollTrigger.create({
  trigger: '.sol-stats', start: 'top 82%',
  onEnter: () => {
    gsap.utils.toArray('.sol-stat').forEach((stat, i) => {
      gsap.to(stat, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out' });
      const n = stat.querySelector('.sol-stat-num');
      if (n) setTimeout(() => animateCounter(n), i * 150);
    });
  },
});

gsap.to('.sol-cta-wrap', {
  scrollTrigger: { trigger: '.sol-cta-wrap', start: 'top 88%' },
  opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
});

/* ----------------------------------------------------------
   MODULE ITEMS
---------------------------------------------------------- */
gsap.utils.toArray('.module-item').forEach((item, i) => {
  gsap.to(item, {
    scrollTrigger: { trigger: item, start: 'top 89%', toggleActions: 'play none none reverse' },
    opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.07,
  });
});

/* ----------------------------------------------------------
   CTA FINAL
---------------------------------------------------------- */
const ctaTL = gsap.timeline({ scrollTrigger: { trigger: '#cta-final', start: 'top 72%' } });
ctaTL
  .to('.cta-headline',    { opacity: 1, y: 0,     duration: 1.0, ease: 'power3.out' }, 0)
  .to('.cta-sub',         { opacity: 1, y: 0,     duration: 0.8, ease: 'power3.out' }, 0.3)
  .to('.cta-price-block', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.5)
  .to('.cta-btn-wrap',    { opacity: 1, y: 0,     duration: 0.8, ease: 'power3.out' }, 0.7);

/* ----------------------------------------------------------
   HERO HEADLINE — random glitch pulse
---------------------------------------------------------- */
(function () {
  const headline = document.getElementById('hero-headline');
  if (!headline) return;
  setInterval(() => {
    if (Math.random() > 0.82) {
      const t = headline.querySelector('.line-2');
      if (!t) return;
      gsap.to(t, { x: gsap.utils.random(-5, 5), duration: 0.05, yoyo: true, repeat: 4, ease: 'none', onComplete: () => gsap.set(t, { x: 0 }) });
    }
  }, 2200);
})();
