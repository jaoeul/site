/**
 * Cinematic Art — Minimal JS
 * Mobile nav toggle, scroll reveal, footer year, i18n
 */

(function () {
  'use strict';

  var DEFAULT_LANG = 'pt';
  var STORAGE_KEY = 'cinematicart-lang';

  // --- i18n: get saved language or default ---
  function getLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return (saved && (saved === 'pt' || saved === 'en' || saved === 'sv')) ? saved : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {}
  }

  function applyTranslations(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) return;
    var t = translations[lang];
    var year = new Date().getFullYear();

    // Elements with data-i18n (innerHTML, allows <br>)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key]) {
        var val = t[key].replace('{year}', year);
        el.innerHTML = val;
      }
    });

    // Elements with data-i18n-alt (img alt)
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      if (t[key]) el.setAttribute('alt', t[key]);
    });

    // Elements with data-i18n-placeholder (input/textarea)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });

    // Elements with data-i18n-aria (aria-label and title for tooltips)
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key]) {
        el.setAttribute('aria-label', t[key]);
        if (el.hasAttribute('title')) el.setAttribute('title', t[key]);
      }
    });

    // Meta, title, and OG tags
    if (t['meta-description']) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', t['meta-description']);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', t['meta-description']);
      var twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', t['meta-description']);
    }
    if (t['page-title']) {
      document.title = t['page-title'];
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', t['page-title']);
      var twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', t['page-title']);
    }

    // html lang
    document.documentElement.setAttribute('lang', lang);
    // Sync read-more button text when expanded
    document.querySelectorAll('.film-desc-wrap.is-expanded .read-more-btn').forEach(function (btn) {
      if (t['read-less']) btn.textContent = t['read-less'];
    });
    // Sync show-more-projects button when expanded
    var showMore = document.querySelector('.show-more-projects-btn');
    var wrap = document.querySelector('.other-projects-wrap');
    if (showMore && wrap && wrap.classList.contains('is-expanded') && t['show-less-projects']) {
      showMore.textContent = t['show-less-projects'];
      showMore.setAttribute('data-i18n', 'show-less-projects');
    }
  }

  function updateLangButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  // --- Init i18n ---
  var currentLang = getLang();
  applyTranslations(currentLang);
  updateLangButtons(currentLang);

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = this.getAttribute('data-lang');
      if (lang && (lang === 'pt' || lang === 'en' || lang === 'sv')) {
        setLang(lang);
        applyTranslations(lang);
        updateLangButtons(lang);
      }
    });
  });

  // --- Footer year ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Header scroll state ---
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // --- Back to top ---
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Mobile nav toggle ---
  var toggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  if (toggle && navMenu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      navMenu.setAttribute('data-open', !expanded);
    });
    // Close on link click (for anchor links)
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('data-open', 'false');
      });
    });
  }

  // --- Scroll reveal (Intersection Observer) ---
  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { rootMargin: '0px 0px -48px 0px', threshold: 0.1 }
  );

  revealEls.forEach(function (el) { observer.observe(el); });

  // --- Read more / Read less ---
  document.querySelectorAll('.read-more-btn').forEach(function (btn) {
    var wrap = btn.closest('.film-desc-wrap');
    if (!wrap) return;
    btn.addEventListener('click', function () {
      var expanded = wrap.classList.toggle('is-expanded');
      var t = translations && translations[getLang()];
      btn.textContent = (t && t['read-less']) ? (expanded ? t['read-less'] : t['read-more']) : (expanded ? 'Ler menos' : 'Ler mais');
    });
  });

  // --- Show more projects (LER MAIS) ---
  var showMoreBtn = document.querySelector('.show-more-projects-btn');
  var otherProjectsWrap = document.querySelector('.other-projects-wrap');
  if (showMoreBtn && otherProjectsWrap) {
    showMoreBtn.addEventListener('click', function () {
      var expanded = otherProjectsWrap.classList.toggle('is-expanded');
      var t = translations && translations[getLang()];
      var key = expanded ? 'show-less-projects' : 'show-more-projects';
      showMoreBtn.textContent = (t && t[key]) ? t[key] : (expanded ? 'LER MENOS' : 'LER MAIS');
      showMoreBtn.setAttribute('data-i18n', key);
    });
  }

  // --- Lightbox (click to view full image) ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox && lightbox.querySelector('.lightbox-img');
  var lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');
  var lightboxBackdrop = lightbox && lightbox.querySelector('.lightbox-backdrop');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt || '');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var src = this.getAttribute('data-lightbox-src') || this.getAttribute('href');
      var alt = this.getAttribute('data-lightbox-alt') || '';
      if (src && src !== '#') openLightbox(src, alt);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) closeLightbox();
  });

  // --- Interview thumbnail click-to-play ---
  var interviewThumb = document.querySelector('.interview-thumbnail');
  var interviewWrap = document.querySelector('.interview-video-wrap');
  var interviewIframe = interviewWrap && interviewWrap.querySelector('iframe[data-src]');
  if (interviewThumb && interviewWrap && interviewIframe) {
    function playInterview() {
      var src = interviewIframe.getAttribute('data-src');
      if (src) {
        interviewIframe.setAttribute('src', src);
        interviewIframe.removeAttribute('data-src');
      }
      interviewWrap.classList.add('loaded');
    }
    interviewThumb.addEventListener('click', playInterview);
    interviewThumb.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playInterview();
      }
    });
  }
})();
