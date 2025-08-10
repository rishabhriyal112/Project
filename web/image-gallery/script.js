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

  // Load from RapidAPI: real-time-image-search
  async function loadFromApi(){
    const url = 'https://real-time-image-search.p.rapidapi.com/search?query=beach&limit=24&size=any&color=any&type=any&time=any&usage_rights=any&file_type=any&aspect_ratio=any&safe_search=off&region=us';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'ba813f2b2fmshd8b9eead5467a7ap1f2cc7jsn4f970bc22213',
        'x-rapidapi-host': 'real-time-image-search.p.rapidapi.com'
      }
    };
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Network response was not ok');
      // Some endpoints return text; try JSON first and fallback
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = JSON.parse(text);
      }
      // Normalize: expect either { data: [...] } or an array
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const cats = ['nature', 'city', 'people'];
      items = arr.slice(0, 24).map((d, i) => {
        const src = d.image || d.url || d.image_url || d.thumbnail || d.thumbnailUrl || '';
        const caption = d.title || d.caption || d.source || d.domain || 'Image';
        const cat = cats[i % cats.length];
        return { src, caption, cat };
      }).filter(it => Boolean(it.src));
      if (items.length === 0) throw new Error('No images returned from API');
      render();
    } catch (err){
      console.error('Failed to load images', err);
      galleryEl.innerHTML = '<p style="text-align:center;color:#666">Failed to load images from API. Please check your API key or try again later.</p>';
    }
  }

  // Initial state
  galleryEl.innerHTML = '<p style="text-align:center;color:#666">Loading images…</p>';
  loadFromApi();
})();
