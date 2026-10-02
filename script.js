document.addEventListener('DOMContentLoaded', () => {
  const pageName = (location.pathname.split('/').pop() || 'index.html').replace('.html','') || 'index';
  document.body.classList.add(`page-${pageName}`);

  const touch = document.createElement('span');
  touch.className = 'page-touch';
  document.body.appendChild(touch);

  // Soft page-specific visual feedback for any touched area.
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touch.style.left = e.clientX + 'px';
    touch.style.top = e.clientY + 'px';
    touch.classList.remove('show');
    void touch.offsetWidth;
    touch.classList.add('show');
  }, {passive:true});

  const glassSound = () => {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      const ctx = new C();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.075, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      master.connect(ctx.destination);

      // Short high-frequency glass tick + filtered noise = subtle glass crack.
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(2450, now); osc.frequency.exponentialRampToValueAtTime(900, now + .18);
      og.gain.setValueAtTime(.55, now); og.gain.exponentialRampToValueAtTime(.0001, now + .22);
      osc.connect(og).connect(master); osc.start(now); osc.stop(now + .23);

      const buffer = ctx.createBuffer(1, ctx.sampleRate * .24, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2.2);
      const noise = ctx.createBufferSource(); noise.buffer = buffer;
      const filter = ctx.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=2200;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(.35,now); ng.gain.exponentialRampToValueAtTime(.0001,now+.22);
      noise.connect(filter).connect(ng).connect(master); noise.start(now);
      setTimeout(() => ctx.close(), 500);
    } catch (_) {}
  };

  const makeShards = el => {
    el.querySelectorAll('.shard,.crack-overlay').forEach(n => n.remove());
    const crack = document.createElement('span');
    crack.className = 'crack-overlay';
    el.appendChild(crack);
    for(let i=0;i<8;i++){
      const s=document.createElement('span'); s.className='shard';
      const angle=(Math.PI*2/8)*i + (Math.random()-.5)*.5;
      const distance=26+Math.random()*45;
      s.style.left=(42+Math.random()*16)+'%'; s.style.top=(42+Math.random()*16)+'%';
      s.style.setProperty('--dx',(Math.cos(angle)*distance)+'px');
      s.style.setProperty('--dy',(Math.sin(angle)*distance)+'px');
      s.style.setProperty('--rot',((Math.random()-.5)*160)+'deg');
      s.style.width=(8+Math.random()*14)+'px'; s.style.height=(8+Math.random()*18)+'px';
      el.appendChild(s);
      setTimeout(()=>s.remove(),700);
    }
  };

  const activate = (el) => {
    el.classList.remove('pressed','shatter');
    void el.offsetWidth;
    makeShards(el);
    el.classList.add('pressed','shatter');
    glassSound();
    setTimeout(() => el.classList.remove('pressed','shatter'), 700);
  };

  document.querySelectorAll('.glass-btn,.glass-nav-btn,.social').forEach(el => {
    el.addEventListener('pointerdown', e => {
      el.dataset.glassActivated = String(Date.now());
      activate(el);
      const r=document.createElement('span'); r.className='ripple';
      r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; document.body.appendChild(r);
      setTimeout(()=>r.remove(),700);
    });
  });

  // Let internal glass navigation buttons show the complete break effect before navigating.
  document.querySelectorAll('a.glass-btn,a.glass-nav-btn').forEach(el => {
    el.addEventListener('click', e => {
      const href=el.getAttribute('href');
      if(!href || href.startsWith('#') || el.target==='_blank') return;
      e.preventDefault();
      const lastPointer=Number(el.dataset.glassActivated||0);
      if(Date.now()-lastPointer>450) activate(el);
      setTimeout(()=>{ window.location.href=href; }, 570);
    });
  });
});
