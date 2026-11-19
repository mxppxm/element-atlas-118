import {
  ELEMENTS, byZ, CATEGORIES, electronConfig, spectrumOf, wavelengthToRGB, rgbCss,
  PHYS, blockOf, phaseOf, isSynthetic, noteOf, COMPOUNDS, REACTIONS,
} from '../data/elements.js';

/* ------------------------------------------------------------------
   Element Atlas 118 — UI controller.
   Periodic table + element dossier. No lab / audio / neon studio.
------------------------------------------------------------------- */

const LEGEND_ORDER = ['alkali', 'alkaline', 'transition', 'post', 'metalloid', 'nonmetal', 'halogen', 'noble', 'lanthanide', 'actinide', 'unknown'];
const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

export class UI {
  constructor(app) {
    this.app = app;
    this.$ = (s) => document.querySelector(s);
    this.mode = 'periodic';
    this.currentElement = null;
    this._toastTimer = 0;
    this.bind();
    this.setLegend();
  }

  bind() {
    document.querySelectorAll('#modes .mode[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => this.app.setMode(btn.dataset.mode));
    });
    document.querySelectorAll('#detail-toggle button').forEach(b => {
      b.addEventListener('click', () => this.app.setAtomDetail(b.dataset.detail));
    });
    document.getElementById('an-head').addEventListener('click', () => this.openBig());
    document.getElementById('insp-close').addEventListener('click', () => this.app.backToPeriodic());
    document.getElementById('insp-back').addEventListener('click', () => this.app.backToPeriodic());
    document.getElementById('btn-pause').addEventListener('click', () => this.app.toggleAtomPause());
    document.getElementById('insp-more').addEventListener('click', () => this.openBig());
    this.bindSearch();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b || b.disabled) return;
      this.app.stepElement(Number(b.dataset.step));
    });
    this.inspSpectrum = document.getElementById('insp-spectrum');
    addEventListener('resize', () => {
      if (this.currentElement) this.drawSpectrum(this.inspSpectrum, spectrumOf(this.currentElement));
    });
  }

  setLegend() {
    const el = document.getElementById('atlas-legend');
    if (!el) return;
    el.innerHTML = LEGEND_ORDER.map(k =>
      `<span><i style="--c:${CATEGORIES[k].color}"></i>${CATEGORIES[k].label}</span>`
    ).join('');
  }

  /* ------------------------------ search ------------------------------ */
  bindSearch() {
    const input = document.getElementById('search-input');
    const list = document.getElementById('search-list');
    if (!input || !list) return;
    this.searchHits = [];
    this.searchIdx = 0;
    const render = () => {
      const hits = searchElements(input.value);
      this.searchHits = hits;
      this.searchIdx = 0;
      if (!hits.length) {
        list.innerHTML = input.value.trim() ? '<li class="empty">没有匹配的元素</li>' : '';
        list.hidden = !input.value.trim();
        return;
      }
      list.innerHTML = hits.map((el, i) => {
        const c = CATEGORIES[el.cat].color;
        return `<li role="option" data-z="${el.z}" class="${i === 0 ? 'on' : ''}" style="--c:${c}">`
          + `<em>${el.z}</em><b>${el.sym}</b><span>${el.zh}</span><i>${el.en}</i></li>`;
      }).join('');
      list.hidden = false;
    };
    const highlight = () => {
      list.querySelectorAll('li[data-z]').forEach((li, i) => li.classList.toggle('on', i === this.searchIdx));
    };
    const pick = (z) => {
      const el = byZ[z];
      if (!el) return;
      input.value = '';
      list.hidden = true;
      input.blur();
      this.app.openElement(el);
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });
    input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 120));
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      const n = this.searchHits.length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); this.searchIdx = (this.searchIdx + 1) % n; highlight(); }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); this.searchIdx = (this.searchIdx - 1 + n) % n; highlight(); }
      else if (e.key === 'Enter' && n) { e.preventDefault(); pick(this.searchHits[this.searchIdx].z); }
      else if (e.key === 'Escape') { input.value = ''; list.hidden = true; input.blur(); }
    });
    list.addEventListener('mousedown', (e) => {
      const li = e.target.closest('li[data-z]');
      if (!li) return;
      e.preventDefault();
      pick(Number(li.dataset.z));
    });
    addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  showAtlasTip(el, p) {
    const tip = document.getElementById('atlas-tip');
    if (!tip || !el || !p) return;
    clearTimeout(this._tipTimer);
    const cat = CATEGORIES[el.cat];
    const spec = spectrumOf(el);
    const top = spec.lines.slice(0, 3);
    tip.style.setProperty('--el', cat.color);
    document.getElementById('tip-z').textContent = `Z ${String(el.z).padStart(3, '0')}`;
    document.getElementById('tip-sym').textContent = el.sym;
    document.getElementById('tip-zh').textContent = el.zh;
    document.getElementById('tip-en').textContent = el.en.toUpperCase();
    const catEl = document.getElementById('tip-cat');
    catEl.textContent = cat.label;
    catEl.style.color = cat.color;
    document.getElementById('tip-mass').textContent = el.mass;
    document.getElementById('tip-pos').textContent = `${el.group} / ${el.period}`;
    document.getElementById('tip-lines').textContent =
      `${spec.real ? '主谱线' : '模拟谱线'} ` + top.map(l => l.nm.toFixed(1)).join(' · ') + ' nm';
    const w = tip.offsetWidth || 290, h = tip.offsetHeight || 250;
    let x = p.x + 20;
    let y = p.y + 16;
    if (x + w > innerWidth - 10) x = p.x - w - 20;
    if (y + h > innerHeight - 10) y = innerHeight - h - 10;
    tip.style.left = `${Math.max(10, x)}px`;
    tip.style.top = `${Math.max(10, y)}px`;
    if (tip.hidden) {
      tip.hidden = false;
      requestAnimationFrame(() => tip.classList.add('show'));
    } else {
      tip.classList.add('show');
    }
  }

  hideAtlasTip() {
    const tip = document.getElementById('atlas-tip');
    if (!tip || tip.hidden) return;
    tip.classList.remove('show');
    clearTimeout(this._tipTimer);
    this._tipTimer = setTimeout(() => { tip.hidden = true; }, 150);
  }

  setMode(mode) {
    if (mode !== 'periodic') this.hideAtlasTip();
    this.mode = mode;
    document.querySelectorAll('#modes .mode[data-mode]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.mode === mode);
    });
    const hud = document.getElementById('hud');
    hud.classList.toggle('mode-atlas', mode === 'periodic');
    hud.classList.toggle('mode-analyze', mode === 'atom');
    const hint = document.getElementById('hint');
    hint.innerHTML = mode === 'periodic' ? '拖拽环视 · 滚轮缩放 · 点击元素卡片打开剖析' : '← → 切换元素 · 拖拽旋转 · 滚轮缩放';
  }

  openBig() {
    const small = document.getElementById('analysis');
    const big = document.getElementById('analysis-big');
    if (!small || !big || !this.currentElement) return;
    clearTimeout(this._bigCloseTimer);
    big.innerHTML = small.innerHTML;
    big.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    const head = big.querySelector('.an-head');
    if (head) {
      head.title = '收起';
      head.addEventListener('click', () => this.closeBig());
    }
    const icon = big.querySelector('.an-expand');
    if (icon) { icon.textContent = '⤡'; icon.title = '收起'; icon.setAttribute('aria-label', '收起'); }
    big.hidden = false;
    requestAnimationFrame(() => big.classList.add('open'));
  }

  closeBig() {
    const big = document.getElementById('analysis-big');
    if (!big || big.hidden) return;
    clearTimeout(this._bigCloseTimer);
    big.classList.remove('open');
    this._bigCloseTimer = setTimeout(() => { big.hidden = true; }, 260);
  }

  setDetail(mode) {
    document.querySelectorAll('#detail-toggle button').forEach(b => {
      b.classList.toggle('on', b.dataset.detail === mode);
    });
  }

  showInspector(el) {
    this.currentElement = el;
    this.closeBig();
    const spec = spectrumOf(el);
    const cfg = electronConfig(el.z);
    const cat = CATEGORIES[el.cat];
    const ph = PHYS[el.sym] || {};
    const synth = isSynthetic(el);
    const massNum = parseFloat(el.mass) || el.z;
    const insp = document.getElementById('inspector');
    const panel = document.getElementById('analysis');
    clearTimeout(this._panelTimer);
    insp.hidden = false;
    panel.hidden = false;
    insp.style.setProperty('--el', cat.color);
    requestAnimationFrame(() => { insp.classList.add('is-open'); panel.classList.add('is-open'); });

    document.getElementById('insp-z').textContent = `Z ${String(el.z).padStart(3, '0')}`;
    document.getElementById('insp-sym').textContent = el.sym;
    document.getElementById('insp-zh').textContent = el.zh;
    document.getElementById('insp-en').textContent = el.en.toUpperCase();
    const inspCat = document.getElementById('insp-cat');
    inspCat.textContent = cat.label;
    inspCat.style.color = cat.color;
    inspCat.style.borderColor = cat.color + '55';
    document.getElementById('insp-quote').textContent = noteOf(el);
    document.getElementById('insp-mass').textContent = el.mass;
    document.getElementById('insp-pos').textContent = `${el.group} / ${el.period}`;
    const cfgEl = document.getElementById('insp-cfg');
    cfgEl.textContent = cfg.short;
    cfgEl.title = cfg.config;
    document.getElementById('insp-shells').textContent = cfg.shells.join(' · ');
    document.getElementById('insp-spec-tag').textContent = spec.real ? '实测主谱线' : '模拟谱线';
    this.drawSpectrum(this.inspSpectrum, spec);
    const top = spec.lines.slice().sort((a, b) => b.i - a.i).slice(0, 4);
    document.getElementById('insp-spec-vals').innerHTML =
      top.map((l, i) => `<span><b style="opacity:${i === 0 ? 1 : .8}">${l.nm.toFixed(1)}</b> nm</span>`).join('');

    panel.style.setProperty('--el', cat.color);
    const smallIcon = document.getElementById('an-expand');
    if (smallIcon) { smallIcon.textContent = '⤢'; smallIcon.title = '放大'; }
    const cap = document.getElementById('atom-caption');
    if (cap) {
      cap.style.setProperty('--el', cat.color);
      document.getElementById('ac-sym').textContent = el.sym;
      document.getElementById('ac-name').textContent = `${el.zh} · ${el.en.toUpperCase()}`;
      document.getElementById('ac-p').textContent = el.z;
      document.getElementById('ac-n').textContent = Math.max(0, Math.round(massNum) - el.z);
      document.getElementById('ac-e').textContent = el.z;
      document.getElementById('ac-shells').textContent = cfg.shells.map((n, i) => `${SHELL_NAMES[i]} ${n}`).join(' · ');
    }
    this.setPaused(this.app.paused);
    document.getElementById('an-z').textContent = `Z ${String(el.z).padStart(3, '0')}`;
    document.getElementById('an-block').textContent = blockOf(el) + ' 区';
    document.getElementById('an-phase').textContent = phaseOf(el);
    document.getElementById('an-density').textContent = ph.d || '—';
    document.getElementById('an-melt').textContent = ph.m || '—';
    document.getElementById('an-boil').textContent = ph.bo || '—';
    document.getElementById('an-en').textContent = ph.en || '—';
    document.getElementById('an-ox').textContent = ph.ox || '—';
    document.getElementById('an-radius').textContent = ph.r || '—';
    document.getElementById('an-year').textContent = ph.y ? `${ph.y}${ph.by && ph.by !== '—' ? ' · ' + ph.by : ''}` : (synth ? '合成元素' : '—');
    document.getElementById('an-ab').textContent = ph.ab || (synth ? '—（合成）' : '—');
    document.getElementById('an-protons').textContent = el.z;
    document.getElementById('an-neutrons').textContent = Math.max(0, Math.round(massNum) - el.z);
    document.getElementById('an-electrons').textContent = el.z;
    const comps = COMPOUNDS[el.sym] || [];
    document.getElementById('an-compounds').innerHTML = comps.length
      ? comps.map(([f, n]) => `<span><b>${f}</b><em>${n}</em></span>`).join('')
      : '<span class="none">暂无稳定化合物</span>';
    const rxn = REACTIONS[el.sym];
    document.getElementById('an-reaction').innerHTML = rxn
      ? `<b>${rxn.eq}</b><em>${rxn.note || ''}</em>`
      : '<span class="none">暂无收录</span>';
    const maxShell = Math.max(...cfg.shells);
    document.getElementById('an-shells').innerHTML = cfg.shells.map((n, i) =>
      `<div class="sh"><span>${SHELL_NAMES[i] || i + 1}</span><i><b style="width:${Math.round((n / maxShell) * 100)}%"></b></i><em>${n}</em></div>`
    ).join('');
    document.getElementById('an-note').textContent = synth
      ? '合成元素：部分物理性质为预测或未知，以 — 表示。'
      : '物性参考 CRC / IUPAC 常用值；未知项以 — 表示。';
    this.setMode('atom');
    this.setDetail(this.app.atomDetail || 'structure');
    this.updateStep(el);
  }

  updateStep(el) {
    const prev = byZ[el.z - 1];
    const next = byZ[el.z + 1];
    const set = (btnId, symId, zId, target) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.disabled = !target;
      const sym = document.getElementById(symId);
      const zEl = document.getElementById(zId);
      if (target) {
        if (sym) sym.textContent = target.sym;
        if (zEl) zEl.textContent = target.z;
      } else {
        if (sym) sym.textContent = '—';
        if (zEl) zEl.textContent = '·';
      }
    };
    set('insp-prev', 'insp-prev-sym', 'insp-prev-z', prev);
    set('insp-next', 'insp-next-sym', 'insp-next-z', next);
  }

  hideInspector() {
    const insp = document.getElementById('inspector');
    const panel = document.getElementById('analysis');
    insp.classList.remove('is-open');
    panel.classList.remove('is-open');
    this.closeBig();
    clearTimeout(this._panelTimer);
    this._panelTimer = setTimeout(() => {
      insp.hidden = true;
      panel.hidden = true;
    }, 470);
    this.currentElement = null;
  }

  setPaused(on) {
    const b = document.getElementById('btn-pause');
    if (!b) return;
    b.textContent = on ? '▶' : '⏸';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.title = on ? '继续电子轨道' : '暂停电子轨道';
    b.setAttribute('aria-label', b.title);
  }

  drawSpectrum(canvas, spec) {
    if (!canvas) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    if (!w) return;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const x = canvas.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);
    const padL = 4, padR = 4;
    const barW = w - padL - padR;
    const barY = Math.round(h * 0.36);
    const barH = Math.max(20, Math.round(h * 0.4));
    const lo = 380, hi = 720;
    const map = (nm) => padL + ((Math.max(lo, Math.min(hi, nm)) - lo) / (hi - lo)) * barW;

    const bg = x.createLinearGradient(0, barY, 0, barY + barH);
    bg.addColorStop(0, 'rgba(8,14,18,.9)');
    bg.addColorStop(1, 'rgba(2,4,6,.9)');
    x.fillStyle = bg;
    x.fillRect(padL, barY, barW, barH);
    x.strokeStyle = 'rgba(130,210,255,.12)';
    x.strokeRect(padL + .5, barY + .5, barW - 1, barH - 1);

    x.font = '10px "SFMono-Regular",Menlo,monospace';
    x.fillStyle = 'rgba(120,150,170,.55)';
    x.textAlign = 'center';
    [400, 500, 600, 700].forEach(nm => {
      const px = map(nm);
      x.beginPath(); x.moveTo(px, barY); x.lineTo(px, barY + barH);
      x.strokeStyle = 'rgba(120,200,255,.07)'; x.stroke();
      x.fillText(String(nm), px, barY + barH + 12);
    });

    const lines = spec.lines.filter(l => l.nm >= lo && l.nm <= hi);
    const maxI = lines.reduce((a, l) => Math.max(a, l.i), 0.001);
    lines.forEach(l => {
      const px = map(l.nm);
      const rgb = wavelengthToRGB(l.nm);
      const a = Math.min(1, 0.25 + (l.i / maxI) * 0.85);
      const hh = barH * (0.3 + 0.7 * (l.i / maxI));
      const grad = x.createLinearGradient(0, barY + barH - hh, 0, barY + barH);
      grad.addColorStop(0, rgbCss(rgb, 0));
      grad.addColorStop(.55, rgbCss(rgb, a * .8));
      grad.addColorStop(1, rgbCss(rgb, a));
      x.fillStyle = grad;
      x.fillRect(px - 1.2, barY + barH - hh, 2.4, hh);
      x.save();
      x.shadowColor = rgbCss(rgb, 1);
      x.shadowBlur = 12;
      x.globalAlpha = a;
      x.fillStyle = rgbCss(rgb, 1);
      x.fillRect(px - 0.7, barY + barH - hh, 1.4, hh);
      x.restore();
      const g2 = x.createRadialGradient(px, barY + barH * .55, 0, px, barY + barH * .55, 18);
      g2.addColorStop(0, rgbCss(rgb, 0.16 * a));
      g2.addColorStop(1, rgbCss(rgb, 0));
      x.fillStyle = g2;
      x.fillRect(px - 20, barY, 40, barH);
    });

    const placed = [];
    let row = 0;
    lines.slice().sort((a, b) => b.i - a.i).slice(0, 4).forEach(l => {
      const px = map(l.nm);
      if (placed.some(p => Math.abs(p - px) < 38)) return;
      placed.push(px);
      const py = barY - 3 - (row % 2) * 11;
      row++;
      const rgb = wavelengthToRGB(l.nm);
      x.font = '10px "SFMono-Regular",Menlo,monospace';
      x.textAlign = 'center';
      x.fillStyle = rgbCss(rgb.map(v => 0.55 + v * 0.45), 0.9);
      x.fillText(`${l.nm.toFixed(1)}`, px, py);
    });
  }

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2300);
  }

  boot(p, label) {
    document.getElementById('boot-bar').style.width = `${Math.round(p * 100)}%`;
    if (label) document.getElementById('boot-step').textContent = label;
    if (p >= 1) setTimeout(() => document.getElementById('boot').classList.add('done'), 260);
  }
}
/* Rank elements for a query: Z number, symbol, Chinese or English name. */
export function searchElements(q, limit = 8) {
  const t = String(q || '').trim().toLowerCase();
  if (!t) return [];
  if (/^\d+$/.test(t)) {
    const z = Number(t);
    const exact = byZ[z] ? [byZ[z]] : [];
    const more = ELEMENTS.filter(e => e.z !== z && String(e.z).startsWith(t));
    return exact.concat(more).slice(0, limit);
  }
  const scored = [];
  for (const e of ELEMENTS) {
    const sym = e.sym.toLowerCase(), en = e.en.toLowerCase();
    let s = -1;
    if (sym === t) s = 0;
    else if (e.zh === t) s = 0;
    else if (en === t) s = 1;
    else if (sym.startsWith(t)) s = 2;
    else if (en.startsWith(t)) s = 3;
    else if (e.zh.includes(t)) s = 4;
    else if (en.includes(t)) s = 5;
    if (s >= 0) scored.push([s, e]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].z - b[1].z).slice(0, limit).map(x => x[1]);
}
