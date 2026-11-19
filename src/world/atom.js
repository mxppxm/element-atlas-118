import * as THREE from 'three';
import { electronConfig, glowColorOf } from '../data/elements.js';
import { labelTexture, canvas2d } from '../core/textures.js';

/* ------------------------------------------------------------------
   Molecular inspection bench + procedural Bohr model.
------------------------------------------------------------------- */

const RING_GEO_CACHE = new Map();

function ringGeo(radius) {
  if (!RING_GEO_CACHE.has(radius)) {
    const g = new THREE.TorusGeometry(radius, 0.0038, 5, 160);
    g.userData.sharedGeo = true;
    RING_GEO_CACHE.set(radius, g);
  }
  return RING_GEO_CACHE.get(radius);
}

function atomLabelTexture(el, color) {
  const { c, x } = canvas2d(512, 128);
  x.clearRect(0, 0, 512, 128);
  x.strokeStyle = color;
  x.globalAlpha = 0.5;
  x.lineWidth = 2;
  x.strokeRect(8, 8, 496, 112);
  x.globalAlpha = 1;
  x.fillStyle = color;
  x.font = '600 20px "SFMono-Regular",Menlo,monospace';
  x.fillText(`Z ${String(el.z).padStart(3, '0')} / ${el.sym}`, 26, 42);
  x.fillStyle = '#dff4ff';
  x.font = '500 32px "PingFang SC",sans-serif';
  x.fillText(`${el.zh} · ${el.en.toUpperCase()}`, 26, 86);
  x.fillStyle = 'rgba(150,190,210,.65)';
  x.font = '400 14px "SFMono-Regular",Menlo,monospace';
  x.fillText(`A ${el.mass}   SPECIMEN ANALYSIS`, 26, 110);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class AtomBench {
  constructor(shared) {
    this.group = new THREE.Group();
    this.group.position.set(0.55, 0, 3.95);
    this.group.visible = false;
    this.atom = new THREE.Group();
    this.atom.position.y = 2.55;
    this.group.add(this.atom);
    this.element = null;
    this.shells = [];
    this.rise = 0;
    this.targetY = -1.35;
    this.group.position.y = -1.35;
    this.time = 0;
    this.spin = 0;
    this.detail = true;
    this.paused = false;
    this.orbitT = 0;
    this.electronMats = [];
    this.shellRings = [];
    this.shellLabels = [];
    this.color = new THREE.Color(0xff7a3c);

    const metal = shared.metal;
    const dark = shared.darkMetal;
    const ceramic = shared.ceramic;

    // -------- pedestal --------
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.03, 0.12, 64), dark);
    base.position.y = 0.06;
    base.castShadow = true; base.receiveShadow = true;
    this.group.add(base);
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.012, 6, 96), metal);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.125;
    this.group.add(baseRing);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.85, 48, 1), new THREE.MeshPhysicalMaterial({
      color: 0x0b1014, metalness: .9, roughness: .24, envMapIntensity: 1.4, clearcoat: .4,
    }));
    col.position.y = 0.52;
    this.group.add(col);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.78, 0.06), dark);
      slat.position.set(Math.cos(a) * 0.56, 0.53, Math.sin(a) * 0.56);
      slat.rotation.y = -a;
      this.group.add(slat);
    }
    const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.08, 48), metal);
    emitter.position.y = 0.985;
    this.group.add(emitter);
    this.emitterRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.009, 6, 96), new THREE.MeshBasicMaterial({
      color: 0xff8a3c, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false,
    }));
    this.emitterRing.rotation.x = Math.PI / 2;
    this.emitterRing.position.y = 1.03;
    this.group.add(this.emitterRing);

    // pedestal label
    this.labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.195),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: .95, toneMapped: true }),
    );
    this.labelMesh.position.set(0, 0.52, 0.63);
    this.labelMesh.rotation.x = -0.05;
    this.group.add(this.labelMesh);

    // beam
    const beamMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: this.color }, uTime: { value: 0 }, uOpacity: { value: 0.4 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uTime, uOpacity; varying vec2 vUv;
        void main(){
          float a = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
          float lines = 0.6 + 0.4 * sin(vUv.x * 80.0 + uTime * 3.0);
          a *= (0.18 + 0.4 * lines) * uOpacity;
          gl_FragColor = vec4(uColor * a, a);
        }`,
    });
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.6, 1.5, 32, 1, true), beamMat);
    this.beam.position.y = 1.78;
    this.group.add(this.beam);

    // gantry rings
    const gantryMat = new THREE.MeshBasicMaterial({
      color: 0x9fefff, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.gantry = new THREE.Group();
    this.gantry.position.y = 2.55;
    this.group.add(this.gantry);
    // (gantry removed — the Bohr shells are the focus)
    this.gantryMat = gantryMat;


    // front scan arcs
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x7fe8ff, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.scanDisc = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.09, 96, 1, 0, Math.PI * 2), scanMat);
    this.scanDisc.rotation.x = -Math.PI / 2;
    this.scanDisc.position.y = 2.55 - 0.9;
    this.group.add(this.scanDisc);

  }

  setElement(el) {
    this.element = el;
    const color = glowColorOf(el);
    this.color.setRGB(color[0], color[1], color[2]);
    this.beam.material.uniforms.uColor.value.copy(this.color);
    this.emitterRing.material.color.copy(this.color);
    this.gantryMat.color.copy(this.color).lerp(new THREE.Color(0xffffff), 0.18);
    this.gantryMat.opacity = 0.13;
        this.scanDisc.material.color.copy(this.color);

    this.labelMesh.material.map = atomLabelTexture(el, `#${this.color.getHexString()}`);
    this.labelMesh.material.needsUpdate = true;

    // clear old atom
    const old = this.atom.children.slice();
    this.atom.clear();
    old.forEach(c => c.traverse?.(o => {
      if (o.geometry && !o.userData.sharedGeo) o.geometry.dispose();
      if (o.material && o.material.map && o.material.map !== this._ptex) o.material.map.dispose?.();
    }));
    this.shells = [];
    this.spin = 0;

    const { shells } = electronConfig(el.z);
    const glow = this.color;

    // nucleus
    const nucGroup = new THREE.Group();
    this.atom.add(nucGroup);
    // Nucleus schematic: exact Z protons + N neutrons, arranged in concentric
    // close-packed layers (Fibonacci distribution). Counts are real; the spatial
    // packing is illustrative, not a quantum shell structure.
    const massNum = Math.max(1, Math.round(parseFloat(el.mass) || el.z));
    const neutronCount = Math.max(0, massNum - el.z);
    const pMat = new THREE.MeshStandardMaterial({
      color: glow.clone().multiplyScalar(0.4), emissive: glow, emissiveIntensity: 1.15, roughness: .35, metalness: .1,
    });
    const nMat = new THREE.MeshStandardMaterial({
      color: 0x2f3d4a, emissive: 0x55748a, emissiveIntensity: .55, roughness: .4, metalness: .2,
    });
    const nucGeo = new THREE.SphereGeometry(0.032, 10, 8);
    const nucR = 0.075 + Math.cbrt(massNum) * 0.028;
    const layerCount = massNum <= 4 ? 1 : massNum <= 16 ? 2 : massNum <= 45 ? 3 : 4;
    const layerRadii = layerCount === 1 ? [1]
      : layerCount === 2 ? [0.58, 1]
      : layerCount === 3 ? [0.42, 0.72, 1]
      : [0.3, 0.55, 0.78, 1];

    const layerCounts = [];
    let acc = 0;
    layerRadii.forEach((r, i) => {
      const prev = i === 0 ? 0 : layerRadii[i - 1];
      if (i === layerRadii.length - 1) layerCounts.push(massNum - acc);
      else {
        const n = Math.max(1, Math.round(massNum * (r ** 3 - prev ** 3)));
        layerCounts.push(n);
        acc += n;
      }
    });

    const positions = [];
    layerCounts.forEach((n, li) => {
      const radius = nucR * layerRadii[li];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / Math.max(1, n - 1)) * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        const th = golden * i + li * 0.8;
        positions.push(new THREE.Vector3(Math.cos(th) * rr * radius, y * radius, Math.sin(th) * rr * radius));
      }
    });

    const protons = new THREE.InstancedMesh(nucGeo, pMat, el.z);
    const neutrons = neutronCount > 0 ? new THREE.InstancedMesh(nucGeo, nMat, neutronCount) : null;
    const m = new THREE.Matrix4();
    const sc = new THREE.Vector3();
    let pi = 0, ni = 0;
    positions.forEach((pos, i) => {
      // interleave species so protons/neutrons are spread through every layer
      const isP = Math.floor(((i + 1) * el.z) / massNum) > Math.floor((i * el.z) / massNum);
      const scale = 0.9 + ((i * 37) % 17) / 17 * 0.18;
      m.compose(pos, new THREE.Quaternion(), sc.setScalar(scale));
      if (isP) protons.setMatrixAt(pi++, m);
      else if (neutrons) neutrons.setMatrixAt(ni++, m);
    });
    protons.instanceMatrix.needsUpdate = true;
    if (neutrons) neutrons.instanceMatrix.needsUpdate = true;
    nucGroup.add(protons);
    if (neutrons) nucGroup.add(neutrons);
    this.nucleus = nucGroup;

    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      color: glow, map: this._pointTex(), transparent: true, opacity: .55,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    glowSprite.scale.set(0.46, 0.46, 1);
    glowSprite.material.opacity = 0.16;
    nucGroup.add(glowSprite);
    this.nucleusGlow = glowSprite;
    this.protonMat = pMat;
    this.neutronMat = nMat;
    this.electronMats = [];
    this.shellRings = [];

    // shells
    let maxR = 0.34;
    shells.forEach((count, i) => {
      const radius = 0.53 + i * 0.185;
      maxR = radius;
      const tiltAxis = new THREE.Vector3(Math.cos(i * 1.7 + 0.4), 0.2 + (i % 3) * 0.35, Math.sin(i * 1.3 + 0.8)).normalize();
      const quat = new THREE.Quaternion().setFromAxisAngle(tiltAxis, 0.5 + i * 0.28);
      const ring = new THREE.Mesh(ringGeo(radius), new THREE.MeshBasicMaterial({
        color: glow.clone().lerp(new THREE.Color(0xffffff), 0.1),
        transparent: true, opacity: 0.28 - i * 0.02, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      ring.quaternion.copy(quat);
      this.atom.add(ring);
      this.shellRings.push(ring);

      const eGeo = new THREE.SphereGeometry(0.026, 8, 6);
      const eMat = new THREE.MeshBasicMaterial({ color: glow.clone().lerp(new THREE.Color(0xffffff), 0.06), toneMapped: false });
      const eMesh = new THREE.InstancedMesh(eGeo, eMat, count);
      eMesh.frustumCulled = false;
      this.atom.add(eMesh);
      this.electronMats.push(eMat);

      const u = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
      const v = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
      this.shells.push({ count, radius, quat, eMesh, u, v, speed: 0.5 - i * 0.035, phase: i * 1.1 });
    });

    // electron halo points
    const total = shells.reduce((a, b) => a + b, 0);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    const hm = new THREE.PointsMaterial({
      color: glow.clone().lerp(new THREE.Color(0xffffff), 0.2),
      size: 0.09, transparent: true, opacity: .55, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, map: this._pointTex(),
    });
    this.halo = new THREE.Points(hg, hm);
    this.halo.frustumCulled = false;
    this.atom.add(this.halo);

    this.maxRadius = maxR;
    this._animateIn = 0;

    // structural labels: shell population + nucleus count
    const names = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    this.shellLabels = [];
    const labelColor = '#' + this.color.getHexString();
    this.shells.forEach((sh, i) => {
      const tex = this._labelTexture(`${names[i] || i + 1} · ${sh.count}e`, labelColor);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0.95 }));
      sprite.position.copy(sh.u.clone().multiplyScalar(sh.radius));
      sprite.position.y += 0.07;
      sprite.scale.set(0.4, 0.13, 1);
      sprite.renderOrder = 20;
      this.atom.add(sprite);
      this.shellLabels.push(sprite);
    });
    const nTex = this._labelTexture(`${el.z}p · ${Math.max(0, Math.round(parseFloat(el.mass) || el.z) - el.z)}n`, labelColor);
    this.nucLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: nTex, transparent: true, depthTest: false, depthWrite: false, opacity: 0.95 }));
    this.nucLabel.position.set(0, 0.32, 0);
    this.nucLabel.scale.set(0.56, 0.18, 1);
    this.nucLabel.renderOrder = 21;
    this.atom.add(this.nucLabel);

    this.applyDetail();
  }

  setDetail(on) {
    this.detail = !!on;
    this.applyDetail();
  }

  setPaused(on) {
    this.paused = !!on;
  }

  _labelTexture(text, color) {
    const { c, x } = canvas2d(256, 84);
    x.clearRect(0, 0, 256, 84);
    x.fillStyle = 'rgba(4,9,13,.68)';
    x.strokeStyle = color + '66';
    x.lineWidth = 1;
    x.beginPath();
    if (x.roundRect) x.roundRect(4, 18, 248, 48, 7); else x.rect(4, 18, 248, 48);
    x.fill(); x.stroke();
    x.fillStyle = color;
    x.font = '500 24px "SFMono-Regular",Menlo,monospace';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, 128, 42);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  applyDetail() {
    const on = this.detail;
    if (this.nucleusGlow) this.nucleusGlow.visible = !on;
    if (this.protonMat) {
      this.protonMat.emissiveIntensity = on ? 0.35 : 1.15;
      this.protonMat.color.setHex(on ? 0xff8a5c : 0xffffff).copy(on ? new THREE.Color(0xff8a5c) : this.color.clone().multiplyScalar(0.4));
      this.protonMat.emissive.set(on ? 0xff5c2e : this.color);
    }
    if (this.neutronMat) {
      this.neutronMat.emissiveIntensity = on ? 0.06 : 0.55;
      this.neutronMat.color.setHex(on ? 0x6f8ca3 : 0x2f3d4a);
      this.neutronMat.emissive.setHex(on ? 0x3a5568 : 0x55748a);
    }
    if (this.nucleus) this.nucleus.scale.setScalar(on ? 1.55 : 1);
    this.electronMats.forEach(m => {
      m.color.copy(this.color).lerp(new THREE.Color(0xffffff), on ? 0.02 : 0.18);
      m.toneMapped = !on;
      m.needsUpdate = true;
    });
    this.shellRings.forEach(r => {
      r.material.opacity = on ? 0.62 : 0.28;
      r.material.blending = on ? THREE.NormalBlending : THREE.AdditiveBlending;
      r.material.needsUpdate = true;
    });
    this.shellLabels.forEach(s => { s.visible = on; });
    if (this.nucLabel) this.nucLabel.visible = on;
    if (this.halo) {
      this.halo.visible = !on;
      this.halo.material.opacity = on ? 0 : 0.55;
    }
    if (this.beam) this.beam.visible = !on;
    if (this.emitterRing) this.emitterRing.material.opacity = on ? 0.18 : 0.8;
    if (this.scanDisc) this.scanDisc.visible = true;
  }

  _pointTex() {
    if (AtomBench._tex) return AtomBench._tex;
    const { c, x } = canvas2d(64, 64);
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(.3, 'rgba(255,255,255,.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    AtomBench._tex = t;
    this._ptex = t;
    return t;
  }

  show(on) {
    this.targetY = on ? 0 : -1.35;
    if (on) this.group.visible = true;
    this._hideAtZero = !on;
    if (on) this._animateIn = 0;
  }

  update(dt, t) {
    this.time = t;
    if (!this.paused) this.orbitT += dt;
    const ot = this.orbitT;
    const target = this.targetY;
    this.group.position.y += (target - this.group.position.y) * Math.min(1, dt * 5.5);
    if (this._hideAtZero && Math.abs(this.group.position.y - target) < 0.01) {
      this.group.visible = false;
    }
    if (!this.group.visible) return;

    this._animateIn = Math.min(1, (this._animateIn || 0) + dt * 2.2);
    const pop = 1 - Math.pow(1 - this._animateIn, 3);
    this.atom.scale.setScalar(0.6 + 0.4 * pop);
    this.atom.visible = !!this.element;
    this.beam.material.uniforms.uTime.value = t;
    this.beam.material.uniforms.uOpacity.value = (this.detail ? 0.015 : 0.22) * pop;
    this.scanDisc.rotation.z += dt * 0.6;
    this.gantry.rotation.y += dt * 0.22;
    this.gantry.rotation.z = Math.sin(t * 0.3) * 0.08;
    this.emitterRing.material.opacity = (this.detail ? 0.16 : 0.65) + (this.detail ? 0.04 : 0.3) * Math.sin(t * 2.4);

    if (this.nucleus) {
      this.nucleus.rotation.y = ot * 0.5;
      this.nucleus.rotation.x = Math.sin(ot * 0.4) * 0.2;
      this.nucleus.scale.setScalar((this.detail ? 1.55 : 1) * (1 + 0.04 * Math.sin(ot * 3)));
    }

    if (!this.shells.length) return;
    const m = new THREE.Matrix4();
    let idx = 0;
    const haloPos = this.halo.geometry.attributes.position.array;
    for (const sh of this.shells) {
      for (let i = 0; i < sh.count; i++) {
        const ang = ot * sh.speed + sh.phase + (i / sh.count) * Math.PI * 2;
        const x = Math.cos(ang) * sh.radius;
        const y = Math.sin(ang) * sh.radius;
        m.makeTranslation(sh.u.x * x + sh.v.x * y, sh.u.y * x + sh.v.y * y, sh.u.z * x + sh.v.z * y);
        sh.eMesh.setMatrixAt(i, m);
        haloPos[idx * 3] = sh.u.x * x + sh.v.x * y;
        haloPos[idx * 3 + 1] = sh.u.y * x + sh.v.y * y;
        haloPos[idx * 3 + 2] = sh.u.z * x + sh.v.z * y;
        idx++;
      }
      sh.eMesh.instanceMatrix.needsUpdate = true;
    }
    this.halo.geometry.attributes.position.needsUpdate = true;

    // gentle auto rotation
    this.atom.rotation.y = ot * 0.16;
    this.atom.rotation.z = Math.sin(ot * 0.22) * 0.06;
  }
}