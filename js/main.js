/* ═══════════════════════════════════════════════════════
   DR. EMMA NKONOKI — main.js
   Scroll reveals · Animated counters · Theme switcher
   Publication filter · Mobile nav · Blog fetch
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── THEME SWITCHER ──────────────────────────────── */
  const THEME_KEY = 'emma-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'academic';
    applyTheme(saved);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
  }

  /* ─── NAVIGATION ──────────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
        });
      });
    }

    // Active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ─── SCROLL REVEAL ───────────────────────────────── */
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  /* ─── ANIMATED COUNTERS ────────────────────────────── */
  function animateCounter(el, target, suffix) {
    const duration = 2000;
    const start = performance.now();
    const startVal = 0;

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ─── PUBLICATION FILTER ────────────────────────────── */
  function initPubFilter() {
    const filterBtns = document.querySelectorAll('.pub-filter-btn');
    const pubCards = document.querySelectorAll('.pub-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        pubCards.forEach(card => {
          if (filter === 'all') {
            card.classList.remove('hidden');
          } else {
            const matches = card.dataset.year === filter ||
                            card.dataset.type === filter;
            card.classList.toggle('hidden', !matches);
          }
        });
      });
    });
  }

  /* ─── BLOG FETCH ─────────────────────────────────────── */
  async function initBlog() {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    try {
      const res = await fetch('posts.json');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const posts = await res.json();

      blogContainer.innerHTML = posts.map((post, i) => `
        <article class="blog-card glass reveal${i === 0 ? ' featured' : ''}" tabindex="0" role="article">
          <span class="blog-date">${post.date}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="blog-tag-list">
            ${post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}
          </div>
        </article>
      `).join('');

      // Re-initialise reveal for newly added elements
      initReveal();
    } catch (err) {
      blogContainer.innerHTML = `<p style="color:var(--text-muted);padding:2rem;">Blog posts coming soon.</p>`;
    }
  }

  /* ─── SMOOTH ANCHOR SCROLL ──────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-h'), 10) || 68;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─── BENTO HOVER PARALLAX (subtle) ─────────────────── */
  function initBentoParallax() {
    document.querySelectorAll('.bento-bio, .bento-tagline, .bento-contact').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ─── NAV DROPDOWN KEYBOARD ACCESS ─────────────────── */
  function initNavDropdowns() {
    const dropItems = document.querySelectorAll('.nav-links li.has-dropdown');
    if (!dropItems.length) return;

    dropItems.forEach(item => {
      const trigger = item.querySelector(':scope > a');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!dropdown) return;

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          item.classList.add('open');
          const first = dropdown.querySelector('a');
          if (first) first.focus();
        }
      });

      const links = [...dropdown.querySelectorAll('a')];
      links.forEach((link, i) => {
        link.addEventListener('keydown', e => {
          if (e.key === 'Escape' || (e.key === 'ArrowUp' && i === 0)) {
            item.classList.remove('open');
            trigger.focus();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (links[i + 1]) links[i + 1].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (links[i - 1]) links[i - 1].focus();
          }
        });
      });

      item.addEventListener('focusout', e => {
        if (!item.contains(e.relatedTarget)) item.classList.remove('open');
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape')
        document.querySelectorAll('.nav-links li.has-dropdown.open')
          .forEach(i => i.classList.remove('open'));
    });
  }

  /* ─── BACK TO TOP ────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── INIT ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initReveal();
    initCounters();
    initPubFilter();
    initBlog();
    initSmoothScroll();
    initBentoParallax();
    initNavDropdowns();
    initBackToTop();
  });

})();
