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
      .filter(r => r['名稱'] || r['內容'] || r['標題']);
  }

  async function load(name) {
    const res = await fetch(url(name), { cache: 'no-store' });
    if (!res.ok) throw new Error(name + ' ' + res.status);
    const t = await res.text();
    if (/^\s*</.test(t)) throw new Error(name + ' 不是公開的試算表');
    return parseCSV(t).filter(shown);
  }

  // 照片：可填 Google 雲端硬碟分享連結、圖片網址，或上傳到 GitHub images 資料夾的檔名
  const photoUrl = v => {
    v = String(v ?? '').trim();
    if (!v) return '';
    const drive = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
    if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1200`;
    if (/^https?:\/\//i.test(v)) return v;
    if (/^[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(v)) return 'images/' + v;
    return '';
  };
  const COLOR = { 紅: 'red', 紫: 'blue', 黃: 'yellow', 綠: 'navy', 藍: 'sky' };
  const SOLID = { 紅: 'solid-red', 紫: 'solid-navy', 黃: 'solid-yellow', 綠: 'solid-green', 藍: 'solid-blue' };
  const BAR = ['bar-blue', 'bar-yellow', 'bar-red', 'bar-navy'];

  const ART_EXPO = '<svg viewBox="0 0 200 160"><rect width="200" height="160" fill="#D7262B"/><rect x="0" y="100" width="90" height="60" fill="#EBAA2F"/><path d="M110 30 L190 60 L120 92 Z" fill="#FAF5EC"/><path d="M190 60 L120 92 L132 132 Z" fill="#1B4A9C"/><circle cx="48" cy="52" r="26" fill="#232A36"/><circle cx="48" cy="52" r="10" fill="#FAF5EC"/><g stroke="#FAF5EC" stroke-width="5"><path d="M14 120 H76 M14 138 H76"/></g></svg>';
  const ART_HUNG = '<picture><source srcset="images/hung-collage.webp" type="image/webp"><img src="images/hung-collage.jpg" width="1200" height="1300" loading="lazy" alt="洪新富老師「紙藝玩科學」講座現場照片拼貼：手拿紙飛機講解、和孩子一起玩創意玩具、射紙飛機示範、孩子們圍觀、老唱機"></picture>';
  const ART_NOODLE = '<picture><source srcset="images/tomato-noodle.webp" type="image/webp"><img src="images/tomato-noodle.jpg" width="1200" height="792" loading="lazy" alt="一碗熱騰騰的蕃茄麵：紅湯、蕃茄塊、蛋花、青菜與蔥花"></picture>';
  const ART_SCOUT = '<picture><source srcset="images/wonder-scouts.webp" type="image/webp"><img src="images/wonder-scouts.jpg" width="1200" height="900" loading="lazy" alt="少年導覽隊的孩子們穿著不同年代的服裝，在將軍村老房子前開心揮手"></picture>';
  const ART_SPECIAL = '<svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice"> <rect width="200" height="160" fill="#EBAA2F" style="fill:#EBAA2F"/> <circle cx="100" cy="86" r="72" fill="#F6C55A"/> <g stroke="#FAF5EC" stroke-width="4" fill="none" stroke-linecap="round"> <path d="M74 40 Q66 30 74 20 Q82 10 74 2"/><path d="M100 36 Q92 26 100 16 Q108 6 100 -2"/><path d="M126 40 Q118 30 126 20 Q134 10 126 2"/> </g> <path d="M22 72 Q26 136 100 142 Q174 136 178 72 Z" fill="#1B4A9C"/> <g fill="#FAF5EC"><circle cx="54" cy="108" r="4"/><circle cx="76" cy="118" r="4"/><circle cx="100" cy="121" r="4"/><circle cx="124" cy="118" r="4"/><circle cx="146" cy="108" r="4"/></g> <path d="M70 142 L130 142 L124 154 L76 154 Z" fill="#232A36"/> <ellipse cx="100" cy="72" rx="78" ry="26" fill="#232A36"/> <ellipse cx="100" cy="72" rx="72" ry="22" fill="#D7262B"/> <ellipse cx="90" cy="66" rx="44" ry="10" fill="#EF5A3C"/> <g stroke="#FFE7A3" stroke-width="5" fill="none" stroke-linecap="round"> <path d="M44 74 Q60 60 76 74 T108 74 T140 72"/> <path d="M52 82 Q70 68 88 82 T124 82 T152 78"/> <path d="M64 66 Q82 54 98 66 T130 64"/> </g> <g stroke="#FFE7A3" stroke-width="5" fill="none" stroke-linecap="round"><path d="M120 70 Q124 50 130 38"/><path d="M128 72 Q132 52 138 40"/></g> <g stroke="#232A36" stroke-width="5" stroke-linecap="round"><path d="M168 8 L126 46"/><path d="M178 16 L134 50"/></g> <g><path d="M52 66 Q62 52 74 64 Q62 72 52 66 Z" fill="#9E0F17"/><path d="M56 65 Q63 58 70 64" stroke="#FF9E86" stroke-width="2.5" fill="none"/></g> <g><path d="M138 82 Q150 70 162 80 Q150 90 138 82 Z" fill="#9E0F17"/><path d="M142 81 Q150 75 157 80" stroke="#FF9E86" stroke-width="2.5" fill="none"/></g> <g><path d="M86 84 Q96 74 106 84 Q96 90 86 84 Z" fill="#9E0F17"/><path d="M89 83 Q96 78 103 83" stroke="#FF9E86" stroke-width="2.5" fill="none"/></g> <path d="M84 60 Q94 48 108 54 Q120 60 110 68 Q96 72 86 66 Z" fill="#fff"/><circle cx="98" cy="60" r="6" fill="#F7A21B"/> <g fill="#3E9B4F"><circle cx="70" cy="78" r="2.6"/><circle cx="80" cy="70" r="2.2"/><circle cx="118" cy="80" r="2.6"/><circle cx="130" cy="70" r="2.2"/><circle cx="60" cy="74" r="2"/><circle cx="146" cy="72" r="2.4"/><circle cx="108" cy="74" r="2"/></g> <circle cx="32" cy="138" r="13" fill="#D7262B"/><path d="M26 126 L32 130 L38 125 L35 132 L40 135 L32 134 L27 137 L29 131 Z" fill="#3E9B4F"/> <circle cx="28" cy="134" r="3" fill="#FF9E86"/> </svg>';
  const ART_SHOW = '<svg viewBox="0 0 160 160"><path d="M0 22 Q80 58 160 22" stroke="#232A36" stroke-width="3" fill="none"/><path d="M16 28 L30 60 L42 34 Z" fill="#D7262B"/><path d="M58 38 L72 70 L86 38 Z" fill="#EBAA2F"/><path d="M104 36 L118 64 L132 30 Z" fill="#1B4A9C"/><circle cx="44" cy="118" r="18" fill="#D7262B"/><circle cx="84" cy="104" r="14" fill="#EBAA2F"/><circle cx="118" cy="122" r="16" fill="#1B4A9C"/></svg>';

  const feature = (r, art, extraClass = '') => `
    <article class="feature ${extraClass}">
      <div class="feature-art${extraClass.includes('has-photo') ? ' feature-photo' : ''}"${extraClass.includes('has-photo') ? '' : ' aria-hidden="true"'}>${art}</div>
      <div class="feature-body">
        ${r['地點'] ? `<p class="meta">${pills(r['地點'])}</p>` : ''}
        <h3>${txt(r['名稱'])}</h3>
        <p>${txt(r['說明'])}</p>
        ${soon(r['提醒'])}
      </div>
    </article>`;

  // ---- 各區塊 ----
  const render = {
    關於(rows) {
      const r = rows[0];
      if (!r || !r['內容']) return;           // 分頁還沒建立或沒填，就維持網頁原本的文字
      if (r['標題']) document.getElementById('about-title').innerHTML = txt(r['標題']);
      document.getElementById('about-text').innerHTML = txt(r['內容']);
    },

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
        top.map(r => feature(r, /洪新富/.test(r['名稱']) ? ART_HUNG : ART_EXPO, /洪新富/.test(r['名稱']) ? 'has-photo' : '')).join('') +
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
        const photo = photoUrl(r['照片']);
        const color = COLOR[r['顏色']] || 'red';
        const dateLabel = /兩/.test(d) ? '兩天皆有' : d;
        const timeLabel = /／/.test(r['時間']) ? '場次' : '時間';
        const timeValue = /兩/.test(d) || /（|\(/.test(r['時間']) || !d ? txt(r['時間']) : `${txt(d)} ${txt(r['時間'])}`;
        const btn = link
          ? `<a class="reg" href="${esc(link)}" target="_blank" rel="noopener">立即報名 →</a>`
          : '<span class="reg reg-soon">報名連結即將開放</span>';
        return `
        <article class="class-card" data-days="${days}"${free ? ' data-free="1"' : ''}>
          <header class="class-top top-${color}">
            <span class="price">${txt(r['價格'])}${r['單位'] ? `<small>／${txt(r['單位'])}</small>` : ''}</span>
            ${r['標籤'] ? `<span class="badge">${txt(r['標籤'])}</span>` : ''}
          </header>
          ${photo ? `<div class="class-photo"><img src="${esc(photo)}" alt="${esc(r['名稱'])}" loading="lazy" onerror="this.parentNode.remove()"></div>` : ''}
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
        top.map(r => /麵/.test(r['名稱']) ? feature(r, ART_NOODLE, 'feature-blue has-photo') : feature(r, ART_SPECIAL, 'feature-blue')).join('') +
        `<div class="card-grid card-grid-4">${rest.map(r => {
          const link = safeUrl(r['連結']);
          const scout = /少年導覽隊/.test(r['名稱']);
          return `
          <article class="card card-solid ${SOLID[r['顏色']] || 'solid-red'}${scout ? ' card-wide' : ''}">
            ${scout ? `<figure class="card-photo">${ART_SCOUT}</figure>` : ''}
            <div class="card-text">
            <h3>${txt(r['名稱'])}</h3>
            ${r['小標'] ? `<p class="where">${txt(r['小標'])}</p>` : ''}
            <p>${txt(r['說明'])}</p>
            ${soon(r['提醒'])}
            ${link ? `<a class="more" href="${esc(link)}" target="_blank" rel="noopener">${txt(r['連結文字'] || '了解更多 →')}</a>` : ''}
            </div>
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
