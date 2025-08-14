(function(){
  const display = document.getElementById('display');
  const btnStart = document.getElementById('start');
  const btnPause = document.getElementById('pause');
  const btnReset = document.getElementById('reset');
  const btnLap = document.getElementById('lap');
  const btnTheme = document.getElementById('theme');
  const lapsEl = document.getElementById('laps');
  const body = document.body;

  let running = false;
  let startTs = 0;         // timestamp when started (ms)
  let accElapsed = 0;      // accumulated elapsed while paused (ms)
  let rAF = 0;             // requestAnimationFrame id
  let lapCount = 0;

  function format(ms){
    const total = Math.max(0, Math.floor(ms));
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const centi = Math.floor((total % 1000) / 10);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centi).padStart(2,'0')}`;
  }

  function render(){
    if (!running) return;
    const now = performance.now();
    const elapsed = accElapsed + (now - startTs);
    display.textContent = format(elapsed);
    rAF = requestAnimationFrame(render);
  }

  function setButtons(){
    btnStart.disabled = running;
    btnPause.disabled = !running;
    btnReset.disabled = running && accElapsed === 0; // allow reset anytime paused with non-zero
    btnLap.disabled = !running;
  }

  function start(){
    if (running) return;
    running = true;
    startTs = performance.now();
    setButtons();
    rAF = requestAnimationFrame(render);
  }

  function pause(){
    if (!running) return;
    running = false;
    cancelAnimationFrame(rAF);
    const now = performance.now();
    accElapsed += (now - startTs);
    display.textContent = format(accElapsed);
    setButtons();
  }

  function reset(){
    running = false;
    cancelAnimationFrame(rAF);
    accElapsed = 0;
    lapCount = 0;
    display.textContent = '00:00.00';
    lapsEl.innerHTML = '';
    setButtons();
  }

  function lap(){
    if (!running) return;
    const now = performance.now();
    const elapsed = accElapsed + (now - startTs);
    lapCount += 1;
    const li = document.createElement('li');
    li.innerHTML = `<span class="badge">Lap ${lapCount}</span><span>${format(elapsed)}</span>`;
    lapsEl.prepend(li);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's') start();     // S = start
    if (e.key.toLowerCase() === 'p') pause();     // P = pause
    if (e.key.toLowerCase() === 'r') reset();     // R = reset
    if (e.key.toLowerCase() === 'l') lap();       // L = lap
  });

  // Theme toggle
  function toggleTheme() {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    btnTheme.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('stopwatch-theme', isLight ? 'light' : 'dark');
  }

  // Load saved theme
  if (localStorage.getItem('stopwatch-theme') === 'light') {
    body.classList.add('light-theme');
    btnTheme.textContent = '🌙';
  }

  // Wire buttons
  btnStart.addEventListener('click', start);
  btnPause.addEventListener('click', pause);
  btnReset.addEventListener('click', reset);
  btnLap.addEventListener('click', lap);
  btnTheme.addEventListener('click', toggleTheme);

  // Initial
  setButtons();
})();
