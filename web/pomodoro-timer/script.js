(function(){
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');

  let totalSeconds = 25 * 60; // 25:00 default
  let remaining = totalSeconds;
  let timerId = null;
  let running = false;

  function fmt(n){ return String(n).padStart(2,'0'); }

  function render(){
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    minutesEl.textContent = fmt(m);
    secondsEl.textContent = fmt(s);
    document.title = `${fmt(m)}:${fmt(s)} • Pomodoro`;
  }

  function tick(){
    if (remaining > 0){
      remaining -= 1;
      render();
      if (remaining === 0){
        clearInterval(timerId);
        timerId = null;
        running = false;
        // simple end feedback
        try { new AudioContext(); } catch {}
      }
    }
  }

  function start(){
    if (running) return;
    running = true;
    if (!timerId){ timerId = setInterval(tick, 1000); }
  }

  function pause(){
    running = false;
    if (timerId){ clearInterval(timerId); timerId = null; }
  }

  function reset(){
    pause();
    remaining = totalSeconds;
    render();
  }

  // init
  render();
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);
})();
