/* ─── Loader ─── */
(function() {
  const loader = document.getElementById('loader');
  const loaderFill = document.querySelector('.loader-fill');
  
  let progress = 0;
  let isLoaded = false;
  
  // Fake progress bar loading animation up to 92%
  function simulateProgress() {
    if (isLoaded) return;
    
    if (progress < 92) {
      progress += Math.random() * 12 + 4;
      if (progress > 92) progress = 92;
      loaderFill.style.width = progress + '%';
    }
    
    setTimeout(simulateProgress, Math.random() * 100 + 80);
  }
  
  function done() {
    if (isLoaded) return;
    isLoaded = true;
    loaderFill.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('out');
    }, 400); // Allow loading bar animation to fully complete before fade out
  }
  
  // Start the loading line progress immediately
  setTimeout(simulateProgress, 50);
  
  window.addEventListener('load', done);
  
  // Safety fallback to close loader if load exceeds 3 seconds
  setTimeout(done, 3000);
})();

/* ─── Image Fade-in ─── */
function markLoadedImage(img) {
  if (!(img instanceof HTMLImageElement)) return;
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
  } else if (img.complete && img.naturalWidth === 0 && !img.dataset.retried) {
    img.dataset.retried = '1';
    const src = img.src;
    img.src = '';
    requestAnimationFrame(() => { img.src = src; });
  }
}

document.addEventListener('load', e => {
  if (e.target instanceof HTMLImageElement) {
    e.target.classList.add('loaded');
  }
}, true);

document.querySelectorAll('img').forEach(markLoadedImage);

/* ─── Custom Cursor ─── */
(() => {
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  if (!hasFinePointer || !cur || !ring) {
    document.body.classList.add('native-cursor');
    cur?.remove();
    ring?.remove();
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  }, { passive: true });

  (function animRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .work-card, .education-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
})();

/* ─── Nav scroll ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Mobile nav ─── */
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ─── Scroll reveal ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* 初始化：让首屏元素立即显示 */
setTimeout(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
}, 50);

/* ─── Work filter ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');
const worksGrid  = document.querySelector('.works-grid');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    
    // Animate grid out
    worksGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    worksGrid.style.opacity = '0';
    worksGrid.style.transform = 'translateY(10px)';

    setTimeout(() => {
      workCards.forEach(c => {
        const show = f === 'all' || (c.dataset.cat && c.dataset.cat.split(' ').includes(f));
        if (show) {
          c.style.display = '';
          c.style.opacity = '';
          c.style.pointerEvents = '';
          c.style.animation = 'none'; // Clear any fadeIn animation
        } else {
          c.style.display = 'none';
        }
      });
      
      // Force reflow
      void worksGrid.offsetWidth;

      // Animate grid in
      worksGrid.style.opacity = '1';
      worksGrid.style.transform = 'translateY(0)';
    }, 300);
  });
});

/* ─── Active nav link on scroll ─── */
const sections = document.querySelectorAll('#hero, #about, #works, #education, #experience, #skills, #contact');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) cur = s.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur
      ? 'var(--c-ink)' : '';
  });
}, { passive: true });

/* ─── Form submit ─── */
function handleForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.contact-submit');
  btn.querySelector('span').textContent = '已发送 ✓';
  btn.style.opacity = '.5';
  btn.disabled = true;
  setTimeout(() => {
    btn.querySelector('span').textContent = '发送消息';
    btn.style.opacity = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
}

/* ─── Smooth number counter ─── */
function countUp(el, target, suffix = '') {
  let start = 0;
  const duration = 1200;
  const step = timestamp => {
    if (!start) start = timestamp;
    const p = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.round(p * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const nums = [['23', ''], ['3', '+'], ['10', '+']];
      e.target.querySelectorAll('.stat-num').forEach((el, i) => {
        countUp(el, parseInt(nums[i][0]), nums[i][1]);
      });
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: .5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statObserver.observe(statsEl);

/* ─── Parallax title on hero ─── */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const hero = document.querySelector('.hero-title');
  if (hero) hero.style.transform = `translateY(${y * 0.18}px)`;
}, { passive: true });

/* ─── Work Modal ─── */
const modal = document.getElementById('workModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalTag = document.getElementById('modalTag');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const imagePreloadPromises = new Map();

function preloadImage(url, priority = 'low') {
  const cleanUrl = (url || '').trim();
  if (!cleanUrl) return Promise.resolve();

  const encodedUrl = encodeURI(cleanUrl);
  if (imagePreloadPromises.has(encodedUrl)) {
    return imagePreloadPromises.get(encodedUrl);
  }

  const promise = new Promise(resolve => {
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = priority;
    img.onload = resolve;
    img.onerror = resolve;
    img.src = encodedUrl;
  });

  imagePreloadPromises.set(encodedUrl, promise);
  return promise;
}

function getWorkImageUrls(card, options = {}) {
  const includeDesc = options.includeDesc === true;
  const limit = Number.isFinite(options.limit) ? options.limit : Infinity;
  const urls = [];
  const multiImagesStr = card.dataset.images;
  if (multiImagesStr) {
    urls.push(...multiImagesStr.split(',').map(url => url.trim()).filter(Boolean));
  }

  card.querySelectorAll('.work-img img').forEach(img => {
    if (img.currentSrc || img.src) urls.push(img.getAttribute('src') || img.currentSrc || img.src);
  });

  if (includeDesc) {
    const desc = card.dataset.desc || '';
    desc.replace(/!\[[^\]]*]\(([^)]+)\)/g, (_, url) => {
      urls.push(url.trim());
      return '';
    });
  }

  return [...new Set(urls)].slice(0, limit);
}

function getPrimaryWorkImageUrl(card) {
  return getWorkImageUrls(card, { limit: 1 })[0] || '';
}

function preloadWorkImages(card, priority = 'low', options = {}) {
  return Promise.all(getWorkImageUrls(card, options).map(url => preloadImage(url, priority)));
}

function scheduleRestWorkImages(card) {
  const run = () => preloadWorkImages(card, 'low', { includeDesc: false });
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2200 });
  } else {
    setTimeout(run, 900);
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let listType = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      return;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      closeList();
      html.push('<hr>');
      return;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      html.push(`<h${heading[1].length}>${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
      return;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const nextListType = ordered ? 'ol' : 'ul';
      if (listType !== nextListType) {
        closeList();
        listType = nextListType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${renderInlineMarkdown((unordered || ordered)[1])}</li>`);
      return;
    }

    closeList();
    paragraph.push(line);
  });

  flushParagraph();
  closeList();
  return html.join('');
}

document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('mouseenter', () => preloadWorkImages(card, 'low', { limit: 2 }));
  card.addEventListener('touchstart', () => preloadWorkImages(card, 'low', { limit: 1 }), { passive: true });

  card.addEventListener('click', (e) => {
    e.preventDefault();
    preloadImage(getPrimaryWorkImageUrl(card), 'high');

    const tagEl = card.querySelector('.work-tag');
    const tag = tagEl ? tagEl.textContent : '';
    const title = card.dataset.title || '';
    const desc = card.dataset.desc || '';
    const img = card.dataset.img;
    const link = card.dataset.link || '#';

    modalTag.textContent = tag;
    modalTitle.textContent = title;
    modalDesc.innerHTML = renderMarkdown(desc);
    modalDesc.querySelectorAll('img').forEach(img => {
      if (/^\/pic\//.test(img.getAttribute('src') || '')) img.src = '.' + img.getAttribute('src');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = 'low';
    });

    const multiImagesStr = card.dataset.images;

    if (multiImagesStr) {
      const urls = multiImagesStr.split(',').filter(Boolean).map(u => u.trim().replace(/^\/+/, './'));
      let sliderHTML = '<div class="work-carousel-wrap" id="carouselWrap"><div class="work-carousel-track" id="carouselTrack">';
      
      urls.forEach((url, index) => {
        const priority = index === 0 ? 'high' : 'low';
        const loading = 'eager';
        sliderHTML += `<div class="work-carousel-item"><img src="${encodeURI(url.trim())}" alt="${title}" loading="${loading}" decoding="async" fetchpriority="${priority}"></div>`;
      });
      
      sliderHTML += '</div>';
      if (urls.length > 1) {
        sliderHTML += `<button class="work-carousel-nav prev" type="button" aria-label="上一张"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3L5 8l5 5"/></svg></button>`;
        sliderHTML += `<button class="work-carousel-nav next" type="button" aria-label="下一张"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg></button>`;
        sliderHTML += `<span class="work-carousel-count" aria-live="polite">1/${urls.length}</span>`;
      }
      sliderHTML += '<div class="work-carousel-dots">';
      urls.forEach((_, i) => {
        sliderHTML += `<div class="work-carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
      });
      sliderHTML += '</div></div>';
      modalImg.innerHTML = sliderHTML;
      modalImg.style.background = '#F7F6F2';
      modalImg.querySelectorAll('img').forEach(markLoadedImage);
      
      initCarousel(urls.length);
    } else if (img && img !== 'undefined' && img !== '') {
      modalImg.innerHTML = `<img src="${String(img).replace(/^\/+/, './')}" alt="${title}" loading="eager" decoding="async" fetchpriority="high">`;
      modalImg.style.background = '';
      modalImg.querySelectorAll('img').forEach(markLoadedImage);
    } else {
      modalImg.innerHTML = '';
      const workImg = card.querySelector('.work-img-inner');
      if (workImg && workImg.style.background) {
        modalImg.style.background = workImg.style.background;
      } else {
        modalImg.style.background = '#E0DDD5';
      }
    }

    document.querySelector('.work-modal-scroll-area').scrollTop = 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    scheduleRestWorkImages(card);
  });
});

let carouselCleanup = null;
let carouselDrag = { moved: false, x: 0 };
let suppressModalImageClick = false;

function initCarousel(total) {
  const wrap = document.querySelector('.work-carousel-wrap');
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.work-carousel-dot');
  const count = wrap.querySelector('.work-carousel-count');
  const prevBtn = wrap.querySelector('.work-carousel-nav.prev');
  const nextBtn = wrap.querySelector('.work-carousel-nav.next');
  if (!track || !wrap) return;

  let currentSlide = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isTransitioning = false;
  
  if (carouselCleanup) {
    carouselCleanup();
    carouselCleanup = null;
  }
  
  const getTrackWidth = () => wrap.clientWidth || window.innerWidth;

  const updateDots = () => {
    const dotIndex = currentSlide;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === dotIndex));
    if (count) count.textContent = `${dotIndex + 1}/${total}`;
    carouselCurrentIndex = dotIndex;
    if (prevBtn) {
      prevBtn.classList.toggle('disabled', dotIndex <= 0);
      prevBtn.disabled = dotIndex <= 0;
    }
    if (nextBtn) {
      nextBtn.classList.toggle('disabled', dotIndex >= total - 1);
      nextBtn.disabled = dotIndex >= total - 1;
    }
  };
  
  let snapTimer = 0;
  const minTranslate = () => -(total - 1) * getTrackWidth();
  const clampSlide = () => { currentSlide = Math.min(total - 1, Math.max(0, currentSlide)); };
  // Rubber-band: overshoot beyond the edges decays with 0.35x resistance.
  const rubberTranslate = (raw) => {
    const min = minTranslate(), max = 0;
    if (raw > max) return max + (raw - max) * 0.35;
    if (raw < min) return min + (raw - min) * 0.35;
    return raw;
  };
  const settleSlide = () => {
    clearTimeout(snapTimer);
    isTransitioning = false;
  };

  const setPositionByIndex = () => {
    isTransitioning = true;
    clampSlide();
    currentTranslate = currentSlide * -getTrackWidth();
    prevTranslate = currentTranslate;
    track.style.transition = 'transform 0.3s ease-out';
    track.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
    // Safety net: if 'transitionend' never fires (unchanged transform, hidden tab,
    // interrupted animation), settle the slide ourselves after the animation window.
    clearTimeout(snapTimer);
    snapTimer = setTimeout(settleSlide, 380);
  };

  track.addEventListener('transitionend', settleSlide);

  // Jump to the first slide without animation
  track.style.transition = 'none';
  currentTranslate = 0;
  prevTranslate = 0;
  track.style.transform = 'translateX(0px)';
  updateDots();

  const resizeHandler = () => {
    track.style.transition = 'none';
    currentTranslate = currentSlide * -getTrackWidth();
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  };
  window.addEventListener('resize', resizeHandler);

  const dotClickHandlers = [];
  dots.forEach((dot, i) => {
    const handler = () => {
      if (isTransitioning) return;
      currentSlide = i;
      setPositionByIndex();
    };
    dot.addEventListener('click', handler);
    dotClickHandlers.push({dot, handler});
  });

  const navPrev = () => { if (!isTransitioning && currentSlide > 0) { currentSlide -= 1; setPositionByIndex(); } };
  const navNext = () => { if (!isTransitioning && currentSlide < total - 1) { currentSlide += 1; setPositionByIndex(); } };
  prevBtn?.addEventListener('click', navPrev);
  nextBtn?.addEventListener('click', navNext);
  const getPositionX = (e) => (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);

  const touchStart = (e) => {
    if (isTransitioning) return;
    if (e.target.closest && e.target.closest('.work-carousel-nav, .work-carousel-dot')) return;
    isDragging = true;
    carouselDrag = { moved: false, x: getPositionX(e) };
    startX = getPositionX(e);
    track.style.transition = 'none';
  };

  const touchMove = (e) => {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    if (carouselDrag && Math.abs(currentPosition - carouselDrag.x) > 8) {
      carouselDrag.moved = true;
      wrap.classList.add('is-dragging');
    }
    currentTranslate = rubberTranslate(prevTranslate + currentPosition - startX);
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const touchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('is-dragging');
    const movedBy = currentTranslate - prevTranslate;
    const threshold = getTrackWidth() * 0.15;

    if (movedBy < -threshold && currentSlide < total - 1) {
      currentSlide += 1;
    } else if (movedBy > threshold && currentSlide > 0) {
      currentSlide -= 1;
    }

    setPositionByIndex();
  };

  // Gesture arbiter: runs independently of the carousel animation state.
  // A horizontal move always wins over opening the image, even if the carousel
  // happens to be finishing its previous snap animation.
  let gestureStartX = null;
  let gestureMoved = false;
  const gestureX = e => e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? e.clientX;
  const gestureStart = e => { gestureStartX = gestureX(e); gestureMoved = false; };
  const gestureMove = e => {
    if (gestureStartX === null) return;
    if (Math.abs(gestureX(e) - gestureStartX) > 8) gestureMoved = true;
  };
  const gestureEnd = () => {
    if (gestureMoved) {
      suppressModalImageClick = true;
      // Keep the guard through browsers' synthetic click after touchend/mouseup.
      window.setTimeout(() => { suppressModalImageClick = false; }, 500);
    }
    gestureStartX = null;
  };
  const suppressClick = e => {
    if (!suppressModalImageClick) return;
    suppressModalImageClick = false;
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  wrap.addEventListener('mousedown', gestureStart, true);
  wrap.addEventListener('touchstart', gestureStart, { passive: true, capture: true });
  window.addEventListener('mousemove', gestureMove, true);
  window.addEventListener('touchmove', gestureMove, { passive: true, capture: true });
  window.addEventListener('mouseup', gestureEnd, true);
  window.addEventListener('touchend', gestureEnd, true);
  wrap.addEventListener('click', suppressClick, true);
  // Disabled-state arrows must be fully inert: capture-phase block BEFORE any
  // bubble handler (including the media-area lightbox opener) can see them.
  wrap.addEventListener('click', e => {
    const nav = e.target.closest('.work-carousel-nav');
    if (nav && nav.classList.contains('disabled')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      toastEdge(nav === prevBtn ? '已经是第一张图片～' : '已经是最后一张图片～');
    }
  }, true);

  wrap.addEventListener('mousedown', touchStart);
  wrap.addEventListener('touchstart', touchStart, {passive: true});
  window.addEventListener('mouseup', touchEnd);
  wrap.addEventListener('touchend', touchEnd);
  window.addEventListener('mousemove', touchMove);
  wrap.addEventListener('touchmove', touchMove, {passive: true});
  
  carouselCleanup = () => {
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('mouseup', touchEnd);
    window.removeEventListener('mousemove', touchMove);
    wrap.removeEventListener('mousedown', gestureStart, true);
    wrap.removeEventListener('touchstart', gestureStart, true);
    window.removeEventListener('mousemove', gestureMove, true);
    window.removeEventListener('touchmove', gestureMove, true);
    window.removeEventListener('mouseup', gestureEnd, true);
    window.removeEventListener('touchend', gestureEnd, true);
    wrap.removeEventListener('click', suppressClick, true);
    track.removeEventListener('transitionend', settleSlide);
    clearTimeout(snapTimer);
    dotClickHandlers.forEach(({dot, handler}) => dot.removeEventListener('click', handler));
    prevBtn?.removeEventListener('click', navPrev);
    nextBtn?.removeEventListener('click', navNext);
  };
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (carouselCleanup) {
    carouselCleanup();
    carouselCleanup = null;
  }
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !lbState.open) closeModal();
});


/* ─── Image Lightbox ─── */
const lightbox = document.getElementById('imgLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxStage = document.getElementById('lightboxStage');
const lbClose = document.getElementById('lightboxClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbCounter = document.getElementById('lbCounter');
const lbZoomIn = document.getElementById('lbZoomIn');
const lbZoomOut = document.getElementById('lbZoomOut');
const lbZoomLabel = document.getElementById('lbZoomLabel');
const lbFit = document.getElementById('lbFit');
const lbActual = document.getElementById('lbActual');

const lbState = { urls: [], index: 0, scale: 1, open: false };
const SCALE_STEP = 1.25;
const SCALE_MIN = 0.2;
const SCALE_MAX = 6;

function lbApplyTransform() {
  lightboxImg.style.transform = `scale(${lbState.scale})`;
  lbZoomLabel.textContent = Math.round(lbState.scale * 100) + '%';
}

function lbShow(i) {
  if (!lbState.urls.length) return;
  lbState.index = (i + lbState.urls.length) % lbState.urls.length;
  lbState.scale = 1;
  lightboxImg.classList.remove('loaded');
  // Fade in once the image is decoded (cached images decode instantly too).
  const url = lbState.urls[lbState.index];
  const decode = () => {
    if (lbState.urls[lbState.index] !== url) return;
    lightboxImg.classList.add('loaded');
  };
  if (lightboxImg.decode) {
    lightboxImg.src = url;
    lightboxImg.decode().then(decode).catch(() => { lightboxImg.onload = decode; });
  } else {
    lightboxImg.onload = decode;
    lightboxImg.src = url;
  }
  lbApplyTransform();
  lbCounter.textContent = `${lbState.index + 1}/${lbState.urls.length}`;
  const single = lbState.urls.length <= 1;
  lbPrev.classList.toggle('disabled', single);
  lbNext.classList.toggle('disabled', single);
}

function lbOpen(urls, index = 0) {
  lbState.urls = urls;
  lbState.open = true;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lbShow(index);
}

function lbCloseFn() {
  lbState.open = false;
  lightbox.classList.remove('active');
  lightboxImg.src = '';
  // Restore scroll only if the work modal is no longer open on top.
  const modalStillOpen = document.getElementById('workModal')?.classList.contains('active');
  document.body.style.overflow = modalStillOpen ? 'hidden' : '';
}

lbClose.addEventListener('click', lbCloseFn);
lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) lbCloseFn(); });
document.addEventListener('keydown', e => {
  if (!lbState.open) return;
  if (e.key === 'Escape') lbCloseFn();
  else if (e.key === 'ArrowLeft') lbShow(lbState.index - 1);
  else if (e.key === 'ArrowRight') lbShow(lbState.index + 1);
});
lbPrev.addEventListener('click', () => lbShow(lbState.index - 1));
lbNext.addEventListener('click', () => lbShow(lbState.index + 1));
lbZoomIn.addEventListener('click', () => { lbState.scale = Math.min(SCALE_MAX, lbState.scale * SCALE_STEP); lbApplyTransform(); });
lbZoomOut.addEventListener('click', () => { lbState.scale = Math.max(SCALE_MIN, lbState.scale / SCALE_STEP); lbApplyTransform(); });
lbFit.addEventListener('click', () => { lbState.scale = 1; lbApplyTransform(); });
lbActual.addEventListener('click', () => {
  const nat = lightboxImg.naturalWidth || 1;
  const shown = lightboxImg.getBoundingClientRect().width / lbState.scale;
  lbState.scale = Math.min(SCALE_MAX, nat / shown);
  lbApplyTransform();
});

// wheel zoom
lightboxStage.addEventListener('wheel', e => {
  if (!lbState.open) return;
  e.preventDefault();
  const factor = e.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP;
  lbState.scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, lbState.scale * factor));
  lbApplyTransform();
}, { passive: false });

// drag pan (when zoomed)
let lbDrag = null;
lightboxStage.addEventListener('mousedown', e => {
  if (lbState.scale <= 1) return;
  lbDrag = { x: e.clientX, y: e.clientY, ox: lbPan.x, oy: lbPan.y };
  lightboxStage.classList.add('dragging');
});
let lbPan = { x: 0, y: 0 };
window.addEventListener('mousemove', e => {
  if (!lbDrag) return;
  lbPan = { x: lbDrag.ox + (e.clientX - lbDrag.x), y: lbDrag.oy + (e.clientY - lbDrag.y) };
  lightboxImg.style.translate = `${lbPan.x}px ${lbPan.y}px`;
});
window.addEventListener('mouseup', () => { lbDrag = null; lightboxStage.classList.remove('dragging'); });

// 双击：100% ↔ 适应
lightboxImg.addEventListener('dblclick', () => { lbState.scale = lbState.scale === 1 ? Math.min(SCALE_MAX, (lightboxImg.naturalWidth || 1) / (lightboxImg.getBoundingClientRect().width || 1)) : 1; lbApplyTransform(); });

// 点击弹窗左图 / 正文图片打开 lightbox
// Expose the carousel's current real slide index so the click opener can use it.
let carouselCurrentIndex = 0;

// Edge toast: small floating hint when hitting the first/last slide.
let edgeToastTimer = 0;
function toastEdge(text) {
  let el = document.getElementById('carouselEdgeToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'carouselEdgeToast';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(edgeToastTimer);
  edgeToastTimer = setTimeout(() => el.classList.remove('show'), 1400);
}

modalImg.addEventListener('click', e => {
  if (suppressModalImageClick) return;
  // Arrows and dots manage slides themselves; don't treat them as "view image".
  if (e.target.closest('.work-carousel-nav, .work-carousel-dot')) return;
  // Carousel case: the whole media area is the click target (imgs are pointer-events:none for dragging).
  const track = document.getElementById('carouselTrack');
  if (track) {
    const real = [...track.querySelectorAll('.work-carousel-item:not(.clone) img')];
    const ready = real.filter(i => i.naturalWidth > 0);
    if (!ready.length) return;
    const idx = Math.min(Math.max(0, carouselCurrentIndex), real.length - 1);
    lbOpen(real.map(i => i.currentSrc || i.src), idx);
    return;
  }
  const img = e.target.closest('img');
  if (!img || !img.naturalWidth) return;
  e.stopPropagation();
  lbOpen([img.currentSrc || img.src], 0);
});
modalDesc.addEventListener('click', e => {
  const img = e.target.closest('img');
  if (!img || !img.naturalWidth) return;
  e.preventDefault();
  const all = [...modalDesc.querySelectorAll('img')].map(i => i.currentSrc || i.src);
  lbOpen(all, all.indexOf(img.currentSrc || img.src));
});
