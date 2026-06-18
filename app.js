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
  if (img instanceof HTMLImageElement && img.complete) {
    img.classList.add('loaded');
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
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = 'low';
    });

    const multiImagesStr = card.dataset.images;

    if (multiImagesStr) {
      const urls = multiImagesStr.split(',').filter(Boolean);
      let sliderHTML = '<div class="work-carousel-wrap" id="carouselWrap"><div class="work-carousel-track" id="carouselTrack">';
      
      // Infinite tracking: clone last slide
      sliderHTML += `<div class="work-carousel-item clone"><img src="${encodeURI(urls[urls.length - 1].trim())}" alt="${title}" loading="lazy" decoding="async" fetchpriority="low"></div>`;
      
      urls.forEach((url, index) => {
        const priority = index === 0 ? 'high' : 'low';
        const loading = index === 0 ? 'eager' : 'lazy';
        sliderHTML += `<div class="work-carousel-item"><img src="${encodeURI(url.trim())}" alt="${title}" loading="${loading}" decoding="async" fetchpriority="${priority}"></div>`;
      });
      
      // Infinite tracking: clone first slide
      sliderHTML += `<div class="work-carousel-item clone"><img src="${encodeURI(urls[0].trim())}" alt="${title}" loading="lazy" decoding="async" fetchpriority="low"></div>`;

      sliderHTML += '</div><div class="work-carousel-dots">';
      urls.forEach((_, i) => {
        sliderHTML += `<div class="work-carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
      });
      sliderHTML += '</div></div>';
      modalImg.innerHTML = sliderHTML;
      modalImg.style.background = '#F7F6F2';
      modalImg.querySelectorAll('img').forEach(markLoadedImage);
      
      initCarousel(urls.length);
    } else if (img && img !== 'undefined' && img !== '') {
      modalImg.innerHTML = `<img src="${img}" alt="${title}" loading="eager" decoding="async" fetchpriority="high">`;
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

function initCarousel(total) {
  const wrap = document.querySelector('.work-carousel-wrap');
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.work-carousel-dot');
  if (!track || !wrap) return;

  let currentSlide = 1;
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
    let dotIndex = currentSlide - 1;
    if (dotIndex < 0) dotIndex = total - 1;
    if (dotIndex >= total) dotIndex = 0;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === dotIndex));
  };
  
  const setPositionByIndex = () => {
    isTransitioning = true;
    currentTranslate = currentSlide * -getTrackWidth();
    prevTranslate = currentTranslate;
    track.style.transition = 'transform 0.3s ease-out';
    track.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
  };

  const handleTransitionEnd = () => {
    isTransitioning = false;
    if (currentSlide === 0) {
      track.style.transition = 'none';
      currentSlide = total;
      currentTranslate = currentSlide * -getTrackWidth();
      prevTranslate = currentTranslate;
      track.style.transform = `translateX(${currentTranslate}px)`;
    } else if (currentSlide === total + 1) {
      track.style.transition = 'none';
      currentSlide = 1;
      currentTranslate = currentSlide * -getTrackWidth();
      prevTranslate = currentTranslate;
      track.style.transform = `translateX(${currentTranslate}px)`;
    }
  };

  track.addEventListener('transitionend', handleTransitionEnd);

  // Jump to the first actual slide without animation
  track.style.transition = 'none';
  currentTranslate = currentSlide * -getTrackWidth();
  prevTranslate = currentTranslate;
  track.style.transform = `translateX(${currentTranslate}px)`;

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
      currentSlide = i + 1;
      setPositionByIndex();
    };
    dot.addEventListener('click', handler);
    dotClickHandlers.push({dot, handler});
  });

  const getPositionX = (e) => (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);

  const touchStart = (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startX = getPositionX(e);
    track.style.transition = 'none';
  };

  const touchMove = (e) => {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    currentTranslate = prevTranslate + currentPosition - startX;
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const touchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    const threshold = getTrackWidth() * 0.15;

    if (movedBy < -threshold) {
      currentSlide += 1;
    } else if (movedBy > threshold) {
      currentSlide -= 1;
    }
    
    setPositionByIndex();
  };

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
    track.removeEventListener('transitionend', handleTransitionEnd);
    dotClickHandlers.forEach(({dot, handler}) => dot.removeEventListener('click', handler));
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
