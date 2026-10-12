// ─── The Way of Dreams — script.js ───

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initReveal();
  initFilters();
  initHamburger();
  animateCounters();
  initInteractiveChecklists();
});

// ── NAVBAR scroll effect ──
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── FLOATING PARTICLES ──
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * 6 + 2;
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 14 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.18 + 0.04};
    `;
    container.appendChild(el);
  }
}

// ── SCROLL REVEAL ──
function initReveal() {
  const els = document.querySelectorAll(
    '.roadmap-item, .note-card, .about-card, .section-header, .note-block, .sidebar-card'
  );
  els.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── FILTER BUTTONS (index page) ──
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.note-card[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        if (show) {
          card.style.opacity = '1';
          card.style.transform = '';
          card.style.pointerEvents = '';
        } else {
          card.style.opacity = '0.25';
          card.style.transform = 'scale(0.96)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
}

// ── HAMBURGER MENU ──
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.classList.toggle('open');
  });
  // close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
    });
  });
}

// ── COUNTER ANIMATION (hero stats) ──
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(el => {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target) || target === 0) return;
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 30);
  });
}

// ── SIDEBAR PROGRESS BARS animation ──
function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-fill');
  bars.forEach(bar => {
    const w = bar.dataset.width || '0';
    setTimeout(() => { bar.style.width = w + '%'; }, 400);
  });
}
animateProgressBars();

// ── SMOOTH anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ═════════════════════════════════════════════════════
// INTERACTIVE CHECKLIST LOGIC WITH LOCALSTORAGE PERSISTENCE
// ═════════════════════════════════════════════════════
function initInteractiveChecklists() {
  const cards = document.querySelectorAll('.checklist-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const listId = card.dataset.checklistId || window.location.pathname;
    const items = card.querySelectorAll('.checklist-item');
    const fill = card.querySelector('.checklist-progress-fill');
    const progressText = card.querySelector('.checklist-progress-text');
    const banner = card.querySelector('.checklist-complete-banner');
    const resetBtn = card.querySelector('.checklist-reset-btn');

    const total = items.length;
    if (!total) return;

    // Load saved state
    const savedState = JSON.parse(localStorage.getItem('chk_' + listId) || '{}');

    function updateProgress(animate = true) {
      let checkedCount = 0;
      items.forEach((item, idx) => {
        if (item.classList.contains('checked')) {
          checkedCount++;
          savedState[idx] = true;
        } else {
          delete savedState[idx];
        }
      });

      localStorage.setItem('chk_' + listId, JSON.stringify(savedState));

      const pct = Math.round((checkedCount / total) * 100);
      if (fill) fill.style.width = pct + '%';
      if (progressText) {
        progressText.textContent = `${checkedCount} / ${total} completed (${pct}%)`;
      }

      if (banner) {
        if (checkedCount === total && total > 0) {
          banner.classList.add('active');
        } else {
          banner.classList.remove('active');
        }
      }
    }

    // Apply saved state on init
    items.forEach((item, idx) => {
      if (savedState[idx]) {
        item.classList.add('checked');
      }

      // Click to toggle
      item.addEventListener('click', (e) => {
        item.classList.toggle('checked');
        updateProgress(true);

        // Add subtle click wave
        const box = item.querySelector('.chk-box');
        if (box) {
          box.style.transform = 'scale(0.85)';
          setTimeout(() => {
            box.style.transform = '';
          }, 150);
        }
      });
    });

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Reset all checklist items for this page?')) {
          items.forEach(it => it.classList.remove('checked'));
          localStorage.removeItem('chk_' + listId);
          updateProgress(false);
        }
      });
    }

    // Initial calculation without animation delay
    updateProgress(false);
  });
}

// Call on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveChecklists);
} else {
  initInteractiveChecklists();
}