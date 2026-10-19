// 新竹共玩節 · 從 Google 試算表讀取內容
// ------------------------------------------------------------
// 只要改這一行：貼上 Google 試算表網址中 /d/ 和 /edit 之間那一串 ID。
// 留空白時，網站會直接顯示寫在 index.html 裡的內容。
const SHEET_ID = '1p9QaRXgh4jWC15JXstDckoA6Sv8__j4IwCy6k0thXeo';
// ------------------------------------------------------------

(() => {
  if (!SHEET_ID) return;

  const url = name =>
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}&_=${Date.now()}`;

  // ---- 工具 ----
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const txt = v => esc(String(v ?? '').trim()).replace(/\r?\n/g, '<br>');
  const yes = v => /^(是|y|yes|true|1|v|✓|✔)$/i.test(String(v ?? '').trim());
  const shown = r => !String(r['顯示'] ?? '').trim() || yes(r['顯示']);
  const safeUrl = v => (/^https?:\/\//i.test(String(v ?? '').trim()) ? String(v).trim() : '');
  const split = v => String(v ?? '').split(/[、,，]/).map(s => s.trim()).filter(Boolean);
  const pills = v => split(v).map(p => `<span class="pill">${esc(p)}</span>`).join('');
  const soon = v => (String(v ?? '').trim() ? `<p class="soon">${txt(v)}</p>` : '');

  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map(h => h.trim());
    return rows
      .map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])))
      .filter(r => r['名稱'] || r['內容']);
  }

  async function load(name) {
    const res = await fetch(url(name), { cache: 'no-store' });
    if (!res.ok) throw new Error(name + ' ' + res.status);
    const t = await res.text();
    if (/^\s*</.test(t)) throw new Error(name + ' 不是公開的試算表');
    return parseCSV(t).filter(shown);
  }

  const COLOR = { 紅: 'red', 紫: 'blue', 黃: 'yellow', 綠: 'navy', 藍: 'sky' };
  const SOLID = { 紅: 'solid-red', 紫: 'solid-navy', 黃: 'solid-yellow', 綠: 'solid-green', 藍: 'solid-blue' };
  const BAR = ['bar-blue', 'bar-yellow', 'bar-red', 'bar-navy'];

  const ART_EXPO = '<svg viewBox="0 0 200 160"><rect width="200" height="160" fill="#D7262B"/><rect x="0" y="100" width="90" height="60" fill="#EBAA2F"/><path d="M110 30 L190 60 L120 92 Z" fill="#FAF5EC"/><path d="M190 60 L120 92 L132 132 Z" fill="#1B4A9C"/><circle cx="48" cy="52" r="26" fill="#232A36"/><circle cx="48" cy="52" r="10" fill="#FAF5EC"/><g stroke="#FAF5EC" stroke-width="5"><path d="M14 120 H76 M14 138 H76"/></g></svg>';
  const ART_SPECIAL = '<svg viewBox="0 0 200 160"><rect width="200" height="160" fill="#1B4A9C"/><path d="M40 70 Q100 40 160 70 L150 120 Q100 140 50 120 Z" fill="#FAF5EC"/><path d="M40 70 Q100 96 160 70" fill="#EBAA2F"/><g stroke="#D7262B" stroke-width="5" fill="none"><path d="M78 76 Q90 66 100 78 Q110 90 122 76"/></g><g stroke="#FAF5EC" stroke-width="4" fill="none" opacity=".7"><path d="M80 34 Q74 24 82 14 M100 34 Q94 24 102 14 M120 34 Q114 24 122 14"/></g></svg>';
  const ART_SHOW = '<svg viewBox="0 0 160 160"><path d="M0 22 Q80 58 160 22" stroke="#232A36" stroke-width="3" fill="none"/><path d="M16 28 L30 60 L42 34 Z" fill="#D7262B"/><path d="M58 38 L72 70 L86 38 Z" fill="#EBAA2F"/><path d="M104 36 L118 64 L132 30 Z" fill="#1B4A9C"/><circle cx="44" cy="118" r="18" fill="#D7262B"/><circle cx="84" cy="104" r="14" fill="#EBAA2F"/><circle cx="118" cy="122" r="16" fill="#1B4A9C"/></svg>';

  const feature = (r, art, extraClass = '') => `
    <article class="feature ${extraClass}">
      <div class="feature-art" aria-hidden="true">${art}</div>
      <div class="feature-body">
        ${r['地點'] ? `<p class="meta">${pills(r['地點'])}</p>` : ''}
        <h3>${txt(r['名稱'])}</h3>
        <p>${txt(r['說明'])}</p>
        ${soon(r['提醒'])}
      </div>
    </article>`;

  // ---- 各區塊 ----
  const render = {
    公告(rows) {
      const el = document.getElementById('notice');
      const r = rows[0];
      if (!el) return;
      if (!r) { el.hidden = true; return; }
      const link = safeUrl(r['連結']);
      el.innerHTML = link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${txt(r['內容'])}</a>` : txt(r['內容']);
      el.hidden = false;
    },

    展覽(rows) {
      const top = rows.filter(r => yes(r['主打']));
      const rest = rows.filter(r => !yes(r['主打']));
      document.getElementById('expo-list').innerHTML =
        top.map(r => feature(r, ART_EXPO)).join('') +
        `<div class="card-grid">${rest.map((r, i) => `
          <article class="card">
            <span class="card-bar ${BAR[i % BAR.length]}"></span>
            <h3>${txt(r['名稱'])}</h3>
            ${r['地點'] ? `<p class="where">${txt(r['地點'])}</p>` : ''}
            <p>${txt(r['說明'])}</p>
            ${soon(r['提醒'])}
          </article>`).join('')}</div>`;
    },

    表演(rows) {
      document.getElementById('show-list').innerHTML = rows.map(r => `
        <article class="show">
          <div class="show-date">
            <span>${txt(r['日期標示'])}</span>
            <b>${txt(r['日期'])}</b>
            <small>${txt(r['時段'])}</small>
          </div>
          <div class="show-body">
            ${r['標籤'] ? `<p class="meta">${pills(r['標籤'])}</p>` : ''}
            <h3>${txt(r['名稱'])}</h3>
            <p>${txt(r['說明'])}</p>
            ${soon(r['提醒'])}
          </div>
          <div class="show-art" aria-hidden="true">${ART_SHOW}</div>
        </article>`).join('');
    },

    課程(rows) {
      document.getElementById('class-list').innerHTML = rows.map(r => {
        const d = String(r['日期'] || '');
        const has14 = /14|六/.test(d), has15 = /15|（日）|\(日\)|週日|星期日/.test(d);
        const days = /兩/.test(d) || (has14 && has15) || (!has14 && !has15) ? 'd1 d2' : has15 ? 'd2' : 'd1';
        const free = /免費|^0$|^\$0$/.test(r['價格']);
        const link = safeUrl(r['報名連結']);
        const color = COLOR[r['顏色']] || 'red';
        const dateLabel = /兩/.test(d) ? '兩天皆有' : d;
        const timeLabel = /／/.test(r['時間']) ? '場次' : '時間';
        const timeValue = /兩/.test(d) || /（|\(/.test(r['時間']) || !d ? txt(r['時間']) : `${txt(d)} ${txt(r['時間'])}`;
        const btn = link
          ? `<a class="reg" href="${esc(link)}" target="_blank" rel="noopener">立即報名 →</a>`
          : free ? '<span class="reg reg-free">直接到現場</span>' : '<span class="reg reg-soon">報名連結即將開放</span>';
        return `
        <article class="class-card" data-days="${days}"${free ? ' data-free="1"' : ''}>
          <header class="class-top top-${color}">
            <span class="price">${txt(r['價格'])}${r['單位'] ? `<small>／${txt(r['單位'])}</small>` : ''}</span>
            ${r['標籤'] ? `<span class="badge">${txt(r['標籤'])}</span>` : ''}
          </header>
          <div class="class-body">
            <h3>${txt(r['名稱'])}</h3>
            ${r['副標'] ? `<p class="sub">${txt(r['副標'])}</p>` : ''}
            <p>${txt(r['說明'])}</p>
            <dl class="info">
              ${/兩/.test(d) ? `<dt>日期</dt><dd>${dateLabel}</dd>` : ''}
              ${r['時間'] ? `<dt>${timeLabel}</dt><dd>${timeValue}</dd>` : ''}
              ${r['名額'] ? `<dt>名額</dt><dd>${txt(r['名額'])}</dd>` : ''}
              ${r['地點'] ? `<dt>地點</dt><dd>${txt(r['地點'])}</dd>` : ''}
            </dl>
            ${btn}
          </div>
        </article>`;
      }).join('');
      document.querySelector('.chip.active')?.click();
    },

    特別企劃(rows) {
      const top = rows.filter(r => yes(r['主打']));
      const rest = rows.filter(r => !yes(r['主打']));
      document.getElementById('special-list').innerHTML =
        top.map(r => feature(r, ART_SPECIAL, 'feature-blue')).join('') +
        `<div class="card-grid card-grid-4">${rest.map(r => {
          const link = safeUrl(r['連結']);
          return `
          <article class="card card-solid ${SOLID[r['顏色']] || 'solid-red'}">
            <h3>${txt(r['名稱'])}</h3>
            ${r['小標'] ? `<p class="where">${txt(r['小標'])}</p>` : ''}
            <p>${txt(r['說明'])}</p>
            ${soon(r['提醒'])}
            ${link ? `<a class="more" href="${esc(link)}" target="_blank" rel="noopener">${txt(r['連結文字'] || '了解更多 →')}</a>` : ''}
          </article>`;
        }).join('')}</div>`;
    },

    時程(rows) {
      const key = t => (/全天/.test(t) ? -1 : (([h, m]) => (+h || 0) * 60 + (+m || 0))(String(t).split(/[:：]/)));
      const day = n => rows
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => String(r['日期']).includes(n))
        .sort((a, b) => key(a.r['時間']) - key(b.r['時間']) || a.i - b.i)
        .map(({ r }) => `<li${/全天/.test(r['時間']) ? ' class="allday"' : ''}><time>${txt(r['時間'])}</time><div><h3>${txt(r['名稱'])}</h3>${r['說明'] ? `<p>${txt(r['說明'])}</p>` : ''}</div></li>`)
        .join('');
      document.getElementById('timeline-day1').innerHTML = day('14');
      document.getElementById('timeline-day2').innerHTML = day('15');
    },
  };

  // 各分頁分開讀取：某一頁讀不到，只有那一區維持原本內容
  Object.keys(render).forEach(name => {
    load(name)
      .then(rows => render[name](rows))
      .catch(err => console.warn('[共玩節] 試算表「' + name + '」讀取失敗，顯示網頁原本內容：', err.message));
  });
})();
