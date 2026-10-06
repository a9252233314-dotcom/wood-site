/* ЛИСТВЕНГРАД — поведение страницы. Данные — в data.js */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const img = (n) => `assets/img/${n}.webp`;
  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- контакты из CONFIG ---------- */
  $$('[data-bind]').forEach((el) => {
    const k = el.dataset.bind;
    if (k === 'phone') { el.textContent = CONFIG.phone; el.href = 'tel:' + CONFIG.phoneRaw; }
    else if (k === 'wa') el.href = 'https://wa.me/' + CONFIG.whatsapp;
    else if (k === 'tg') el.href = 'https://t.me/' + CONFIG.telegram;
    else if (CONFIG[k]) el.textContent = CONFIG[k];
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- меню на телефоне ---------- */
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- бегущая строка ---------- */
  const ring = '<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="16" cy="17" rx="4" ry="3.4"/><ellipse cx="15.5" cy="16.6" rx="8" ry="7"/><ellipse cx="15" cy="16" rx="12" ry="10.6"/></g></svg>';
  const tickerOnce = PRODUCTS.map((p) => `<span>${p.name}${ring}</span>`).join('');
  $('#ticker').innerHTML = tickerOnce.repeat(4);

  /* ======================================================================
     СЕЧЕНИЯ — профиль доски в мм, единый масштаб для всех
     ====================================================================== */
  function profilePath(type, t, w) {
    const P = [];
    const relief = (xs, depth, half) => {        // пропилы снизу, справа налево
      xs.sort((a, b) => b - a).forEach((x) => {
        P.push(`L${x + half},${t}`, `L${x + half},${t - depth}`, `L${x - half},${t - depth}`, `L${x - half},${t}`);
      });
    };
    if (type === 'planken') {
      const c = 1.6;
      return `M0,${c} L${c},0 L${w - c},0 L${w},${c} L${w},${t} L0,${t} Z`;
    }
    if (type === 'kosoy') {
      const o = t * 0.5;
      return `M${o},0 L${w},0 L${w - o},${t} L0,${t} Z`;
    }
    if (type === 'velvet') {
      const r = 3;
      P.push(`M0,${t}`, `L0,${r}`, `Q0,0 ${r},0`);
      for (let x = r + 2; x + 5 <= w - r - 2; x += 5) {
        P.push(`L${x},0`, `L${x + 1},1.4`, `L${x + 3},1.4`, `L${x + 4},0`);
      }
      P.push(`L${w - r},0`, `Q${w},0 ${w},${r}`, `L${w},${t}`);
      relief([w * 0.3, w * 0.7], 2, 3);
      P.push(`L0,${t}`, 'Z');
      return P.join(' ');
    }
    if (type === 'deck') {
      const r = Math.min(6, t * 0.2);
      return `M0,${t} L0,${r} Q0,0 ${r},0 L${w - r},0 Q${w},0 ${w},${r} L${w},${t} Z`;
    }
    if (type === 'floor') {
      const a = t * 0.36, b = t * 0.64, L = 7;
      P.push(`M0,1.5`, `L1.5,0`, `L${w - 1.5},0`, `L${w},1.5`, `L${w},${a}`,
        `L${w + L - 1},${a + 0.6}`, `L${w + L},${a + 1.6}`, `L${w + L},${b - 1.6}`, `L${w + L - 1},${b - 0.6}`,
        `L${w},${b}`, `L${w},${t}`);
      relief([w * 0.3, w * 0.7], 2.5, 4);
      P.push(`L0,${t}`, `L0,${b + 0.4}`, `L8,${b + 0.4}`, `L8,${a - 0.4}`, `L0,${a - 0.4}`, 'Z');
      return P.join(' ');
    }
    return `M0,0 H${w} V${t} H0 Z`;
  }

  let clipN = 0;
  function drawProfile(svg, type, t, w) {
    const tongue = type === 'floor' ? 7 : 0;
    const x0 = 115 - (w + tongue) / 2 - 6;
    const y0 = 62 - t / 2;
    const d = profilePath(type, t, w);
    const id = 'pclip' + (++clipN);

    // годичные кольца: сердцевина ниже доски — как на торце тангенциальной доски
    const cx = w * 0.44, cy = t + 64;
    const rMin = cy - t - 2;
    const rMax = Math.hypot(Math.max(cx, w + tongue - cx), cy) + 2;
    let rings = '';
    for (let r = rMin, i = 0; r < rMax; r += 2.4 + (i % 3) * 0.5, i++) {
      rings += `<ellipse cx="${cx}" cy="${cy}" rx="${(r * 1.05).toFixed(2)}" ry="${r.toFixed(2)}"/>`;
    }

    const tick = (x, y) => `<line x1="${x - 1.4}" y1="${y + 1.4}" x2="${x + 1.4}" y2="${y - 1.4}"/>`;
    const yw = -10, xt = w + tongue + 9;
    const dims =
      `<g class="prof-dim">
        <line x1="0" y1="-2" x2="0" y2="${yw - 2}"/><line x1="${w}" y1="-2" x2="${w}" y2="${yw - 2}"/>
        <line x1="0" y1="${yw}" x2="${w}" y2="${yw}"/>${tick(0, yw)}${tick(w, yw)}
        <line x1="${w + tongue + 2}" y1="0" x2="${xt + 2}" y2="0"/><line x1="${w + tongue + 2}" y1="${t}" x2="${xt + 2}" y2="${t}"/>
        <line x1="${xt}" y1="0" x2="${xt}" y2="${t}"/>${tick(xt, 0)}${tick(xt, t)}
      </g>
      <text class="prof-txt" x="${w / 2}" y="${yw - 3}" text-anchor="middle">${w}</text>
      <text class="prof-txt" x="${xt + 3.5}" y="${t / 2 + 2.2}">${t}</text>`;

    svg.innerHTML =
      `<title id="pvSvgTitle">Сечение: ${t} × ${w} мм</title>
       <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
       <g transform="translate(${x0.toFixed(2)} ${y0.toFixed(2)})">
         <path class="prof-shape" d="${d}" pathLength="1"/>
         <g class="prof-rings" clip-path="url(#${id})">${rings}</g>
         ${dims}
       </g>`;
    if (!reduceMotion) {
      svg.classList.remove('drawing'); void svg.getBoundingClientRect(); svg.classList.add('drawing');
    }
  }

  /* ---------- состояние витрины ---------- */
  const state = { p: 0, s: 0, g: 0, ph: 0 };
  const tabs = $('#pvTabs');
  PRODUCTS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'pv-tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + p.id;
    b.textContent = p.name; b.dataset.i = i;
    b.addEventListener('click', () => selectProduct(i, true));
    tabs.appendChild(b);
  });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const n = PRODUCTS.length;
    const i = (state.p + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
    selectProduct(i, true); $$('.pv-tab')[i].focus();
  });

  function priceHtml(p, size) {
    if (p.price == null) return `Цена по запросу<small>считаем под ваш объём и сорт</small>`;
    return `от ${p.price.toLocaleString('ru-RU')} ₽<small>за ${p.unit} · ${size[0]} × ${size[1]} мм</small>`;
  }

  function renderSize() {
    const p = PRODUCTS[state.p], size = p.sizes[state.s];
    drawProfile($('#pvSvg'), p.profile, size[0], size[1]);
    $$('.pv-size', $('#pvSizes')).forEach((b, i) => b.setAttribute('aria-pressed', i === state.s));
    $('#pvPrice').innerHTML = priceHtml(p, size);
  }

  function renderPhoto() {
    const p = PRODUCTS[state.p], im = $('#pvMainImg');
    im.src = img(p.photos[state.ph]);
    im.alt = `${p.name} из лиственницы — фото ${state.ph + 1} из ${p.photos.length}`;
    $$('.pv-thumb').forEach((b, i) => b.setAttribute('aria-current', i === state.ph));
  }

  function selectProduct(i, userAction) {
    state.p = i; state.s = 0; state.g = 0; state.ph = 0;
    const p = PRODUCTS[i];
    $$('.pv-tab').forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    $('#pvName').textContent = p.name;
    $('#pvLead').textContent = p.lead;
    $('#pvText').textContent = p.text;
    $('#pvUses').innerHTML = p.uses.map((u) => `<span class="tag">${u}</span>`).join('');

    const sz = $('#pvSizes'); sz.innerHTML = '';
    p.sizes.forEach((s, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pv-size'; b.textContent = `${s[0]} × ${s[1]}`;
      b.addEventListener('click', () => { state.s = k; renderSize(); });
      sz.appendChild(b);
    });
    const gr = $('#pvGrades'); gr.innerHTML = '';
    p.grades.forEach((g, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pv-size'; b.textContent = g;
      b.setAttribute('aria-pressed', k === 0);
      b.addEventListener('click', () => { state.g = k; $$('button', gr).forEach((x, j) => x.setAttribute('aria-pressed', j === k)); });
      gr.appendChild(b);
    });

    const th = $('#pvThumbs'); th.innerHTML = '';
    p.photos.forEach((ph, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pv-thumb'; b.setAttribute('aria-label', `Фото ${k + 1}`);
      b.innerHTML = `<img src="${img(ph)}" alt="" loading="lazy">`;
      b.addEventListener('click', () => { state.ph = k; renderPhoto(); });
      th.appendChild(b);
    });

    renderSize(); renderPhoto();
    if (userAction) history.replaceState(null, '', '#' + p.id);
  }

  $('#pvMain').addEventListener('click', () => openLb(PRODUCTS[state.p].photos, state.ph));
  $('#pvAsk').addEventListener('click', () => {
    const p = PRODUCTS[state.p];
    fProduct.value = state.p; fillFormSizes();
    fSize.value = state.s; fGrade.value = state.g;
    $('#order').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => $('#fPhone').focus({ preventScroll: true }), reduceMotion ? 0 : 600);
  });

  // ссылка вида #velvet открывает сразу нужную доску
  const startIdx = Math.max(0, PRODUCTS.findIndex((p) => '#' + p.id === location.hash));
  selectProduct(startIdx, false);
  if (startIdx > 0 || location.hash === '#' + PRODUCTS[0].id) $('#products').scrollIntoView();

  /* ======================================================================
     СКЛАД — лента, тянется мышью
     ====================================================================== */
  const yard = $('#yard');
  yard.innerHTML = YARD.map((n, i) => `<figure><img src="${img(n)}" alt="Склад: пачки лиственницы, фото ${i + 1}" loading="lazy" data-i="${i}"></figure>`).join('');
  let drag = null, moved = false;
  yard.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: yard.scrollLeft }; moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) { moved = true; yard.classList.add('drag'); }
    yard.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => { drag = null; yard.classList.remove('drag'); });
  yard.addEventListener('click', (e) => {
    const t = e.target.closest('img');
    if (!t || moved) return;
    openLb(YARD, +t.dataset.i);
  });

  /* ======================================================================
     ЛАЙТБОКС
     ====================================================================== */
  const lb = $('#lb'), lbImg = $('#lbImg');
  let lbList = [], lbI = 0;
  function showLb() { lbImg.src = img(lbList[lbI]); lbImg.alt = `Фото ${lbI + 1} из ${lbList.length}`; }
  function openLb(list, i) {
    lbList = list; lbI = i; showLb();
    if (typeof lb.showModal === 'function') lb.showModal(); else window.open(img(list[i]), '_blank');
  }
  const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; showLb(); };
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ======================================================================
     ЗАЯВКА → WhatsApp / Telegram готовым текстом
     ====================================================================== */
  const form = $('#orderForm');
  const fProduct = $('#fProduct'), fSize = $('#fSize'), fGrade = $('#fGrade');
  fProduct.innerHTML = PRODUCTS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('') +
    `<option value="other">Другое / несколько позиций</option>`;
  function fillFormSizes() {
    const p = PRODUCTS[fProduct.value];
    fSize.innerHTML = p ? p.sizes.map((s, i) => `<option value="${i}">${s[0]} × ${s[1]}</option>`).join('') : '<option value="">—</option>';
    fGrade.innerHTML = p ? p.grades.map((g, i) => `<option value="${i}">${g}</option>`).join('') : '<option value="">—</option>';
  }
  fProduct.addEventListener('change', fillFormSizes);
  fillFormSizes();

  function buildText() {
    const p = PRODUCTS[fProduct.value];
    const v = (id) => $(id).value.trim();
    const lines = [`Здравствуйте! Заявка с сайта ${CONFIG.brand}.`];
    if (v('#fName')) lines.push(`Имя: ${v('#fName')}`);
    lines.push(`Телефон: ${v('#fPhone')}`);
    if (p) lines.push(`Доска: ${p.name}, ${p.sizes[fSize.value].join(' × ')} мм, сорт ${p.grades[fGrade.value]}`);
    else lines.push('Доска: несколько позиций / другое');
    if (v('#fQty')) lines.push(`Объём: ${v('#fQty')}`);
    if (v('#fMsg')) lines.push(`Комментарий: ${v('#fMsg')}`);
    return lines.join('\n');
  }
  function valid() {
    const ok = $('#fPhone').value.replace(/\D/g, '').length >= 6;
    $('#formErr').hidden = ok;
    if (!ok) $('#fPhone').focus();
    return ok;
  }
  const note = $('#formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    const url = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(buildText());
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else location.href = url;
    note.textContent = 'Открыли WhatsApp с готовым текстом — нажмите «отправить».';
    note.classList.add('ok');
  });
  $('#sendTg').addEventListener('click', async () => {
    if (!valid()) return;
    const text = buildText();
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (_) { /* буфер недоступен */ }
    const tg = window.open('https://t.me/' + CONFIG.telegram, '_blank'); if (tg) tg.opener = null;
    note.textContent = copied
      ? 'Текст заявки скопирован — вставьте его в открывшийся чат Telegram.'
      : 'Открыли Telegram. Опишите заявку в чате или отправьте через WhatsApp.';
    note.classList.add('ok');
  });
})();
