document.addEventListener('DOMContentLoaded', () => {
  const pageName = (location.pathname.split('/').pop() || 'index.html').replace('.html','') || 'index';
  document.body.classList.add(`page-${pageName}`);

  const touch = document.createElement('span');
  touch.className = 'page-touch';
  document.body.appendChild(touch);

  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touch.style.left = e.clientX + 'px';
    touch.style.top = e.clientY + 'px';
    touch.classList.remove('show');
    void touch.offsetWidth;
    touch.classList.add('show');
  }, {passive:true});

  // A recorded/synthesized glass-break asset is used instead of a tiny oscillator tick.
  // The file contains a sharp impact, high-frequency resonances and irregular micro-cracks.
  let audioUnlocked = false;
  let breakAudio = null;
  const unlockAudio = () => {
    if (audioUnlocked) return;
    try {
      breakAudio = new Audio('assets/glass-break.wav');
      breakAudio.preload = 'auto';
      breakAudio.volume = 0.72;
      // Unlock the media element on the first genuine gesture without audible playback.
      const p = breakAudio.play();
      if (p && p.then) p.then(() => { breakAudio.pause(); breakAudio.currentTime = 0; audioUnlocked = true; }).catch(() => {});
    } catch (_) {}
  };
  const glassSound = () => {
    try {
      if (!breakAudio) breakAudio = new Audio('assets/glass-break.wav');
      breakAudio.currentTime = 0;
      breakAudio.volume = 0.72;
      const p = breakAudio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  };

  // Build an irregular radial crack network. Each press gets a different geometry.
  const makeCracks = el => {
    el.querySelectorAll('.crack-svg,.shard').forEach(n => n.remove());
    const NS='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(NS,'svg');
    svg.classList.add('crack-svg'); svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('preserveAspectRatio','none');

    const defs=document.createElementNS(NS,'defs');
    const grad=document.createElementNS(NS,'linearGradient');
    grad.id='crackGlow'; grad.setAttribute('x1','0');grad.setAttribute('y1','0');grad.setAttribute('x2','1');grad.setAttribute('y2','1');
    [['0','#ffffff'],['.48','#f7fbfc'],['1','#8e999e']].forEach(([o,c])=>{const s=document.createElementNS(NS,'stop');s.setAttribute('offset',o);s.setAttribute('stop-color',c);grad.appendChild(s)});
    defs.appendChild(grad); svg.appendChild(defs);

    const cx=38+Math.random()*24, cy=38+Math.random()*24;
    const group=document.createElementNS(NS,'g');
    const count=11+Math.floor(Math.random()*7);
    for(let i=0;i<count;i++){
      const a=(Math.PI*2/count)*i+(Math.random()-.5)*.48;
      const reach=24+Math.random()*44;
      const pts=[[cx,cy]];
      let x=cx,y=cy;
      const segments=4+Math.floor(Math.random()*3);
      for(let j=0;j<segments;j++){
        const step=reach/segments*(.82+Math.random()*.42);
        const bend=(Math.random()-.5)*.30;
        x += Math.cos(a+bend)*step;
        y += Math.sin(a+bend)*step;
        pts.push([x,y]);
      }
      const d=pts.map((p,k)=>(k?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
      const ghost=document.createElementNS(NS,'path'); ghost.setAttribute('d',d); ghost.setAttribute('class','crack-ghost'); group.appendChild(ghost);
      const main=document.createElementNS(NS,'path'); main.setAttribute('d',d); main.setAttribute('class','crack-main'); main.setAttribute('stroke','url(#crackGlow)'); group.appendChild(main);

      // One or two irregular side branches off every major fissure.
      const branchCount=Math.random()<.45?2:1;
      for(let b=0;b<branchCount;b++){
        const k=1+Math.floor(Math.random()*(pts.length-2));
        const [bx,by]=pts[k];
        const ba=a+(Math.random()<.5?-1:1)*(0.7+Math.random()*.8);
        const bl=8+Math.random()*22;
        const ex=bx+Math.cos(ba)*bl, ey=by+Math.sin(ba)*bl;
        const bd=`M${bx.toFixed(2)},${by.toFixed(2)} L${(bx+Math.cos(ba)*bl*.48).toFixed(2)},${(by+Math.sin(ba)*bl*.48).toFixed(2)} L${ex.toFixed(2)},${ey.toFixed(2)}`;
        const fine=document.createElementNS(NS,'path'); fine.setAttribute('d',bd); fine.setAttribute('class','crack-fine'); group.appendChild(fine);
      }
    }
    // A few short concentric fracture arcs make the impact point read as glass stress.
    for(let r of [7+Math.random()*3,11+Math.random()*4,16+Math.random()*5]){
      const start=Math.random()*Math.PI*2, span=.7+Math.random()*1.8;
      const x1=cx+Math.cos(start)*r,y1=cy+Math.sin(start)*r,x2=cx+Math.cos(start+span)*r,y2=cy+Math.sin(start+span)*r;
      const large=span>Math.PI?1:0;
      const arc=`M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
      const p=document.createElementNS(NS,'path');p.setAttribute('d',arc);p.setAttribute('class','crack-main');group.appendChild(p);
    }
    const node=document.createElementNS(NS,'circle');node.setAttribute('cx',cx);node.setAttribute('cy',cy);node.setAttribute('r','1.5');node.setAttribute('class','crack-node');group.appendChild(node);
    svg.appendChild(group); el.appendChild(svg);

    // Very small fragments near the impact point; the button does not explode like a game effect.
    for(let i=0;i<4;i++){
      const s=document.createElement('span'); s.className='shard';
      const a=Math.random()*Math.PI*2,d=9+Math.random()*20;
      s.style.left=(cx+Math.random()*6-3)+'%'; s.style.top=(cy+Math.random()*6-3)+'%';
      s.style.setProperty('--dx',(Math.cos(a)*d)+'px'); s.style.setProperty('--dy',(Math.sin(a)*d)+'px'); s.style.setProperty('--rot',((Math.random()-.5)*100)+'deg');
      s.style.width=(3+Math.random()*7)+'px'; s.style.height=(5+Math.random()*10)+'px'; el.appendChild(s);
      setTimeout(()=>s.remove(),820);
    }
  };

  const activate = el => {
    unlockAudio();
    el.classList.remove('pressed','shatter');
    void el.offsetWidth;
    makeCracks(el);
    el.classList.add('pressed','shatter');
    glassSound();
    setTimeout(() => { el.classList.remove('pressed','shatter'); el.querySelectorAll('.crack-svg').forEach(n=>n.remove()); }, 830);
  };

  document.querySelectorAll('.glass-btn,.glass-nav-btn,.social').forEach(el => {
    el.addEventListener('pointerdown', e => {
      el.dataset.glassActivated=String(Date.now());
      activate(el);
      const r=document.createElement('span'); r.className='ripple'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; document.body.appendChild(r);
      setTimeout(()=>r.remove(),720);
    });
  });

  document.querySelectorAll('a.glass-btn,a.glass-nav-btn').forEach(el => {
    el.addEventListener('click', e => {
      const href=el.getAttribute('href');
      if(!href || href.startsWith('#') || el.target==='_blank') return;
      e.preventDefault();
      const last=Number(el.dataset.glassActivated||0);
      if(Date.now()-last>450) activate(el);
      setTimeout(()=>{window.location.href=href},760);
    });
  });
});
