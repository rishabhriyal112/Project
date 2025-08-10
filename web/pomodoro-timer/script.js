(function(){
  // UI elements
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const statusText = document.getElementById('statusText');

  // Segment buttons
  const segWorkBtn = document.getElementById('segWork');
  const segShortBtn = document.getElementById('segShort');
  const segLongBtn = document.getElementById('segLong');

  // Settings inputs
  const workMinsInput = document.getElementById('workMins');
  const shortMinsInput = document.getElementById('shortMins');
  const longMinsInput = document.getElementById('longMins');

  // State
  let currentSeg = 'work'; // work | short | long
  let durations = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };
  let totalSeconds = durations.work;
  let remaining = totalSeconds;
  let timerId = null;
  let running = false;

  // Helpers
  function fmt(n){ return String(n).padStart(2,'0'); }

  function render(){
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    minutesEl.textContent = fmt(m);
    secondsEl.textContent = fmt(s);
    document.title = `${fmt(m)}:${fmt(s)} • Pomodoro`;
  }

  function setStatus(text){
    if (statusText) statusText.textContent = text;
  }

  function clearTick(){
    if (timerId){ clearInterval(timerId); timerId = null; }
  }

  function tick(){
    if (remaining > 0){
      remaining -= 1;
      render();
      if (remaining === 0){
        clearTick();
        running = false;
        setStatus('Time\'s up!');
        // simple end feedback (non-blocking)
        try { new (window.AudioContext || window.webkitAudioContext)(); } catch {}
      }
    }
  }

  function start(){
    if (running) return;
    running = true;
    setStatus('Running');
    if (!timerId){ timerId = setInterval(tick, 1000); }
  }

  function pause(){
    running = false;
    setStatus('Paused');
    clearTick();
  }

  function reset(){
    pause();
    remaining = totalSeconds;
    setStatus('Ready');
    render();
  }

  function parseMinutes(inputEl, fallback){
    const v = parseInt(inputEl?.value, 10);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  }

  function refreshDurationsFromInputs(){
    durations.work = parseMinutes(workMinsInput, 25) * 60;
    durations.short = parseMinutes(shortMinsInput, 5) * 60;
    durations.long  = parseMinutes(longMinsInput, 15) * 60;
  }

  function activateSegButton(seg){
    [segWorkBtn, segShortBtn, segLongBtn].forEach(btn => btn?.classList.remove('active'));
    if (seg === 'work') segWorkBtn?.classList.add('active');
    if (seg === 'short') segShortBtn?.classList.add('active');
    if (seg === 'long') segLongBtn?.classList.add('active');
  }

  function switchSegment(seg){
    currentSeg = seg;
    refreshDurationsFromInputs();
    totalSeconds = durations[seg];
    remaining = totalSeconds;
    activateSegButton(seg);
    setStatus(seg === 'work' ? 'Pomodoro' : seg === 'short' ? 'Short Break' : 'Long Break');
    render();
  }

  // Wire events
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);

  segWorkBtn?.addEventListener('click', () => switchSegment('work'));
  segShortBtn?.addEventListener('click', () => switchSegment('short'));
  segLongBtn?.addEventListener('click', () => switchSegment('long'));

  // Update durations when settings change; if not running, also reset remaining
  [workMinsInput, shortMinsInput, longMinsInput].forEach((el) => {
    el?.addEventListener('change', () => {
      const wasRunning = running;
      refreshDurationsFromInputs();
      totalSeconds = durations[currentSeg];
      if (!wasRunning){ remaining = totalSeconds; render(); }
    });
  });

  // init
  refreshDurationsFromInputs();
  switchSegment('work');
})();
