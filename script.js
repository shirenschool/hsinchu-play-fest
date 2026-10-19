// 新竹共玩節 · 互動功能
(() => {
  // 手機選單
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }));
  }

  // 倒數
  const cd = document.getElementById('countdown');
  if (cd) {
    const start = new Date('2026-11-14T10:00:00+08:00');
    const end = new Date('2026-11-15T17:00:00+08:00');
    const now = new Date();
    if (now < start) {
      const days = Math.ceil((start - now) / 86400000);
      cd.innerHTML = `距離開玩還有<b>${days}</b>天`;
    } else if (now <= end) {
      cd.innerHTML = '<b>正在進行中！</b>快來將軍村一起玩';
    } else {
      cd.textContent = '今年的共玩節圓滿落幕，謝謝大家一起來玩！';
    }
  }

  // 時程分頁
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }));
  // 活動第二天自動切到週日
  const today = new Date();
  if (today >= new Date('2026-11-15T00:00:00+08:00') && today <= new Date('2026-11-15T23:59:59+08:00')) {
    document.getElementById('tab-day2')?.click();
  }

  // 課程篩選
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('active', c === chip));
    const f = chip.dataset.filter;
    document.querySelectorAll('.class-card').forEach(card => {
      const days = (card.dataset.days || '').split(' ');
      const show = f === 'all' || (f === 'free' ? card.dataset.free === '1' : days.includes(f));
      card.hidden = !show;
    });
  }));

  // 導覽列目前位置
  const links = [...document.querySelectorAll('.menu a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('current', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    // 捲動進場
    const items = document.querySelectorAll('.card, .class-card, .feature, .show, .quick, .gen, .timeline li, .logo-grid li');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
