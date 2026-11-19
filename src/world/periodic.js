import * as THREE from 'three';
import { ELEMENTS, CATEGORIES } from '../data/elements.js';
import { canvas2d } from '../core/textures.js';

/* ------------------------------------------------------------------
   The floating 118-element star ring. One instanced card mesh,
   one procedurally painted atlas, fully raycast-able.
------------------------------------------------------------------- */

const COLS = 18;
const ROWS = 9;
const CW = 160;
const CH = 200;
const R = 16;
const DTHETA = 0.0612;
const ROW_PITCH = 1.2;

function roundedRect(ctx, px, py, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(px + r, py);
  ctx.lineTo(px + w - r, py);
  ctx.quadraticCurveTo(px + w, py, px + w, py + r);
  ctx.lineTo(px + w, py + h - r);
  ctx.quadraticCurveTo(px + w, py + h, px + w - r, py + h);
  ctx.lineTo(px + r, py + h);
  ctx.quadraticCurveTo(px, py + h, px, py + h - r);
  ctx.lineTo(px, py + r);
  ctx.quadraticCurveTo(px, py, px + r, py);
  ctx.closePath();
}

function buildAtlas() {
  const { c, x } = canvas2d(CW * COLS, CH * ROWS);
  x.clearRect(0, 0, c.width, c.height);

  for (const el of ELEMENTS) {
    const px = el.col * CW;
    const py = el.row * CH;
    const cat = CATEGORIES[el.cat];
    const col = cat.color;

    x.save();
    x.translate(px, py);
    // card bg
    roundedRect(x, 6, 6, CW - 12, CH - 12, 11);
    const bg = x.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, 'rgba(20,28,36,.96)');
    bg.addColorStop(.55, 'rgba(10,15,20,.94)');
    bg.addColorStop(1, 'rgba(5,8,11,.96)');
    x.fillStyle = bg;
    x.fill();

    // faint tinted inner glow
    const ig = x.createRadialGradient(CW * 0.5, CH * 0.42, 6, CW * 0.5, CH * 0.42, CW * 0.75);
    ig.addColorStop(0, `${col}22`);
    ig.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = ig;
    roundedRect(x, 6, 6, CW - 12, CH - 12, 11);
    x.fill();

    // border
    roundedRect(x, 6.5, 6.5, CW - 13, CH - 13, 11);
    x.strokeStyle = el.featured ? `${col}` : `${col}55`;
    x.lineWidth = el.featured ? 2.6 : 1.35;
    x.stroke();

    // left rail
    x.restore();
    x.save();
    x.translate(px, py);
    x.fillStyle = col;
    x.globalAlpha = el.featured ? 1 : 0.75;
    x.fillRect(0, 16, 5, CH - 32);
    x.globalAlpha = 1;

    // bottom tick
    x.globalAlpha = 0.5;
    x.fillRect(28, CH - 22, CW - 52, 1.4);
    x.globalAlpha = 1;

    // atomic number
    x.fillStyle = col;
    x.globalAlpha = 0.9;
    x.font = '600 25px "SFMono-Regular",Menlo,monospace';
    x.fillText(String(el.z).padStart(2, '0'), 16, 34);
    x.globalAlpha = 1;

    // featured marker
    if (el.featured) {
      x.fillStyle = col;
      x.beginPath();
      x.arc(CW - 21, 24, 3.6, 0, Math.PI * 2);
      x.fill();
      x.shadowColor = col;
      x.shadowBlur = 10;
      x.beginPath();
      x.arc(CW - 21, 24, 2.0, 0, Math.PI * 2);
      x.fill();
      x.shadowBlur = 0;
    }

    // symbol
    x.textAlign = 'center';
    x.shadowColor = col;
    x.shadowBlur = el.featured ? 22 : 9;
    x.fillStyle = el.featured ? '#ffffff' : '#eef8ff';
    x.font = `600 ${el.sym.length > 1 ? 62 : 72}px "SFMono-Regular",Menlo,monospace`;
    x.fillText(el.sym, CW * 0.54, CH * 0.49);
    x.shadowBlur = 0;

    // chinese name
    x.fillStyle = 'rgba(232,246,255,.92)';
    x.font = '500 36px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
    x.fillText(el.zh, CW * 0.54, CH * 0.715);

    // mass
    x.fillStyle = 'rgba(150,178,196,.72)';
    x.font = '400 20px "SFMono-Regular",Menlo,monospace';
    x.fillText(el.mass, CW * 0.54, CH * 0.875);

    // category dot
    x.globalAlpha = .55;
    x.fillStyle = col;
    x.fillRect(16, CH - 40, 8, 8);
    x.globalAlpha = 1;

    x.restore();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

function starRingTexture() {
  const { c, x } = canvas2d(512, 512);
  x.clearRect(0, 0, 512, 512);
  const g = x.createRadialGradient(256, 256, 30, 256, 256, 250);
  g.addColorStop(0, 'rgba(92,231,255,0)');
  g.addColorStop(.72, 'rgba(92,231,255,.35)');
  g.addColorStop(.78, 'rgba(120,240,255,.8)');
  g.addColorStop(.83, 'rgba(92,231,255,.15)');
  g.addColorStop(1, 'rgba(92,231,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class PeriodicWall {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.group.position.set(0, 11.15, 14);
    this.group.scale.setScalar(0.95);
    this.reveal = 0;
    this.revealTarget = 0;
    this.hovered = -1;
    this.selectedCard = -1;
    this.enabled = false;
    this.time = 0;
    this._needInstanceUpdate = true;
    this._dirty = true;

    this.atlas = buildAtlas();
    this.buildCards();
    this.buildAxisLabels();
    this.buildDecor();
  }

  buildCards() {
    const inst = new THREE.PlaneGeometry(0.88, 1.1);
    inst.computeBoundingSphere();

    const count = ELEMENTS.length;
    const aOffset = new Float32Array(count * 2);
    const aScale = new Float32Array(count * 2);
    const aGlow = new Float32Array(count);
    const aReveal = new Float32Array(count);
    const aTint = new Float32Array(count * 3);
    const meta = [];

    ELEMENTS.forEach((el, i) => {
      aOffset[i * 2] = el.col / COLS;
      aOffset[i * 2 + 1] = 1 - (el.row + 1) / ROWS;
      aScale[i * 2] = 1 / COLS;
      aScale[i * 2 + 1] = 1 / ROWS;
      const c = new THREE.Color(CATEGORIES[el.cat].color);
      aTint[i * 3] = c.r; aTint[i * 3 + 1] = c.g; aTint[i * 3 + 2] = c.b;

      const theta = (el.col - (COLS - 1) / 2) * DTHETA;
      const yBase = (3 - el.row) * ROW_PITCH + (el.row >= 7 ? -0.62 - (el.row - 7) * ROW_PITCH + ROW_PITCH * 0 : 0);
      meta.push({
        el, theta,
        pos: new THREE.Vector3(Math.sin(theta) * R, yBase + 1.7, -Math.cos(theta) * R),
        rot: -theta,
      });
    });
    // fix f-block row y: rows 7,8 sit below row 6 with a 0.55 gap
    meta.forEach((m, i) => {
      if (m.el.row >= 7) {
        m.pos.y = (3 - 6) * ROW_PITCH - 0.6 - (m.el.row - 6) * ROW_PITCH + 1.7;
      }
    });

    this.meta = meta;
    this.instanceData = meta.map((m, i) => ({
      p: 0, delay: (m.el.col * 0.9 + m.el.row * 1.3) / 28,
      hover: 0, scale: 1, offset: 0,
    }));

    inst.setAttribute('aUvOffset', new THREE.InstancedBufferAttribute(aOffset, 2));
    inst.setAttribute('aUvScale', new THREE.InstancedBufferAttribute(aScale, 2));
    inst.setAttribute('aGlow', new THREE.InstancedBufferAttribute(aGlow, 1));
    inst.setAttribute('aReveal', new THREE.InstancedBufferAttribute(aReveal, 1));
    inst.setAttribute('aTint', new THREE.InstancedBufferAttribute(aTint, 3));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      uniforms: {
        uAtlas: { value: this.atlas },
        uTime: { value: 0 },
        uHover: { value: -1 },
      },
      vertexShader: /* glsl */`
        attribute vec2 aUvOffset;
        attribute vec2 aUvScale;
        attribute vec3 aTint;
        attribute float aGlow;
        attribute float aReveal;
        uniform float uTime;
        varying vec2 vUv;
        varying float vGlow;
        varying float vReveal;
        varying vec3 vTint;
        varying vec3 vNormalV;
        varying vec3 vView;
        void main(){
          vUv = uv * aUvScale + aUvOffset;
          vGlow = aGlow;
          vReveal = aReveal;
          vTint = aTint;
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vNormalV = normalize(mat3(modelViewMatrix) * mat3(instanceMatrix) * normal);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D uAtlas;
        uniform float uTime;
        varying vec2 vUv;
        varying float vGlow;
        varying float vReveal;
        varying vec3 vTint;
        varying vec3 vNormalV;
        varying vec3 vView;
        void main(){
          vec4 c = texture2D(uAtlas, vUv);
          if (c.a < 0.02) discard;
          vec3 col = c.rgb;
          // holographic sheen
          float fres = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vView))), 2.0);
          col += vTint * fres * 0.12;
          col += vTint * vGlow * 0.55;
          col *= 1.0 + vGlow * 0.5;
          float scan = 0.94 + 0.06 * sin(gl_FragCoord.y * 0.9 + uTime * 2.0);
          col *= scan;
          gl_FragColor = vec4(col, c.a * clamp(vReveal, 0.0, 1.0));
        }
      `,
    });

    this.mesh = new THREE.InstancedMesh(inst, mat, ELEMENTS.length);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.group.add(this.mesh);
    this.mat = mat;

    // dynamic instanced attribute arrays
    this.aGlow = inst.getAttribute('aGlow');
    this.aReveal = inst.getAttribute('aReveal');

    const m = new THREE.Matrix4();
    meta.forEach((md, i) => {
      m.compose(md.pos, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), md.rot), new THREE.Vector3(1, 1, 1));
      this.mesh.setMatrixAt(i, m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;

    this.quad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.88, 1.1),
      new THREE.MeshBasicMaterial({ color: 0x9ff6ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    this.quad.visible = false;
    this.group.add(this.quad);
  }

  buildAxisLabels() {
    const W = 1024, H = 256;
    const { c, x } = canvas2d(W, H);
    x.clearRect(0, 0, W, H);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = '#7190a3';
    const periodLabels = [];
    for (let i = 1; i <= 7; i++) {
      const cx = 40 + (i - 1) * 64;
      x.fillStyle = i === 1 || i === 2 ? '#557484' : '#6d8ea2';
      x.font = '500 52px "SFMono-Regular",Menlo,monospace';
      x.fillText(String(i), cx, 48);
      periodLabels.push({ text: i, u0: (cx - 30) / W, v0: 1 - 82 / H, u1: (cx + 30) / W, v1: 1 - 14 / H });
    }
    const fLabels = [];
    const drawF = (txt, color, idx) => {
      const y = 150 + idx * 54;
      x.fillStyle = color;
      x.font = '500 38px "PingFang SC","Hiragino Sans GB",sans-serif';
      x.textAlign = 'right';
      x.fillText(txt, 348, y);
      fLabels.push({ u0: 0, v0: 1 - (y + 27) / H, u1: 360 / W, v1: 1 - (y - 27) / H, idx });
    };
    drawF('镧系 57–71', '#ff7fd9', 0);
    drawF('锕系 89–103', '#b78bff', 1);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: true,
    });

    const positions = [];
    const uvs = [];
    const indices = [];
    const R = 16;
    const addLabel = (col, y, w, h, uv) => {
      const theta = (col - 8.5) * DTHETA;
      const cx = Math.sin(theta) * R;
      const cz = -Math.cos(theta) * R;
      const rx = Math.cos(theta), rz = Math.sin(theta);
      const halfW = w / 2, halfH = h / 2;
      const corners = [
        [cx - rx * halfW, y + halfH, cz - rz * halfW, uv.u0, uv.v1],
        [cx + rx * halfW, y + halfH, cz + rz * halfW, uv.u1, uv.v1],
        [cx + rx * halfW, y - halfH, cz + rz * halfW, uv.u1, uv.v0],
        [cx - rx * halfW, y - halfH, cz - rz * halfW, uv.u0, uv.v0],
      ];
      const base = positions.length / 3;
      corners.forEach(([px, py, pz, u, v]) => {
        positions.push(px, py, pz);
        uvs.push(u, v);
      });
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };

    const rowY = (row) => (3 - row) * ROW_PITCH + 1.7;
    periodLabels.forEach((lab, i) => {
      addLabel(-1.04, rowY(i), 0.64, 0.64, lab);
    });
    fLabels.forEach((lab, i) => {
      const row = 7 + i;
      const y = (3 - 6) * ROW_PITCH - 0.6 - (row - 6) * ROW_PITCH + 1.7;
      addLabel(0.6, y, 1.5, 0.42, lab);
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 1;
    this.group.add(mesh);
    this.axisLabels = mesh;
  }

  buildDecor() {
    const ringTex = starRingTexture();
    this.decor = new THREE.Group();
    this.group.add(this.decor);

    const mkRing = (radius, color, opacity, rx, rz, y) => {
      const geo = new THREE.TorusGeometry(radius, 0.016, 6, 220);
      const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(rx, 0, rz);
      ring.position.set(0, y, -24.5);
      this.decor.add(ring);
      return ring;
    };
    this.ring1 = mkRing(9.5, 0x5ce7ff, 0.22, Math.PI * 0.47, 0.18, -0.4);
    this.ring2 = mkRing(11.2, 0xff4fd8, 0.14, Math.PI * 0.53, -0.35, 0.7);
    this.ring3 = mkRing(7.4, 0x8f7cff, 0.13, Math.PI * 0.42, 0.6, -1.6);

    // floating dust
    const n = 420;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = 6 + Math.random() * 9;
      pos[i * 3] = Math.cos(a) * rr;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = Math.sin(a) * rr * 0.45 - 2;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const dustMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: /* glsl */`
        attribute float aSeed;
        uniform float uTime;
        varying float vA;
        void main(){
          vec3 p = position;
          p.y += sin(uTime * 0.25 + aSeed * 6.28) * 0.35;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.2 + aSeed * 2.0) * (40.0 / -mv.z);
          vA = 0.25 + aSeed * 0.7;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity;
        varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vA * uOpacity;
          gl_FragColor = vec4(vec3(0.55, 0.85, 1.0) * a, a);
        }
      `,
    });
    this.dust = new THREE.Points(g, dustMat);
    this.dust.frustumCulled = false;
    this.decor.add(this.dust);

    // holographic halo behind cards
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(21, 15),
      new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, color: 0x2e6d8a }),
    );
    halo.position.set(0, 0.5, -23.0);
    this.decor.add(halo);
    this.halo = halo;
  }

  show(on) {
    this.enabled = on;
    this.group.visible = true;
    this.revealTarget = on ? 1 : 0;
  }

  pick(raycaster, camera) {
    if (!this.mesh.visible) return null;
    const hits = raycaster.intersectObject(this.mesh, false);
    if (!hits.length) return null;
    const id = hits[0].instanceId;
    if (id == null) return null;
    return { index: id, element: this.meta[id].el };
  }

  setHover(index) {
    if (index === this.hovered) return;
    this.hovered = index;
    this.applyGlow();
  }

  setSelected(index) {
    this.selectedCard = index;
    this.applyGlow();
  }

  applyGlow() {
    const arr = this.aGlow.array;
    arr.fill(0);
    if (this.selectedCard >= 0) arr[this.selectedCard] = 0.5;
    if (this.hovered >= 0) arr[this.hovered] = 1;
    this.aGlow.needsUpdate = true;
    this._dirty = true;
  }

  update(dt, t, camera) {
    if (!this.group.visible) return;
    this.time = t;
    this.mat.uniforms.uTime.value = t;
    const diff = this.revealTarget - this.reveal;
    if (Math.abs(diff) > 0.001) {
      this.reveal += Math.sign(diff) * Math.min(Math.abs(diff), dt * (this.revealTarget > 0 ? 1.35 : 2.6));
    } else {
      this.reveal = this.revealTarget;
    }

    // opacity / per-instance reveal
    if (this.reveal > 0.0001 || this._wasRevealing) {
      const arr = this.aReveal.array;
      let all = true;
      for (let i = 0; i < this.meta.length; i++) {
        const d = this.instanceData[i];
        const raw = (this.reveal - d.delay * 0.45) / 0.55;
        const p = Math.max(0, Math.min(1, raw));
        const ease = 1 - Math.pow(1 - p, 3);
        d.p = ease;
        arr[i] = ease;
        if (ease > 0.001) all = false;
        // hover spring
        const target = this.hovered === i ? 1 : 0;
        d.hover += (target - d.hover) * Math.min(1, dt * 12);
        if (d.p < 0.999 || d.hover > 0.002 || d.hoverPrev > 0.002) {
          this.updateMatrix(i);
          d.hoverPrev = d.hover;
        }
      }
      this.aReveal.needsUpdate = true;
      this.mesh.instanceMatrix.needsUpdate = true;
      this._wasRevealing = this.revealTarget > 0 && this.reveal < 0.999;
      if (this.reveal <= 0.001) {
        this.group.visible = false;
        this.mesh.visible = false;
        this.decor.visible = false;
      }
    }

    if (!this.mesh.visible && this.reveal > 0.01) {
      this.mesh.visible = true;
      this.decor.visible = true;
    }

    // rings + dust
    this.ring1.material.opacity = 0.22 * this.reveal;
    this.ring2.material.opacity = 0.14 * this.reveal;
    this.ring3.material.opacity = 0.13 * this.reveal;
    this.ring1.rotation.z += dt * 0.02;
    this.ring2.rotation.z -= dt * 0.014;
    this.ring3.rotation.z += dt * 0.009;
    this.dust.material.uniforms.uTime.value = t;
    this.dust.material.uniforms.uOpacity.value = this.reveal;
    this.halo.material.opacity = 0.3 * this.reveal;

    // billboard hover plate
    if (this.hovered >= 0 && this.reveal > 0.5) {
      const md = this.meta[this.hovered];
      this.quad.position.copy(md.pos);
      this.quad.rotation.set(0, md.rot, 0);
      this.quad.translateZ(0.02);
      this.quad.visible = true;
      this.quad.material.opacity = 0.12 + 0.06 * Math.sin(t * 4);
      this.quad.scale.setScalar(1.04);
    } else {
      this.quad.visible = false;
    }
  }

  updateMatrix(i) {
    const md = this.meta[i];
    const d = this.instanceData[i];
    const m = new THREE.Matrix4();
    const pos = md.pos.clone();
    const p = d.p;
    pos.y += (1 - p) * -1.4;
    const s = (0.9 + 0.1 * p) * (1 + d.hover * 0.07);
    m.compose(
      pos,
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), md.rot + (1 - p) * 0.12),
      new THREE.Vector3(s, s, s),
    );
    this.mesh.setMatrixAt(i, m);
  }
}