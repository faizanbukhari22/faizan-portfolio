/* js/main.js — Portfolio interactions */
(function() {
  'use strict';

  /* ---- CUSTOM CURSOR ---- */
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (cursor && trail) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
    });
    function moveTrail() {
      tx += (cx - tx) * 0.12;
      ty += (cy - ty) * 0.12;
      trail.style.left = tx + 'px';
      trail.style.top = ty + 'px';
      requestAnimationFrame(moveTrail);
    }
    moveTrail();
    document.querySelectorAll('a, button, .role-btn, .cred-filter, .cred-card, .tl-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        trail.style.transform = 'translate(-50%, -50%) scale(1.5)';
        trail.style.borderColor = 'rgba(245,166,35,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        trail.style.transform = 'translate(-50%, -50%) scale(1)';
        trail.style.borderColor = 'rgba(245,166,35,0.4)';
      });
    });
  }

  /* ---- NAV SCROLL STATE ---- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ---- MOBILE MENU ---- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- HERO ROLE ROTATOR ---- */
  const roleItems = document.querySelectorAll('.role-item');
  let currentRole = 0;
  if (roleItems.length > 1) {
    setInterval(() => {
      roleItems[currentRole].classList.remove('active');
      currentRole = (currentRole + 1) % roleItems.length;
      roleItems[currentRole].classList.add('active');
    }, 2400);
  }

  /* ---- ROLE SELECTOR (About section) ---- */
  const roleBtns = document.querySelectorAll('.role-btn');
  const roleViews = document.querySelectorAll('.role-view');
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      roleBtns.forEach(b => b.classList.remove('active'));
      roleViews.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('view-' + role);
      if (target) target.classList.add('active');
    });
  });

  /* ---- CREDENTIALS FILTER ---- */
  const credFilters = document.querySelectorAll('.cred-filter');
  const credCards = document.querySelectorAll('.cred-card');
  credFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      const cat = filter.dataset.filter;
      credFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      credCards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = 'fadeUp 0.35s ease forwards';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ---- SCROLL REVEAL ---- */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  /* ---- SKILL BARS ANIMATION ---- */
  const bars = document.querySelectorAll('.bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.style.width;
        bar.style.setProperty('--target-width', targetWidth);
        bar.style.width = '0';
        setTimeout(() => {
          bar.style.width = targetWidth;
        }, 200);
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.2 });
  bars.forEach(bar => barObserver.observe(bar));

  /* ---- GSAP SCROLL ANIMATIONS (if available) ---- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero name letter animation
    document.querySelectorAll('.name-line').forEach((line, i) => {
      gsap.fromTo(line,
        { opacity: 0, y: 60, skewX: -5 },
        {
          opacity: 1, y: 0, skewX: 0,
          duration: 0.9,
          delay: 0.3 + i * 0.15,
          ease: 'power3.out'
        }
      );
    });

    // Timeline cards stagger
    gsap.utils.toArray('.tl-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });

    // Credential cards stagger
    gsap.utils.toArray('.cred-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5,
          delay: (i % 4) * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          }
        }
      );
    });

    // Hero bg text parallax
    const bgText = document.querySelector('.hero-bg-text');
    if (bgText) {
      gsap.to(bgText, {
        y: -200,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Section headers pin-reveal
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: title, start: 'top 88%' }
        }
      );
    });
  }

  /* ---- SMOOTH NAV LINK ACTIVE STATE ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === '#' + id ? 'var(--accent)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---- ACTIVE NAV HIGHLIGHT ON SCROLL ---- */
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sTop = section.offsetTop - 120;
      if (window.scrollY >= sTop) current = section.id;
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + current;
      link.style.color = isActive ? 'var(--accent)' : '';
      link.style.background = isActive ? 'rgba(245,166,35,0.08)' : '';
    });
  });

  /* ---- KEYBOARD ACCESSIBILITY ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

})();
