(() => {
  'use strict';

  const prefersReduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------------------------------------------------
     Small utilities
     --------------------------------------------------------- */
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const debounce = (fn, wait = 120) => {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  /* ---------------------------------------------------------
     HERO CAROUSEL
     - Dots auto-built
     - Click left third = previous
       Click middle/right = next
     --------------------------------------------------------- */
  function initSvHeroCarousel(root) {
    if (!root || root.dataset.svHeroInit === '1') return;
    root.dataset.svHeroInit = '1';

    const slides = Array.from(root.querySelectorAll('.sv-img-slide'));
    const dotsWrap = root.querySelector('.sv-img-dots');
    const stage = root.querySelector('.sv-img-stage');
    if (!slides.length || !dotsWrap || !stage) return;

    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sv-img-dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', 'Slide ' + (i + 1));
      b.dataset.index = String(i);
      dotsWrap.appendChild(b);
    });

    const dots = Array.from(dotsWrap.querySelectorAll('.sv-img-dot'));
    let idx = 0;
    let timer = null;
    const interval = parseInt(root.getAttribute('data-interval') || '6500', 10);

    const goTo = (next) => {
      const total = slides.length;
      const n = (next + total) % total;

      slides[idx].classList.remove('is-active');
      dots[idx].classList.remove('is-active');

      slides[n].classList.add('is-active');
      dots[n].classList.add('is-active');

      idx = n;
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (prefersReduce) return;
      stop();
      timer = setInterval(() => goTo(idx + 1), interval);
    };

    dotsWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.sv-img-dot');
      if (!btn) return;
      const n = parseInt(btn.dataset.index, 10);
      if (!Number.isFinite(n)) return;
      goTo(n);
      start();
    });

    stage.addEventListener('click', (e) => {
      // Don’t hijack real interactive elements layered over the carousel.
      if (e.target.closest('button, a')) return;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const third = rect.width / 3;

      if (x < third) goTo(idx - 1);
      else goTo(idx + 1);

      start();
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    slides.forEach((s, i) => s.classList.toggle('is-active', i === 0));
    start();
  }

  /* ---------------------------------------------------------
     HERO PARALLAX (device drift + background vars)
     --------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReduce) return;

    const hero = document.querySelector('.sv-hero--centered');
    const device = hero && hero.querySelector('.sv-device');
    if (!hero || !device) return;
    if (hero.dataset.svParallaxInit === '1') return;
    hero.dataset.svParallaxInit = '1';

    let raf = null;
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let scrollT = 0, scrollCur = 0;

    let inView = true;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        inView = !!(entries[0] && entries[0].isIntersecting);
        if (inView) requestTick();
      }, { threshold: 0.08 });
      io.observe(hero);
    }

    function requestTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onMove(e) {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      targetX = x - 0.5;
      targetY = y - 0.5;
      requestTick();
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      requestTick();
    }

    function onScroll() {
      const r = hero.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const vh = window.innerHeight || 800;
      const p = (mid - vh / 2) / (vh / 2);
      scrollT = clamp(p, -1, 1) * -10;
      requestTick();
    }

    function tick() {
      raf = null;
      if (!inView) return;

      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      scrollCur += (scrollT - scrollCur) * 0.10;

      const tx = (curX * 10);
      const ty = (curY * 8) + scrollCur;
      const rx = (-curY * 2.0);
      const ry = (curX * 2.8);

      device.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

      // Drives swirl background via CSS vars
      hero.style.setProperty('--mx', (curX * 18).toFixed(2) + 'px');
      hero.style.setProperty('--my', (curY * 14).toFixed(2) + 'px');
    }

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll();
  }

  /* ---------------------------------------------------------
     RIPPLE (nice micro-interaction)
     --------------------------------------------------------- */
  function addRipple(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;

    const ripple = document.createElement('span');
    ripple.className = 'sv-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';

    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  function initRippleSelectors() {
    const targets = document.querySelectorAll('.sv-actions a.sv-btn');
    targets.forEach((el) => {
      if (el.dataset.svRipple === '1') return;
      el.dataset.svRipple = '1';
      el.classList.add('sv-ripple-target');
      el.addEventListener('pointerdown', addRipple, { passive: true });
    });
  }

  /* ---------------------------------------------------------
     MARQUEE — seamless loop (NO gaps)
     - Clones the sequence enough times to cover viewport
     - Shift distance includes flex gap between sequences
     --------------------------------------------------------- */
  function initMarquees() {
    const tracks = document.querySelectorAll('.sv-marquee-track[data-sv-marquee]');
    tracks.forEach((track) => {
      if (track.dataset.svMarqueeInit === '1') return;
      track.dataset.svMarqueeInit = '1';

      let seq = track.querySelector('.sv-marquee-seq');
      if (!seq) {
        seq = document.createElement('div');
        seq.className = 'sv-marquee-seq';
        while (track.firstChild) seq.appendChild(track.firstChild);
        track.appendChild(seq);
      }

      if (!track.dataset.svMarqueeOriginal) {
        track.dataset.svMarqueeOriginal = seq.innerHTML;
      }

      const speed = parseFloat(track.getAttribute('data-speed') || '90');

      const rebuild = () => {
        // Reset back to original
        seq.innerHTML = track.dataset.svMarqueeOriginal;
        Array.from(track.children).forEach((ch) => { if (ch !== seq) ch.remove(); });

        // We need a stable width to clone cleanly
        const shell = track.closest('.sv-marquee-shell') || track.parentElement;
        const shellW = shell ? shell.getBoundingClientRect().width : window.innerWidth;

        const seqW = Math.ceil(seq.getBoundingClientRect().width);
        if (!seqW || seqW < 10) return;

        // Account for flex gap between sequences
        const cs = getComputedStyle(track);
        const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;

        // Clone until we cover enough distance (2x viewport + one sequence safety)
        let totalW = seqW;
        while (totalW < (shellW * 2 + seqW)) {
          const clone = seq.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.classList.add('sv-marquee-seq--clone');
          track.appendChild(clone);
          totalW += (seqW + gap);
        }

        const shift = seqW + gap;
        track.style.setProperty('--sv-marquee-shift', shift + 'px');
        track.style.setProperty('--sv-marquee-duration', (shift / speed).toFixed(2) + 's');

        // Nudge GPU compositing
        track.style.transform = 'translate3d(0,0,0)';
      };

      // Rebuild after images load AND on resize
      const imgs = Array.from(track.querySelectorAll('img'));
      let pending = 0;

      imgs.forEach((img) => {
        if (!img.complete) {
          pending++;
          const done = () => { pending--; if (pending === 0) rebuild(); };
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }
      });

      rebuild();
      window.addEventListener('resize', debounce(rebuild, 140), { passive: true });
    });
  }

  /* ---------------------------------------------------------
     TRUST BADGE HIGHLIGHT CYCLE
     --------------------------------------------------------- */
  function initTrustBadgeCycle() {
    const trustSection = document.getElementById('trust');
    if (!trustSection) return;
    if (prefersReduce) return;
    if (trustSection.dataset.svTrustCycle === '1') return;
    trustSection.dataset.svTrustCycle = '1';

    const badges = Array.from(trustSection.querySelectorAll('.sv-trust-badge[data-badge]'));
    if (!badges.length) return;

    let idx = 0;

    const activate = (i) => {
      badges.forEach((b) => b.classList.remove('is-active'));
      const el = badges[i];
      if (!el) return;
      // Restart animation cleanly
      el.classList.remove('is-active');
      void el.offsetWidth;
      el.classList.add('is-active');
    };

    activate(0);

    setInterval(() => {
      idx = (idx + 1) % badges.length;
      activate(idx);
    }, 2200);
  }

  /* ---------------------------------------------------------
     HEADER CTA FALLBACK
     - Ensures Login + Free Trial exist even if the header module hides them.
     - If you add these in the theme settings, this does nothing.
     --------------------------------------------------------- */
  function ensureHeaderCtas() {
    const header = document.querySelector('.hs-elevate-site-header, header');
    if (!header) return;
    if (header.dataset.svCtasInjected === '1') return;

    const hasLogin = !!header.querySelector('a.hs-elevate-button[href*="/_hcms/mem/login"]');
    const hasPricing = !!header.querySelector('a.hs-elevate-button[href*="/pricing"]');
    if (hasLogin && hasPricing) return;

    // Find a reasonable insertion target (right-side container > nav > header)
    const target =
      header.querySelector('.hs-elevate-site-header__actions, .hs-elevate-site-header__ctas, .hs-elevate-site-header__right, nav') ||
      header;

    let wrap = header.querySelector('.sv-header-ctas');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'sv-header-ctas';
      // Try to add near the end of target so it lands “right”
      target.appendChild(wrap);
    }

    if (!hasLogin) {
      const a = document.createElement('a');
      a.href = '/_hcms/mem/login';
      a.className = 'hs-elevate-button';
      a.textContent = 'Login';
      wrap.appendChild(a);
    }

    if (!hasPricing) {
      const a = document.createElement('a');
      a.href = '/pricing';
      a.className = 'hs-elevate-button';
      a.textContent = 'Free Trial';
      wrap.appendChild(a);
    }

    header.dataset.svCtasInjected = '1';
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function runAll() {
    document.querySelectorAll('[data-sv-hero-carousel]').forEach(initSvHeroCarousel);
    initHeroParallax();
    initMarquees();
    initRippleSelectors();
    initTrustBadgeCycle();
    ensureHeaderCtas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll, { once: true });
  } else {
    runAll();
  }

  // HubSpot / React hydration safety net
  window.addEventListener('load', runAll, { once: true });
  setTimeout(runAll, 600);
  setTimeout(runAll, 1800);

})();
