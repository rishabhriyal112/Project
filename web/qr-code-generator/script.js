(function(){
  const input = document.getElementById('qrText');
  const canvas = document.getElementById('qrCanvas');
  const statusEl = document.getElementById('qrStatus');
  const btnGenerate = document.getElementById('generate');
  const btnDownload = document.getElementById('download');
  const btnClear = document.getElementById('clear');
  const LS_KEY = 'qr_code_generator_settings_v1';
  const DEFAULTS = { size: 512, margin: 4, ecc: 'M' };

  function encodeQuery(q){
    return encodeURIComponent(q).replace(/%20/g,'+');
  }

  function apiUrl(text, size, margin){
    const px = `${size}x${size}`;
    // Using api.qrserver.com for fallback generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=${px}&margin=${margin}&data=${encodeQuery(text)}`;
  }

  async function drawFromImageUrl(url, size){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,size,size);
        ctx.drawImage(img, 0, 0, size, size);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load QR PNG'));
      img.src = url;
    });
  }

  async function ensureQRCodeLib(){
    if (statusEl) statusEl.textContent = 'Loading QR library…';
    if (window.QRCode && typeof window.QRCode.toCanvas === 'function') return;
    const cdns = [
      'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
      'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js'
    ];
    for (const src of cdns){
      try {
        await loadScript(src);
        if (window.QRCode && typeof window.QRCode.toCanvas === 'function') return;
      } catch {}
    }
    throw new Error('Failed to load QRCode library');
  }

  function loadScript(src){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.text === 'string') input.value = s.text;
    } catch {}
  }

  function saveState(){
    const state = {
      text: input.value.trim(),
      size: DEFAULTS.size,
      margin: DEFAULTS.margin,
      ecc: DEFAULTS.ecc
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }

  async function generate(){
    let libLoaded = true;
    try { await ensureQRCodeLib(); if (statusEl) statusEl.textContent = ''; }
    catch (e){
      console.warn('QRCode lib load failed, using API fallback.', e);
      libLoaded = false;
    }
    const text = input.value.trim();
    const size = DEFAULTS.size;
    const margin = DEFAULTS.margin;
    const ecc = DEFAULTS.ecc;

    canvas.width = size;
    canvas.height = size;

    if (!text){
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto';
      ctx.textAlign = 'center';
      ctx.fillText('Enter text or URL to generate a QR code', size/2, Math.floor(size/2));
      return;
    }

    try {
      if (libLoaded){
        await QRCode.toCanvas(canvas, text, {
          errorCorrectionLevel: ecc,
          width: size,
          margin: margin,
          color: { dark: '#000000', light: '#ffffff' }
        });
      } else {
        const url = apiUrl(text, size, margin);
        await drawFromImageUrl(url, size);
      }
      saveState();
      if (statusEl) statusEl.textContent = 'QR generated successfully.';
    } catch (err){
      console.error('Failed to generate QR', err);
      if (!libLoaded){
        if (statusEl) statusEl.textContent = 'Fallback API failed to generate QR.';
      } else {
        // Library failed after load; try fallback once
        try {
          const url = apiUrl(text, size, margin);
          await drawFromImageUrl(url, size);
          saveState();
          if (statusEl) statusEl.textContent = 'QR generated via fallback API.';
        } catch (e2){
          console.error('Fallback API also failed', e2);
          if (statusEl) statusEl.textContent = 'Failed to generate QR via both library and fallback API.';
        }
      }
    }
  }

  function clearAll(){
    input.value = '';
    generate();
  }

  btnGenerate.addEventListener('click', generate);
  btnClear.addEventListener('click', clearAll);
  btnDownload.addEventListener('click', async () => {
    const name = (input.value.trim() || 'qr-code').slice(0, 50).replace(/\s+/g, '-');
    try {
      const dataURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err){
      console.warn('Canvas toDataURL failed, offering direct PNG link.', err);
      // Offer direct image link from fallback API
      const url = apiUrl(input.value.trim() || 'hello', DEFAULTS.size, DEFAULTS.margin);
      window.open(url, '_blank');
    }
  });

  // Generate live when values change
  input.addEventListener('input', () => {
    clearTimeout(input.__debounce);
    input.__debounce = setTimeout(generate, 250);
  });

  // Enter to generate
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generate();
    }
  });

  // Initial render
  loadState();
  generate();
})();
