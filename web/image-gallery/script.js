(function(){
  const galleryEl = document.getElementById('gallery');
  const filtersEl = document.getElementById('filters');
  const lightboxEl = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  // Demo items (Unsplash)
  const items = [
    {src:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', cat:'nature', caption:'Mountain Sunrise'},
    {src:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', cat:'city', caption:'City Skyline'},
    {src:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop', cat:'people', caption:'Portrait in Light'},
    {src:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', cat:'nature', caption:'Forest Path'},
    {src:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', cat:'nature', caption:'Desert Dunes'},
    {src:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop', cat:'city', caption:'Old Town Street'},
    {src:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop', cat:'people', caption:'Smiling Woman'},
    {src:'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop', cat:'people', caption:'Casual Style'},
  ];

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

  // Init
  render();
})();
