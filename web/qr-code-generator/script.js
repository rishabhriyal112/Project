(function(){
  const input = document.getElementById('qrText');
  const sizeInput = document.getElementById('qrSize');
  const marginInput = document.getElementById('qrMargin');
  const eccSelect = document.getElementById('qrEcc');
  const canvas = document.getElementById('qrCanvas');
  const btnGenerate = document.getElementById('generate');
  const btnDownload = document.getElementById('download');
  const btnClear = document.getElementById('clear');

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
      ctx.fillText('Enter text or URL to generate a QR code', size/2, size/2);
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
    // placeholder; proper implementation in next commit
    alert('Generate a QR first, then we will add download support.');
  });

  // Initial render
  generate();
})();
