(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = [...document.querySelectorAll('.nav-links a')];
  const themeToggle = document.querySelector('.theme-toggle');
  const paletteToggle = document.querySelector('.palette-toggle');
  const progressBar = document.querySelector('.scroll-progress span');
  const year = document.getElementById('year');
  const certToggle = document.querySelector('.cert-toggle');
  const certGrid = document.getElementById('cert-grid');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } }
  };

  const storedTheme = safeStorage.get('portfolio-theme');
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = storedTheme || preferredTheme;
  root.dataset.palette = safeStorage.get('portfolio-palette') || 'accent';

  const syncThemeControls = () => {
    const isDark = root.dataset.theme === 'dark';
    const isMono = root.dataset.palette === 'mono';
    themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    paletteToggle?.setAttribute('aria-label', isMono ? 'Use accent palette' : 'Use monochrome palette');
    paletteToggle?.setAttribute('aria-pressed', String(isMono));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b0c0f' : '#f4f1ea');
  };
  syncThemeControls();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    safeStorage.set('portfolio-theme', root.dataset.theme);
    syncThemeControls();
    document.dispatchEvent(new CustomEvent('appearancechange'));
  });

  paletteToggle?.addEventListener('click', () => {
    root.dataset.palette = root.dataset.palette === 'mono' ? 'accent' : 'mono';
    safeStorage.set('portfolio-palette', root.dataset.palette);
    syncThemeControls();
    document.dispatchEvent(new CustomEvent('appearancechange'));
  });

  if (year) year.textContent = new Date().getFullYear();

  const currentPage = body.dataset.page || 'home';
  navItems.forEach((link) => link.classList.toggle('active', link.dataset.pageLink === currentPage));

  const closeNavigation = () => {
    navLinks?.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('nav-open');
  };
  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.toggle('open');
    navToggle.classList.toggle('open', Boolean(isOpen));
    navToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
    body.classList.toggle('nav-open', Boolean(isOpen));
  });
  navItems.forEach((item) => item.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNavigation(); });
  document.addEventListener('click', (event) => {
    if (navLinks?.classList.contains('open') && !event.target.closest('.nav')) closeNavigation();
  });

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    header?.classList.toggle('scrolled', scrollTop > 16);
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  if ('IntersectionObserver' in window) {
    const reveals = [...document.querySelectorAll('.reveal')];
    reveals.forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    reveals.forEach((element) => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  const spotlightCards = document.querySelectorAll('.hero-card, .content-card, .project-card, .skill-card, .cert-card, .timeline-body, .directory-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    });
  });

  certToggle?.addEventListener('click', () => {
    const collapsed = certGrid?.dataset.collapsed !== 'false';
    if (certGrid) certGrid.dataset.collapsed = String(!collapsed);
    certToggle.setAttribute('aria-expanded', String(collapsed));
    certToggle.textContent = collapsed ? 'Show fewer certifications' : 'Show all certifications';
  });

  // Keep the footer control reliable across browsers and page-transition states.
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      closeNavigation();
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (window.location.hash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    });
  });

  // Smooth curtain transition between local HTML pages.
  const isPlainLeftClick = (event) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (reduceMotion || !isPlainLeftClick(event) || link.target || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const sameDocument =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      if (sameDocument && url.hash) return;
      if (sameDocument && !url.hash) {
        event.preventDefault();
        return;
      }

      if (!url.pathname.endsWith('/') && !/\.html$/i.test(url.pathname)) return;

      event.preventDefault();
      closeNavigation();
      body.classList.add('page-leaving');

      window.setTimeout(() => {
        window.location.href = url.href;
      }, 560);
    });
  });

  window.addEventListener('pageshow', () => {
    body.classList.remove('page-leaving');
  });

  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  const getParticleColor = () => getComputedStyle(root).getPropertyValue('--primary-rgb').trim() || '91, 75, 245';
  let particleColor = getParticleColor();
  document.addEventListener('appearancechange', () => { particleColor = getParticleColor(); });

  const resizeCanvas = () => {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(18, Math.min(52, Math.floor(width / 28)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
      r: Math.random() * 1.5 + 0.35
    }));
  };

  const drawParticles = () => {
    if (!canvas || !ctx || reduceMotion) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${particleColor}, .32)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < 115) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${particleColor}, ${0.075 * (1 - distance / 115)})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    frame = requestAnimationFrame(drawParticles);
  };

  if (canvas && ctx && !reduceMotion) {
    resizeCanvas(); drawParticles();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 140);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame); else drawParticles();
    });
  }
})();
