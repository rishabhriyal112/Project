(function(){
  const galleryEl = document.getElementById('gallery');
  const filtersEl = document.getElementById('filters');
  const lightboxEl = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  // Items loaded from API
  let items = [];

  let currentIndex = 0;
  let activeFilter = 'all';

  function render(){
    galleryEl.innerHTML = '';
    const list = items
      .map((it, idx) => ({...it, idx}))
      .filter(it => activeFilter === 'all' ? true : it.cat === activeFilter);

    list.forEach(it => {
      const card = document.createElement('div');
      card.className = 'card';
      card.tabIndex = 0; // keyboard focusable
      card.innerHTML = `
        <img src="${it.src}" alt="${it.caption}" loading="lazy" />
        <span class="badge">${it.cat}</span>
      `;
      card.addEventListener('click', () => openLightbox(it.idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openLightbox(it.idx);
        }
      });
      galleryEl.appendChild(card);
    });
  }

  function setActiveFilter(filter){
    activeFilter = filter;
    [...filtersEl.querySelectorAll('button')].forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    render();
  }

  function openLightbox(idx){
    currentIndex = idx;
    const it = items[currentIndex];
    lbImg.src = it.src;
    lbCaption.textContent = `${it.caption} · ${it.cat}`;
    lightboxEl.classList.add('open');
    lightboxEl.setAttribute('aria-hidden', 'false');
    // lock scroll
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightboxEl.classList.remove('open');
    lightboxEl.setAttribute('aria-hidden', 'true');
    // restore scroll
    document.body.style.overflow = '';
  }

  function prev(){
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    openLightbox(currentIndex);
  }

  function next(){
    currentIndex = (currentIndex + 1) % items.length;
    openLightbox(currentIndex);
  }

  // Events
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    setActiveFilter(btn.dataset.filter);
  });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Load from JSONPlaceholder
  async function loadFromApi(){
    try {
      // Fetch a limited set for performance
      const res = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=24');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      // Map albumId to our categories
      const catMap = (albumId) => {
        const n = Number(albumId) % 3;
        if (n === 0) return 'nature';
        if (n === 1) return 'city';
        return 'people';
      };
      items = data.map(d => ({
        src: d.url, // large image
        thumb: d.thumbnailUrl,
        caption: d.title,
        cat: catMap(d.albumId)
      }));
      render();
    } catch (err){
      console.error('Failed to load images', err);
      galleryEl.innerHTML = '<p style="text-align:center;color:#666">Failed to load images. Please try again later.</p>';
    }
  }

  // Initial state
  galleryEl.innerHTML = '<p style="text-align:center;color:#666">Loading images…</p>';
  loadFromApi();
})();
