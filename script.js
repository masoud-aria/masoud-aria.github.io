document.addEventListener('DOMContentLoaded', () => {
  const activate = (el) => {
    el.classList.remove('pressed','shatter');
    void el.offsetWidth;
    el.classList.add('pressed','shatter');
    setTimeout(() => el.classList.remove('pressed','shatter'), 680);
  };

  document.querySelectorAll('.glass-btn,.social').forEach(el => {
    el.addEventListener('pointerdown', e => {
      activate(el);
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

  // Tiny tactile feedback for every clickable area.
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('pointerdown', () => el.classList.add('tactile'));
    el.addEventListener('pointerup', () => el.classList.remove('tactile'));
    el.addEventListener('pointercancel', () => el.classList.remove('tactile'));
  });
});
