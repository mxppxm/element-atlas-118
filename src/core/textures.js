import * as THREE from 'three';

/* ------------------------------------------------------------------
   Procedural texture factory. Every pixel here is generated at runtime;
   the project ships zero image / model / audio assets.
------------------------------------------------------------------- */

export function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, x: c.getContext('2d') };
}

export function tex(c, { srgb = true, repeat = [1, 1], aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

function rnd(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* height canvas → normal map */
export function normalsFromHeight(heightCanvas, strength = 2.2) {
  const w = heightCanvas.width, h = heightCanvas.height;
  const src = heightCanvas.getContext('2d').getImageData(0, 0, w, h).data;
  const { c, x } = canvas2d(w, h);
  const out = x.createImageData(w, h);
  const g = (px, py) => src[((py & (h - 1)) * w + (px & (w - 1))) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let px = 0; px < w; px++) {
      const dx = (g(px + 1, y) - g(px - 1, y)) * strength;
      const dy = (g(px, y + 1) - g(px, y - 1)) * strength;
      let nx = -dx, ny = -dy, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * w + px) * 4;
      out.data[i] = (nx * 0.5 + 0.5) * 255;
      out.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      out.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  x.putImageData(out, 0, 0);
  return c;
}

function grain(x, w, h, amount = 10, r = Math.random, alpha = 0.06) {
  x.save();
  x.globalAlpha = alpha;
  for (let i = 0; i < amount; i++) {
    const v = Math.floor(r() * 255);
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  x.restore();
}

/* ------------------------------------------------------------------ *
 *  ENVIRONMENT (equirect softbox room) — used for glass + metal
 * ------------------------------------------------------------------ */
export function environmentTexture() {
  const W = 1024, H = 512;
  const { c, x } = canvas2d(W, H);
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#05070b');
  bg.addColorStop(0.42, '#0a121b');
  bg.addColorStop(0.52, '#0c1218');
  bg.addColorStop(0.56, '#04060a');
  bg.addColorStop(1, '#020304');
  x.fillStyle = bg;
  x.fillRect(0, 0, W, H);

  // ceiling light troughs
  x.globalCompositeOperation = 'lighter';
  const soft = (cx, cy, rx, ry, col, a) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    g.addColorStop(0, col.replace('A', String(a)));
    g.addColorStop(0.45, col.replace('A', String(a * 0.5)));
    g.addColorStop(1, col.replace('A', '0'));
    x.save();
    x.translate(cx, cy);
    x.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    x.translate(-cx, -cy);
    x.fillStyle = g;
    x.beginPath();
    x.arc(cx, cy, Math.max(rx, ry), 0, Math.PI * 2);
    x.fill();
    x.restore();
  };
  soft(180, 52, 150, 34, 'rgba(180,225,255,A)', 0.95);
  soft(520, 40, 220, 26, 'rgba(150,205,255,A)', 0.8);
  soft(860, 58, 140, 30, 'rgba(255,150,90,A)', 0.5);
  soft(60, 250, 90, 190, 'rgba(255,60,190,A)', 0.5);
  soft(990, 235, 80, 200, 'rgba(70,220,255,A)', 0.55);
  soft(300, 300, 120, 60, 'rgba(90,120,255,A)', 0.22);
  soft(720, 330, 180, 60, 'rgba(255,80,120,A)', 0.16);
  soft(512, 500, 420, 60, 'rgba(30,60,90,A)', 0.35);
  x.globalCompositeOperation = 'source-over';

  // low horizon sheen — gives glossy counter tops something to reflect
  const hz = x.createLinearGradient(0, H * 0.38, 0, H * 0.7);
  hz.addColorStop(0, 'rgba(140,200,250,0)');
  hz.addColorStop(0.5, 'rgba(185,225,255,.8)');
  hz.addColorStop(1, 'rgba(140,200,250,0)');
  x.fillStyle = hz;
  x.fillRect(0, H * 0.38, W, H * 0.32);
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const cx = 40 + i * 104;
    soft(cx, H * 0.5, 58, 10, 'rgba(210,240,255,A)', 0.65);
  }
  soft(80, H * 0.5, 40, 8, 'rgba(255,110,200,A)', 0.5);
  soft(W - 80, H * 0.5, 40, 8, 'rgba(80,220,255,A)', 0.5);
  x.globalCompositeOperation = 'source-over';

  // subtle room panelling reflections
  x.globalAlpha = 0.08;
  for (let i = 0; i < 18; i++) {
    x.fillStyle = i % 2 ? '#7dd6ff' : '#ff7ad9';
    x.fillRect(i * 61, 180, 2, 110);
  }
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------ *
 *  BRUSHED OBSIDIAN counter top
 * ------------------------------------------------------------------ */
export function brushedTextures() {
  const W = 1024, H = 1024;
  const r = rnd(7134);
  const A = canvas2d(W, H);
  A.x.fillStyle = '#4b5560';
  A.x.fillRect(0, 0, W, H);
  // long brushed fibres
  for (let i = 0; i < 2600; i++) {
    const y = r() * H;
    const len = 80 + r() * 900;
    const a = 0.02 + r() * 0.08;
    A.x.strokeStyle = r() > 0.45 ? `rgba(190,215,235,${a})` : `rgba(10,14,18,${a * 1.6})`;
    A.x.lineWidth = 0.5 + r() * 1.6;
    A.x.beginPath();
    A.x.moveTo(r() * W - len * 0.3, y);
    A.x.lineTo(r() * W + len, y + (r() - 0.5) * 2);
    A.x.stroke();
  }
  // faint mineral veining
  for (let i = 0; i < 7; i++) {
    A.x.strokeStyle = `rgba(120,160,180,${0.02 + r() * 0.03})`;
    A.x.lineWidth = 0.7 + r() * 1.4;
    A.x.beginPath();
    let px = r() * W, py = r() * H;
    A.x.moveTo(px, py);
    for (let k = 0; k < 8; k++) {
      px += (r() - 0.5) * 260; py += (r() - 0.4) * 90;
      A.x.lineTo(px, py);
    }
    A.x.stroke();
  }

  const Hh = canvas2d(W, H);
  Hh.x.fillStyle = '#888';
  Hh.x.fillRect(0, 0, W, H);
  for (let i = 0; i < 3200; i++) {
    const y = r() * H;
    const v = 90 + Math.floor(r() * 90);
    Hh.x.strokeStyle = `rgba(${v},${v},${v},${0.15 + r() * 0.5})`;
    Hh.x.lineWidth = 0.5 + r() * 2;
    Hh.x.beginPath();
    Hh.x.moveTo(r() * W, y);
    Hh.x.lineTo(r() * W, y + (r() - 0.5) * 1.5);
    Hh.x.stroke();
  }
  grain(Hh.x, W, H, 4000, r, 0.12);

  const R = canvas2d(W, H);
  R.x.fillStyle = '#3a3a3a';
  R.x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1300; i++) {
    const y = r() * H;
    const g = 30 + r() * 55;
    R.x.strokeStyle = `rgba(${g},${g},${g},.55)`;
    R.x.lineWidth = 1 + r() * 3;
    R.x.beginPath(); R.x.moveTo(r() * W, y); R.x.lineTo(r() * W, y + (r() - 0.5) * 2); R.x.stroke();
  }

  return {
    map: tex(A.c, { repeat: [3, 3], aniso: 16 }),
    normalMap: tex(normalsFromHeight(Hh.c, 1.15), { srgb: false, repeat: [3, 3], aniso: 16 }),
    roughnessMap: tex(R.c, { srgb: false, repeat: [3, 3], aniso: 16 }),
  };
}

/* ------------------------------------------------------------------ *
 *  BRICK WALL (wet + dry variants)
 * ------------------------------------------------------------------ */
export function brickTextures(variant = 'wet') {
  const W = 1024, H = 1024;
  const r = rnd(variant === 'wet' ? 991 : 992);
  const bw = 158, bh = 74, gap = 7;

  const A = canvas2d(W, H), Hh = canvas2d(W, H), R = canvas2d(W, H);
  A.x.fillStyle = '#141210';
  A.x.fillRect(0, 0, W, H);
  Hh.x.fillStyle = '#2a2a2a';
  Hh.x.fillRect(0, 0, W, H);
  R.x.fillStyle = 'rgb(212,212,212)';
  R.x.fillRect(0, 0, W, H);

  const rows = Math.ceil(H / (bh + gap)) + 1;
  for (let row = 0; row < rows; row++) {
    const y = row * (bh + gap) - bh * 0.5;
    const off = row % 2 ? (bw + gap) * 0.5 : 0;
    for (let col = -1; col < 8; col++) {
      const x0 = col * (bw + gap) + off;
      const tint = 0.78 + r() * 0.5;
      const base = [Math.round(45 * tint), Math.round(38 * tint), Math.round(32 * tint)];
      A.x.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
      A.x.fillRect(x0, y, bw, bh);
      // per brick shading
      const g = A.x.createLinearGradient(x0, y, x0, y + bh);
      g.addColorStop(0, 'rgba(255,230,210,.05)');
      g.addColorStop(1, 'rgba(0,0,0,.22)');
      A.x.fillStyle = g;
      A.x.fillRect(x0, y, bw, bh);
      // pitting
      for (let k = 0; k < 26; k++) {
        A.x.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.18})`;
        A.x.fillRect(x0 + r() * bw, y + r() * bh, 1 + r() * 3, 1 + r() * 2);
      }
      // chipped edges
      A.x.fillStyle = 'rgba(12,10,9,.55)';
      A.x.fillRect(x0, y + bh - 2, bw, 2);
      A.x.fillRect(x0 + bw - 2, y, 2, bh);

      const hv = 120 + r() * 40;
      Hh.x.fillStyle = `rgb(${hv},${hv},${hv})`;
      Hh.x.fillRect(x0, y, bw, bh);
      Hh.x.fillStyle = 'rgba(0,0,0,.22)';
      Hh.x.fillRect(x0, y + bh - 3, bw, 3);
      Hh.x.fillRect(x0 + bw - 3, y, 3, bh);
      for (let k = 0; k < 12; k++) {
        Hh.x.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.2})`;
        Hh.x.fillRect(x0 + r() * bw, y + r() * bh, 2, 2);
      }
    }
  }

  // soot / grime streaks
  for (let i = 0; i < 90; i++) {
    const x0 = r() * W;
    const g = A.x.createLinearGradient(x0, 0, x0 + (r() - 0.5) * 40, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.4, `rgba(8,7,6,${0.06 + r() * 0.12})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    A.x.fillStyle = g;
    A.x.fillRect(x0, 0, 6 + r() * 26, H);
  }

  // wetness: drips from top, pooled at the bottom
  const wet = canvas2d(W, H);
  wet.x.fillStyle = '#000'; wet.x.fillRect(0, 0, W, H);
  const drips = variant === 'wet' ? 40 : 12;
  for (let i = 0; i < drips; i++) {
    const x0 = r() * W, w = 8 + r() * 46;
    const g = wet.x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255,255,255,.9)');
    g.addColorStop(0.35 + r() * 0.35, 'rgba(255,255,255,.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    wet.x.fillStyle = g;
    wet.x.fillRect(x0, 0, w, H);
  }
  // puddle band at the bottom
  const pg = wet.x.createLinearGradient(0, H * 0.72, 0, H);
  pg.addColorStop(0, 'rgba(255,255,255,0)');
  pg.addColorStop(1, variant === 'wet' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,.45)');
  wet.x.fillStyle = pg;
  wet.x.fillRect(0, H * 0.7, W, H * 0.3);
  for (let i = 0; i < 40; i++) {
    const cx = r() * W, cy = H * (0.75 + r() * 0.25), rr = 20 + r() * 90;
    const g = wet.x.createRadialGradient(cx, cy, 0, cx, cy, rr);
    g.addColorStop(0, 'rgba(255,255,255,.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    wet.x.fillStyle = g;
    wet.x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }

  // combine roughness: dry base 200, wet 26
  const wd = wet.x.getImageData(0, 0, W, H).data;
  const rd = R.x.getImageData(0, 0, W, H).data;
  const out = R.x.createImageData(W, H);
  for (let i = 0; i < wd.length; i += 4) {
    const m = wd[i] / 255;
    const base = rd[i];
    const wetVal = 24 + (1 - m) * 26;
    const dryVal = 172 + (1 - m) * 30;
    const v = variant === 'wet' ? base * (1 - m) + wetVal * m : base * (1 - m * 0.35) + dryVal * m * 0.35;
    out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
    out.data[i + 3] = 255;
  }
  R.x.putImageData(out, 0, 0);

  // darken albedo under wet patches
  if (variant === 'wet') {
    const ad = A.x.getImageData(0, 0, W, H);
    for (let i = 0; i < ad.data.length; i += 4) {
      const m = wd[i] / 255;
      const k = 1 - m * 0.34;
      ad.data[i] *= k * 0.92; ad.data[i + 1] *= k * 0.94; ad.data[i + 2] *= k * 1.02;
    }
    A.x.putImageData(ad, 0, 0);
  }

  return {
    map: tex(A.c, { repeat: [3, 1.35], aniso: 16 }),
    normalMap: tex(normalsFromHeight(Hh.c, 2.6), { srgb: false, repeat: [3, 1.35], aniso: 16 }),
    roughnessMap: tex(R.c, { srgb: false, repeat: [3, 1.35], aniso: 16 }),
  };
}

/* ------------------------------------------------------------------ *
 *  WET CONCRETE FLOOR
 * ------------------------------------------------------------------ */
export function floorTextures() {
  const W = 1024, H = 1024;
  const r = rnd(3301);
  const A = canvas2d(W, H), Hh = canvas2d(W, H), R = canvas2d(W, H);
  A.x.fillStyle = '#0a0c0e'; A.x.fillRect(0, 0, W, H);
  Hh.x.fillStyle = '#808080'; Hh.x.fillRect(0, 0, W, H);
  R.x.fillStyle = '#b4b4b4'; R.x.fillRect(0, 0, W, H);

  // large slab joints
  A.x.strokeStyle = 'rgba(0,0,0,.5)'; A.x.lineWidth = 3;
  A.x.beginPath(); A.x.moveTo(0, H / 2); A.x.lineTo(W, H / 2);
  A.x.moveTo(W / 2, 0); A.x.lineTo(W / 2, H); A.x.stroke();

  for (let i = 0; i < 2400; i++) {
    const x0 = r() * W, y0 = r() * H, s = 1 + r() * 5;
    const v = Math.floor(10 + r() * 30);
    A.x.fillStyle = `rgba(${v},${v + 2},${v + 4},${0.1 + r() * 0.3})`;
    A.x.fillRect(x0, y0, s, s);
    const hv = 90 + Math.floor(r() * 90);
    Hh.x.fillStyle = `rgba(${hv},${hv},${hv},.3)`;
    Hh.x.fillRect(x0, y0, s, s);
  }
  // puddles
  const wet = canvas2d(W, H);
  wet.x.fillStyle = '#000'; wet.x.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) {
    const cx = r() * W, cy = r() * H, rx = 40 + r() * 190, ry = rx * (0.25 + r() * 0.5);
    const g = wet.x.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, 'rgba(255,255,255,.95)');
    g.addColorStop(0.6, 'rgba(255,255,255,.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    wet.x.save(); wet.x.translate(cx, cy); wet.x.scale(1, ry / rx); wet.x.translate(-cx, -cy);
    wet.x.fillStyle = g; wet.x.beginPath(); wet.x.arc(cx, cy, rx, 0, Math.PI * 2); wet.x.fill(); wet.x.restore();
  }
  const wd = wet.x.getImageData(0, 0, W, H).data;
  const rd = R.x.getImageData(0, 0, W, H).data;
  const out = R.x.createImageData(W, H);
  for (let i = 0; i < wd.length; i += 4) {
    const m = wd[i] / 255;
    out.data[i] = out.data[i + 1] = out.data[i + 2] = rd[i] * (1 - m) + 18 * m;
    out.data[i + 3] = 255;
  }
  R.x.putImageData(out, 0, 0);

  return {
    map: tex(A.c, { repeat: [5, 5], aniso: 16 }),
    normalMap: tex(normalsFromHeight(Hh.c, 1.2), { srgb: false, repeat: [5, 5], aniso: 16 }),
    roughnessMap: tex(R.c, { srgb: false, repeat: [5, 5], aniso: 16 }),
  };
}

/* ------------------------------------------------------------------ *
 *  DECALS / LABELS
 * ------------------------------------------------------------------ */
export function labelTexture(lines, { w = 512, h = 256, accent = '#ff7a3c', bg = '#0a0d10' } = {}) {
  const { c, x } = canvas2d(w, h);
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(160,220,255,.18)'; x.lineWidth = 3;
  x.strokeRect(10, 10, w - 20, h - 20);
  // hazard ticks
  x.fillStyle = accent;
  x.globalAlpha = 0.85;
  for (let i = 0; i < 6; i++) x.fillRect(20 + i * 12, 18, 6, 5);
  x.globalAlpha = 1;
  const [big, mid, small] = lines;
  x.fillStyle = '#e9f7ff';
  x.font = `600 ${Math.floor(h * 0.34)}px "SFMono-Regular",Menlo,monospace`;
  x.textBaseline = 'middle';
  x.fillText(big, 26, h * 0.44);
  x.fillStyle = accent;
  x.font = `500 ${Math.floor(h * 0.13)}px "SFMono-Regular",Menlo,monospace`;
  x.fillText(mid, 28, h * 0.7);
  x.fillStyle = 'rgba(150,190,215,.7)';
  x.font = `400 ${Math.floor(h * 0.08)}px "SFMono-Regular",Menlo,monospace`;
  x.fillText(small, 28, h * 0.85);
  return tex(c, { aniso: 16 });
}

export function hazardTexture() {
  const { c, x } = canvas2d(1024, 256);
  x.fillStyle = '#0a0c0f'; x.fillRect(0, 0, 1024, 256);
  x.save();
  x.beginPath(); x.rect(0, 46, 1024, 54); x.clip();
  for (let i = -60; i < 1100; i += 64) {
    x.fillStyle = i % 128 === 0 ? '#c9a227' : '#141414';
    x.beginPath();
    x.moveTo(i, 100); x.lineTo(i + 32, 46); x.lineTo(i + 64, 46); x.lineTo(i + 32, 100);
    x.fill();
  }
  x.restore();
  x.fillStyle = '#cfdde6';
  x.font = '600 44px "SFMono-Regular",Menlo,monospace';
  x.fillText('HIGH VOLTAGE', 40, 180);
  x.fillStyle = '#ff7a3c';
  x.font = '500 26px "SFMono-Regular",Menlo,monospace';
  x.fillText('15 kV · DO NOT TOUCH', 42, 220);
  return tex(c, { aniso: 16 });
}

export function glowSprite(colA = '#ffffff', colB = 'rgba(255,255,255,0)') {
  const { c, x } = canvas2d(256, 256);
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, colA);
  g.addColorStop(0.18, colA);
  g.addColorStop(0.5, 'rgba(255,255,255,.22)');
  g.addColorStop(1, colB);
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function scanTexture() {
  const { c, x } = canvas2d(512, 512);
  x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 512, 512);
  x.strokeStyle = 'rgba(120,240,255,.5)'; x.lineWidth = 1;
  for (let i = 0; i < 512; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function wallProjectionTexture(text, color) {
  const { c, x } = canvas2d(1024, 256);
  x.clearRect(0, 0, 1024, 256);
  x.font = '800 168px "Helvetica Neue",Arial,sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = color;
  x.shadowColor = color;
  x.shadowBlur = 46;
  x.fillText(text, 512, 136);
  x.shadowBlur = 16;
  x.globalAlpha = 0.5;
  x.fillText(text, 512, 136);
  return new THREE.CanvasTexture(c);
}

export function fontMask(text, { w = 720, h = 240, weight = 800, family = '"Helvetica Neue",Arial,sans-serif', stroke = 5 } = {}) {
  const { c, x } = canvas2d(w, h);
  x.clearRect(0, 0, w, h);
  x.font = `${weight} 168px ${family}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = '#fff';
  if (stroke > 0) {
    x.lineWidth = stroke * 2;
    x.strokeStyle = '#fff';
    x.strokeText(text, w / 2, h / 2);
  }
  x.fillText(text, w / 2, h / 2);
  return c;
}