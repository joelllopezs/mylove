/* -------------------------------------------------------
     CONFIGURAÇÕES — edite apenas este bloco
  ------------------------------------------------------- */
 const CONFIG = {
  MUSIC_URL:   './assets/sounds/music.mp3',
  MUSIC_NAME:  'Nosso Primeiro Valentine Days',
  MUSIC_COVER: './assets/fotos/capa.jpeg',
  START_DATE:  new Date(2026, 3, 11)
};
  /* ------------------------------------------------------- */


  /* =========================================================
     PLAYER
  ========================================================= */
  (function initPlayer() {
    const audio   = document.getElementById('audio-player');
    const btnPlay = document.getElementById('btn-play');
    const btnBwd  = document.getElementById('btn-backward');
    const btnFwd  = document.getElementById('btn-forward');
    const fill    = document.getElementById('progress-fill');
    const bar     = document.getElementById('progress-bar');
    const tCur    = document.getElementById('time-current');
    const tTot    = document.getElementById('time-total');
    const eq      = document.getElementById('equalizer');
    const coverW  = document.getElementById('cover-wrap');

    audio.src = CONFIG.MUSIC_URL;
    document.getElementById('song-name').textContent = CONFIG.MUSIC_NAME;
    document.getElementById('cover-img').src         = CONFIG.MUSIC_COVER;

    let isPlaying = false;

    function formatTime(s) {
      if (!isFinite(s)) return '0:00';
      return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    }

    function setPlaying(state) {
      isPlaying = state;
      btnPlay.textContent = state ? '⏸' : '▶';
      eq.classList.toggle('paused', !state);
      coverW.classList.toggle('playing', state);
    }

    audio.addEventListener('canplay', () => {
      tTot.textContent = formatTime(audio.duration);
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      tCur.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => { audio.currentTime = 0; audio.play(); });

    btnPlay.addEventListener('click', () => {
      isPlaying ? (audio.pause(), setPlaying(false)) : (audio.play(), setPlaying(true));
    });

    btnBwd.addEventListener('click', () => { audio.currentTime = 0; });
    btnFwd.addEventListener('click', () => { audio.currentTime = Math.min(audio.currentTime + 10, audio.duration); });

    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  })();


  /* =========================================================
     CONTADOR DE TEMPO
  ========================================================= */
  (function initCounter() {
    const start = CONFIG.START_DATE;

    function tick() {
      const now = new Date();

      let years  = now.getFullYear()  - start.getFullYear();
      let months = now.getMonth()     - start.getMonth();
      let days   = now.getDate()      - start.getDate();

      if (days < 0)   { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }

      const base = new Date(
        start.getFullYear() + years,
        start.getMonth()    + months,
        start.getDate()     + days,
        start.getHours(), start.getMinutes(), start.getSeconds()
      );
      let rem = now - base;
      const hours   = Math.floor(rem / 3600000); rem %= 3600000;
      const minutes = Math.floor(rem / 60000);   rem %= 60000;
      const seconds = Math.floor(rem / 1000);

      document.getElementById('cnt-years').textContent   = years;
      document.getElementById('cnt-months').textContent  = months;
      document.getElementById('cnt-days').textContent    = days;
      document.getElementById('cnt-hours').textContent   = String(hours).padStart(2,'0');
      document.getElementById('cnt-minutes').textContent = String(minutes).padStart(2,'0');
      document.getElementById('cnt-seconds').textContent = String(seconds).padStart(2,'0');
    }

    tick();
    setInterval(tick, 1000);
  })();


  /* =========================================================
     CANVAS — CORAÇÕES FLUTUANTES
     Usa delta-time: velocidade igual em 60fps, 120fps e celulares
  ========================================================= */
  (function initHearts() {
    const canvas = document.getElementById('hearts-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H, particles, lastTime = 0;

    const COLORS = ['#c0435f', '#e8a0b0', '#d4a843', '#8a3050'];
    const PX_PER_SEC = 22;   // pixels por segundo — igual em qualquer fps

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function heartPath(cx, cy, size) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(size, size);
      ctx.beginPath();
      ctx.moveTo(0, -0.3);
      ctx.bezierCurveTo( 0.5, -0.9,  1.1,  0.0,  0,  0.7);
      ctx.bezierCurveTo(-1.1,  0.0, -0.5, -0.9,  0, -0.3);
      ctx.closePath();
      ctx.restore();
    }

    function makeParticle() {
      return {
        x:       Math.random() * W,
        y:       H + 20,
        size:    3 + Math.random() * 7,
        speedY:  PX_PER_SEC * (0.35 + Math.random() * 0.45), // px/s
        driftX:  (Math.random() - 0.5) * 8,                  // px/s lateral
        alpha:   0.08 + Math.random() * 0.22,
        decay:   0.008 + Math.random() * 0.006,              // alpha/s
        color:   COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }

    function initParticles() {
      particles = Array.from({ length: 20 }, () => {
        const p = makeParticle();
        p.y = Math.random() * H;
        return p;
      });
    }

    function draw(timestamp) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // seg, cap 100ms
      lastTime = timestamp;

      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        heartPath(p.x, p.y, p.size);
        ctx.fill();

        p.y     -= p.speedY * dt;
        p.x     += p.driftX * dt;
        p.alpha  = Math.max(0, p.alpha - p.decay * dt);

        if (p.y < -30 || p.alpha <= 0) Object.assign(p, makeParticle());
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    requestAnimationFrame(t => { lastTime = t; requestAnimationFrame(draw); });
    window.addEventListener('resize', () => { resize(); initParticles(); });
  })();


  /* =========================================================
     REVEAL ON SCROLL
  ========================================================= */
  (function initReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.10 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();