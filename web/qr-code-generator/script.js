(function(){
  const input = document.getElementById('qrText');
  const sizeInput = document.getElementById('qrSize');
  const marginInput = document.getElementById('qrMargin');
  const eccSelect = document.getElementById('qrEcc');
  const canvas = document.getElementById('qrCanvas');
  const btnGenerate = document.getElementById('generate');
  const btnDownload = document.getElementById('download');
  const btnClear = document.getElementById('clear');
  const LS_KEY = 'qr_code_generator_settings_v1';

  function loadState(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.text === 'string') input.value = s.text;
      if (typeof s.size === 'number') sizeInput.value = s.size;
      if (typeof s.margin === 'number') marginInput.value = s.margin;
      if (typeof s.ecc === 'string') eccSelect.value = s.ecc;
    } catch {}
  }

  function saveState(){
    const state = {
      text: input.value.trim(),
      size: Number(sizeInput.value) || 256,
      margin: Number(marginInput.value) || 2,
      ecc: eccSelect.value || 'M'
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }

  async function generate(){
    const text = input.value.trim();
    const size = Math.max(100, Math.min(1024, Number(sizeInput.value) || 256));
    const margin = Math.max(0, Math.min(8, Number(marginInput.value) || 2));
    const ecc = eccSelect.value || 'M';

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
      await QRCode.toCanvas(canvas, text, {
        errorCorrectionLevel: ecc,
        width: size,
        margin: margin,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      saveState();
    } catch (err){
      console.error('Failed to generate QR', err);
    }
  }

  function clearAll(){
    input.value = '';
    generate();
  }

  btnGenerate.addEventListener('click', generate);
  btnClear.addEventListener('click', clearAll);
  btnDownload.addEventListener('click', () => {
    try {
      const dataURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const name = (input.value.trim() || 'qr-code').slice(0, 50).replace(/\s+/g, '-');
      a.href = dataURL;
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err){
      console.error('Download failed', err);
    }
  });

  // Generate live when values change
  [input, sizeInput, marginInput, eccSelect].forEach(el => {
    el.addEventListener('input', () => {
      // debounce slightly for text
      if (el === input){
        clearTimeout(el.__debounce);
        el.__debounce = setTimeout(generate, 250);
      } else {
        generate();
      }
    });
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
