/* ════════════════════════════════════════════════════════════════════
   Ahmed Elkhrashy — Portfolio
   Shared interactions: load animation, cursor, reveals, page transitions
   ════════════════════════════════════════════════════════════════════ */

// ── Page load ───────────────────────────────────────────────
window.addEventListener('load', () => {
  requestAnimationFrame(() => document.body.classList.add('loaded'));
});

// In case the load event already fired (cached navigation)
if (document.readyState === 'complete') {
  requestAnimationFrame(() => document.body.classList.add('loaded'));
}

// ── Custom cursor ───────────────────────────────────────────
(function setupCursor() {
  if (matchMedia('(hover: none)').matches) return;

  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;

  let cx = 0, cy = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  (function animateRing() {
    rx += (cx - rx) * 0.14;
    ry += (cy - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  const expandSelectors = 'a, button, .project-card, .gallery-item, .pipeline-step, .method, .stat, .nav-links a, .contact-title a';
  document.querySelectorAll(expandSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
})();

// ── Scroll reveal ───────────────────────────────────────────
(function setupReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-x');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

// ── Smooth page transitions ─────────────────────────────────
(function setupTransitions() {
  const isInternal = href => {
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (/^https?:\/\//i.test(href)) {
      try { return new URL(href).origin === location.origin; }
      catch { return false; }
    }
    return true;
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!isInternal(href)) return;
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;

    // hash on the same page → smooth scroll only
    if (href.startsWith('#')) return;

    e.preventDefault();
    document.body.classList.add('transitioning');
    setTimeout(() => { window.location.href = href; }, 420);
  });

  // Restore state on bfcache restore
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      document.body.classList.remove('transitioning');
      document.body.classList.add('loaded');
    }
  });
})();

// ── Subtle parallax on hero bg images ───────────────────────
(function setupHeroParallax() {
  const bg = document.querySelector('.detail-hero-bg');
  if (!bg) return;
  let ticking = false;
  document.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      bg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.04)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

// ── Dynamic background system ────────────────────────────────
(function setupDynamicBackground() {
  // Inject the canvas as the very first child of body
  const canvas = document.createElement('div');
  canvas.className = 'bg-canvas';
  canvas.innerHTML =
    '<div class="bg-base"></div>' +
    '<div class="bg-orb-1"></div>' +
    '<div class="bg-orb-2"></div>' +
    '<div class="bg-orb-3"></div>' +
    '<div class="bg-spotlight"></div>' +
    '<div class="bg-grid-layer"></div>' +
    '<div class="bg-noise"></div>';
  document.body.insertBefore(canvas, document.body.firstChild);

  const orb1      = canvas.querySelector('.bg-orb-1');
  const orb2      = canvas.querySelector('.bg-orb-2');
  const gridLayer = canvas.querySelector('.bg-grid-layer');
  const spotlight = canvas.querySelector('.bg-spotlight');

  // ── Scroll reactivity ──────────────────────────────
  // Orb 1 (orange top-left) drifts DOWN-RIGHT as user scrolls → warm glow follows you down
  // Orb 2 (cyan bottom-right) drifts UP-LEFT → recedes as you scroll
  // Grid layer moves UP at ~50% page scroll speed (parallax)
  let scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;

      orb1.style.transform =
        `translate3d(${y * 0.07}px, ${y * 0.14}px, 0)`;

      orb2.style.transform =
        `translate3d(${-y * 0.05}px, ${-y * 0.10}px, 0)`;

      // Grid drifts up at ~50% content speed — feels like depth
      gridLayer.style.transform =
        `translate3d(0, ${y * 0.05}px, 0)`;

      scrollTicking = false;
    });
    scrollTicking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mouse spotlight ────────────────────────────────
  // Follows cursor with soft easing — laggy on purpose for depth feel
  let targetX = window.innerWidth  / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  const HALF_SIZE = 250; // half of spotlight 500px

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  (function animateSpotlight() {
    // Lerp toward mouse — slower than cursor ring for a dreamy lag
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    spotlight.style.left = (currentX - HALF_SIZE) + 'px';
    spotlight.style.top  = (currentY - HALF_SIZE) + 'px';
    requestAnimationFrame(animateSpotlight);
  })();

  // ── Section tinting ────────────────────────────────
  // Shift orb opacity as the user scrolls into different page sections,
  // so the atmosphere subtly changes between sections.
  const sections = document.querySelectorAll('section[id], header, footer');
  if ('IntersectionObserver' in window && sections.length) {
    const tintMap = {
      'work':    { o1: 0.28, o2: 0.18 },
      'about':   { o1: 0.18, o2: 0.28 },
      'contact': { o1: 0.32, o2: 0.12 },
    };
    // default base
    let activeId = '';
    const tintObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) {
          const id = e.target.id;
          if (id && tintMap[id]) {
            const t = tintMap[id];
            orb1.style.opacity = t.o1;
            orb2.style.opacity = t.o2;
          } else {
            orb1.style.opacity = '';
            orb2.style.opacity = '';
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => {
      if (s.id) tintObs.observe(s);
    });
  }
})();
