document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".eye").forEach(eye => {
    const pupil = eye.querySelector(".pupil");
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
    const maxOffset = 6; 
    const pupilX = Math.cos(angle) * maxOffset;
    const pupilY = Math.sin(angle) * maxOffset;

    pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
  });
});

AOS.init({
    duration: 700,     
    offset: 100,       
    easing: 'ease-out',
    once: true,        
    mirror: false,    
  });


(() => {
  const wrap  = document.querySelector('.dog-wrap');
  const eyes  = Array.from(document.querySelectorAll('.eye'));
  const orbit = document.getElementById('orbitSvg');

  if (!wrap || !eyes.length || !orbit) return;

  // таргет — курсор, если активен, иначе центр .dog-wrap
  let mouse = { x: null, y: null };
  let lastMove = 0;
  const IDLE_MS = 1200;

  function aimEyesAt(x, y){
    if (x == null || y == null) return;
    eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil');
      if (!pupil) return;
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy) || 1;

      // максимум — доля от ширины глаза (чем меньше глаз, тем короче ход)
      const maxOffset = r.width * 0.18;   // ≈ 18% радиуса
      const k = Math.min(1, maxOffset / dist);
      pupil.style.transform = `translate(${dx*k}px, ${dy*k}px)`;
    });
  }

  function centerOf(el){
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width/2, y: b.top + b.height/2 };
  }

  function tick(){
    const now = performance.now();
    const active = (now - lastMove) < IDLE_MS && mouse.x != null;

    if (active){
      aimEyesAt(mouse.x, mouse.y);
    } else {
      const c = centerOf(wrap);
      aimEyesAt(c.x, c.y);
    }
    requestAnimationFrame(tick);
  }

  // Курсор
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMove = performance.now();
  }, { passive: true });

  // На ресайзе/ориентации сбрасываем трансформации и проверяем безопасность
  const resetEyes = () => {
    eyes.forEach(eye => {
      const p = eye.querySelector('.pupil');
      if (p) p.style.transform = 'translate(0,0)';
    });
  };

  function checkSafety(){
    const ratio = innerWidth / innerHeight;
    const tooSmall = wrap.clientWidth < 240;
    const weird    = ratio < 0.55 || ratio > 2.2;
    wrap.classList.toggle('is-unsafe', tooSmall || weird);
  }

  new ResizeObserver(() => { resetEyes(); checkSafety(); }).observe(document.documentElement);
  addEventListener('orientationchange', () => { resetEyes(); checkSafety(); });

  // Старт
  checkSafety();
  requestAnimationFrame(tick);
})();


(() => {
  const wrap  = document.querySelector('.dog-wrap');
  const eyes  = Array.from(document.querySelectorAll('.eye'));
  if (!wrap || !eyes.length) return;

  let mouse = { x:null, y:null }, lastMove=0;
  const IDLE_MS = 1200;

  const aim = (x,y)=>{
    if (x==null || y==null) return;
    eyes.forEach(eye=>{
      const p = eye.querySelector('.pupil');
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx,dy) || 1;
      const max = r.width * 0.18;           // ход зрачка ≈ 18% от размера глаза
      const k = Math.min(1, max/dist);
      p.style.transform = `translate(${dx*k}px, ${dy*k}px)`;
    });
  };

  const center = el => {
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width/2, y: b.top + b.height/2 };
  };

  function tick(){
    const active = (performance.now()-lastMove) < IDLE_MS && mouse.x!=null;
    aim(...(active ? [mouse.x, mouse.y] : Object.values(center(wrap))));
    requestAnimationFrame(tick);
  }

  addEventListener('pointermove', e => {
    mouse.x=e.clientX; mouse.y=e.clientY; lastMove=performance.now();
  }, {passive:true});

  const reset = ()=>{
    eyes.forEach(eye=>{ const p=eye.querySelector('.pupil'); if (p) p.style.transform='translate(0,0)'; });
  };
  const checkSafety = ()=>{
    const ratio = innerWidth/innerHeight;
    wrap.classList.toggle('is-unsafe', wrap.clientWidth < 240 || ratio < 0.55 || ratio > 2.2);
  };
  new ResizeObserver(()=>{ reset(); checkSafety(); }).observe(document.documentElement);
  addEventListener('orientationchange', ()=>{ reset(); checkSafety(); });

  checkSafety();
  requestAnimationFrame(tick);
})();

(() => {
  const wrap  = document.querySelector('.dog-wrap');
  const eyes  = Array.from(document.querySelectorAll('.eye'));
  const orbit = document.getElementById('orbitSvg');
  if (!wrap || !eyes.length || !orbit) return;

  // Длительность CSS-анимации .orbit
  const getPeriodMs = () => {
    const dur = getComputedStyle(orbit).animationDuration;
    const n = parseFloat(dur);
    return isNaN(n) ? 12000 : (dur.endsWith('ms') ? n : n * 1000);
  };
  let PERIOD_MS = getPeriodMs();
  const PHASE_DEG = 100; // подгони если надо

  let mouse = { x: null, y: null }, lastMove = 0;
  const IDLE_MS = 800;

  function aimEyesAt(x, y){
    if (x == null || y == null) return;
    eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil');
      if (!pupil) return;
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const maxOffset = r.width * 0.18;
      const k = Math.min(1, maxOffset / dist);
      pupil.style.transform = `translate(${dx*k}px, ${dy*k}px)`;
    });
  }

  function getOrbitTargetPoint(){
    const rect = orbit.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const r = rect.width * (100/300);
    const t = (performance.now() % PERIOD_MS) / PERIOD_MS;
    const ang = (t * 360 + PHASE_DEG) * Math.PI/180;
    return { x: cx + Math.cos(ang)*r, y: cy + Math.sin(ang)*r };
  }

  function tick(){
    PERIOD_MS = getPeriodMs();
    const active = (performance.now() - lastMove) < IDLE_MS && mouse.x != null;
    if (active) {
      aimEyesAt(mouse.x, mouse.y);
    } else {
      const p = getOrbitTargetPoint();
      aimEyesAt(p.x, p.y);
    }
    requestAnimationFrame(tick);
  }

  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMove = performance.now();
  }, { passive:true });

  const resetEyes = () => {
    eyes.forEach(eye => {
      const p = eye.querySelector('.pupil');
      if (p) p.style.transform = 'translate(0,0)';
    });
  };
  const checkSafety = () => {
    const ratio = innerWidth / innerHeight;
    wrap.classList.toggle('is-unsafe', wrap.clientWidth < 240 || ratio < 0.55 || ratio > 2.2);
  };
  new ResizeObserver(()=>{ resetEyes(); checkSafety(); }).observe(document.documentElement);
  addEventListener('orientationchange', ()=>{ resetEyes(); checkSafety(); });

  checkSafety();
  requestAnimationFrame(tick);
})();
