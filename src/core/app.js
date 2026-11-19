import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { environmentTexture } from './textures.js';
import { PeriodicWall } from '../world/periodic.js';
import { AtomBench } from '../world/atom.js';
import { UI } from '../ui/ui.js';
import { byZ, spectrumOf, glowColorOf } from '../data/elements.js';

/* ------------------------------------------------------------------
   Element Atlas 118 — periodic table + element analysis.
   No lab, no glass chambers, no audio. Pure procedural 3D atlas.
------------------------------------------------------------------- */

const POSES = {
  periodic: { pos: [0, 10.55, 17.1], target: [0, 11.85, -2.2], fov: 40 },
  atom: { pos: [0.55, 3.42, 9.9], target: [0.55, 1.98, 3.95], fov: 42 },
  periodicMobile: { pos: [0, 15.2, 34.0], target: [0, 11.7, -2.2], fov: 56 },
  atomMobile: { pos: [0.55, 4.0, 11.2], target: [0.55, 1.45, 3.95], fov: 46 },
};

const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function sharedMaterials() {
  return {
    metal: new THREE.MeshStandardMaterial({ color: 0x8f99a3, metalness: 1, roughness: 0.27, envMapIntensity: 1.35 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x171c21, metalness: 0.92, roughness: 0.42, envMapIntensity: 0.9 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc9a05e, metalness: 1, roughness: 0.24, envMapIntensity: 1.5 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0x272c32, metalness: 0.15, roughness: 0.36, envMapIntensity: 0.9 }),
  };
}

export class NeonLab {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.mode = 'periodic';
    this.selected = byZ[10];
    this.atomDetail = 'glow';
    this.paused = false;
    this.tween = null;
    this.hovered = -1;
    this.pointer = new THREE.Vector2(-10, -10);
    this.pointerDirty = false;
    this.pointerScreen = null;
    this.pointerDown = null;
    this.raycaster = new THREE.Raycaster();

    this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 160);
    this.camera.position.set(...POSES.periodic.pos);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(...POSES.periodic.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.052;
    this.controls.rotateSpeed = 0.58;
    this.controls.zoomSpeed = 0.8;
    this.controls.enablePan = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 46;
    this.controls.minPolarAngle = 0.28;
    this.controls.maxPolarAngle = 1.66;
    this.controls.addEventListener('start', () => { this.tween = null; });
    this.controls.update();
    window.__neon = this;
  }

  async init() {
    this.ui = new UI(this);
    this.ui.boot(0.08, '初始化元素图集…');
    await frame();
    this.buildEnvironment();
    this.ui.boot(0.28, '烘焙环境光与星场…');
    await frame();
    this.wall = new PeriodicWall();
    this.scene.add(this.wall.group);
    this.ui.boot(0.62, '绘制 118 张元素卡片…');
    await frame();
    this.shared = sharedMaterials();
    this.bench = new AtomBench(this.shared);
    this.scene.add(this.bench.group);
    this.benchLight = new THREE.PointLight(0xff7a3c, 0, 7, 2);
    this.benchLight.position.set(0, 2.6, 0.2);
    this.bench.group.add(this.benchLight);
    this.buildStage();
    this.buildPost();
    this.bindEvents();
    this.ui.boot(0.9, '编译 GLSL 着色器…');
    await frame();

    this.selected = byZ[10];
    this.wall.setSelected(this.selected.z - 1);
    this.ui.setMode('periodic');
    this.ui.setLegend();
    this.ui.setSpectrumPanelVisible(false);
    this.applyPose(this.poseFor('periodic'));
    this.wall.show(true);
    this.wall.group.visible = true;

    this.renderer.compile(this.scene, this.camera);
    this.composer.render(0);
    this.ui.boot(1, 'READY');
    this.clock.start();
    this.renderer.setAnimationLoop(() => this.loop());
    setTimeout(() => {
      const b = document.getElementById('boot');
      if (b) b.classList.add('done');
    }, 700);
    setTimeout(() => this.ui.toast('选择任意元素 · 打开元素剖析'), 1900);
  }

  buildEnvironment() {
    const envTex = environmentTexture();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromEquirectangular(envTex);
    this.scene.environment = env.texture;
    this.scene.environmentIntensity = 0.9;
    envTex.dispose();
    pmrem.dispose();

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(90, 32, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vPos;
          void main(){
            vec3 d = normalize(vPos);
            float h = d.y;
            vec3 top = vec3(0.0035, 0.006, 0.011);
            vec3 hor = vec3(0.016, 0.031, 0.045);
            vec3 bot = vec3(0.004, 0.005, 0.007);
            vec3 col = mix(hor, top, smoothstep(0.0, 0.72, h));
            col = mix(bot, col, smoothstep(-0.55, 0.02, h));
            col += vec3(0.02, 0.035, 0.05) * exp(-abs(h - 0.02) * 12.0) * 0.7;
            float n = smoothstep(0.55, 0.95, d.x * 0.5 + 0.5 + sin(d.z * 4.0) * 0.08);
            col += vec3(0.03, 0.008, 0.04) * n * 0.25;
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    );
    sky.renderOrder = -20;
    this.scene.add(sky);

    this.hemi = new THREE.HemisphereLight(0x2c5878, 0x030507, 0.5);
    this.scene.add(this.hemi);
    this.key = new THREE.DirectionalLight(0xcfe4ff, 2.2);
    this.key.position.set(5, 9, 8);
    this.scene.add(this.key);
    this.fill = new THREE.DirectionalLight(0x5f7bff, 0.55);
    this.fill.position.set(-8, 4, -6);
    this.scene.add(this.fill);
    this.rim = new THREE.PointLight(0x5ce7ff, 8, 18, 2);
    this.rim.position.set(-5, 3.5, 4);
    this.scene.add(this.rim);
    this.warm = new THREE.PointLight(0xff8a3c, 4, 14, 2);
    this.warm.position.set(5, 2.5, 6);
    this.scene.add(this.warm);
    this.atomLight = new THREE.PointLight(0xffffff, 0, 12, 2);
    this.atomLight.position.set(3.2, 4.4, 7.2);
    this.scene.add(this.atomLight);

    this.stars = this.buildStars();
    this.scene.add(this.stars);
  }

  buildStars() {
    const n = 1500;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const tint = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 55 + Math.random() * 25;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.75 + 1;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      size[i] = 0.15 + Math.random() * 0.5;
      const c = new THREE.Color().setHSL(0.52 + Math.random() * 0.12, 0.35, 0.55 + Math.random() * 0.3);
      tint[i * 3] = c.r; tint[i * 3 + 1] = c.g; tint[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uOpacity: { value: 0.55 } },
      vertexShader: `attribute float aSize; attribute vec3 aTint;
        varying vec3 vTint; varying float vA;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = aSize * 90.0 / -mv.z;
          vTint = aTint; vA = 0.4 + aSize * 0.7;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform float uOpacity; varying vec3 vTint; varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = pow(smoothstep(0.5, 0.0, d), 2.6) * vA * uOpacity;
          gl_FragColor = vec4(vTint * a, a);
        }`,
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return p;
  }

  buildStage() {
    this.stage = new THREE.Group();
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.5, 0.16, 64),
      new THREE.MeshStandardMaterial({ color: 0x0a0f14, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2 }),
    );
    platform.position.set(0.55, -0.1, 3.95);
    this.stage.add(platform);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.22, 0.009, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0x5ce7ff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.55, 0.0, 3.95);
    this.stage.add(ring);
    this.stageRing = ring;
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.005, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0xb18bff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    inner.rotation.x = Math.PI / 2;
    inner.position.set(0.55, 0.002, 3.95);
    this.stage.add(inner);
    this.stage.visible = false;
    this.scene.add(this.stage);
  }

  buildPost() {
    const w = innerWidth, h = innerHeight;
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.composer.setSize(w, h);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.55, 0.74);
    this.composer.addPass(this.bloom);
    this.grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(w, h) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
        void main(){
          vec2 d = vUv - 0.5; float r2 = dot(d,d);
          vec2 off = d * r2 * 0.0026;
          vec3 c;
          c.r = texture2D(tDiffuse, vUv + off).r;
          c.g = texture2D(tDiffuse, vUv).g;
          c.b = texture2D(tDiffuse, vUv - off).b;
          float vig = smoothstep(0.95, 0.18, r2 * 1.85);
          c *= mix(0.63, 1.0, vig);
          float g = fract(sin(dot(vUv * uRes + fract(uTime) * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
          c += (g - 0.5) * 0.013;
          gl_FragColor = vec4(max(c, 0.0), 1.0);
        }`,
    });
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
  }

  bindEvents() {
    addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      this.pointerScreen = { x: e.clientX, y: e.clientY };
      this.pointerDirty = true;
    });
    this.canvas.addEventListener('pointerleave', () => {
      this.pointer.set(-10, -10);
      this.pointerScreen = null;
      this.pointerDirty = true;
    });
    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    this.canvas.addEventListener('pointerup', (e) => {
      if (!this.pointerDown) return;
      const dx = e.clientX - this.pointerDown.x, dy = e.clientY - this.pointerDown.y;
      const dt = performance.now() - this.pointerDown.t;
      this.pointerDown = null;
      if (Math.hypot(dx, dy) < 7 && dt < 600) this.handleClick();
    });
    this.canvas.addEventListener('dblclick', () => this.resetView());
    addEventListener('keydown', (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === '1') this.setMode('periodic');
      if (e.key === '2') this.setMode('atom');
      if (e.key === 'Escape') this.backToPeriodic();
      if (this.mode === 'atom' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        this.stepElement(e.key === 'ArrowRight' ? 1 : -1);
      }
    });
  }

  onResize() {
    const w = innerWidth, h = innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setSize(w, h);
    this.composer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
    this.grade.uniforms.uRes.value.set(w, h);
  }

  /* ------------------------------ modes ------------------------------ */
  setMode(mode) {
    if (this.mode === mode && mode !== 'atom') return;
    this.mode = mode;
    this.ui.setMode(mode);
    if (mode === 'periodic') {
      this.ui.hideInspector();
      this.bench.show(false);
      this.benchLight.intensity = 0;
      this.atomLight.intensity = 0;
      this.stage.visible = false;
      this.wall.show(true);
      this.bloom.strength = 0.5;
      this.bloom.threshold = 0.74;
      this.flyTo(this.poseFor('periodic'));
      this.selected && this.wall.setSelected(this.selected.z - 1);
    } else if (mode === 'atom') {
      const el = this.selected || byZ[10];
      this.wall.show(false);
      this.stage.visible = true;
      this.bench.setElement(el);
      this.bench.show(true);
      this.setAtomDetail(this.atomDetail, false);
      this.ui.showInspector(el);
      this.benchLight.color.setRGB(...glowColorOf(el));
      this.benchLight.intensity = this.atomDetail === 'structure' ? 1.8 : 7;
      this.atomLight.intensity = this.atomDetail === 'structure' ? 9 : 0;
      this.flyTo(this.poseFor('atom'));
    }
  }

  toggleAtomPause() {
    this.paused = !this.paused;
    this.bench.setPaused(this.paused);
    this.ui.setPaused(this.paused);
    this.ui.toast(this.paused ? '电子轨道已暂停' : '电子轨道继续');
  }

  setAtomDetail(mode, notify = true) {
    this.atomDetail = mode === 'structure' ? 'structure' : 'glow';
    const structure = this.atomDetail === 'structure';
    this.bench.setDetail(structure);
    this.ui.setDetail(this.atomDetail);
    this.bloom.strength = structure ? 0.06 : 0.52;
    this.bloom.threshold = structure ? 1.15 : 0.74;
    this.benchLight.intensity = this.mode === 'atom' ? (structure ? 1.8 : 7) : 0;
    this.atomLight.intensity = this.mode === 'atom' ? (structure ? 9 : 0) : 0;
    if (notify) this.ui.toast(structure ? '结构视图 · 关闭辉光，显示质子 / 中子 / 轨道' : '辉光视图 · 元素特征色');
  }

  openElement(el) {
    this.selected = el;
    this.wall.setSelected(el.z - 1);
    this.setMode('atom');
  }

  stepElement(dir) {
    if (this.mode !== 'atom' || !this.selected) return;
    const z = this.selected.z + dir;
    const el = byZ[z];
    if (!el) return;
    this.selected = el;
    this.wall.setSelected(z - 1);
    this.bench.setElement(el);
    this.bench.show(true);
    this.bench.setPaused(this.paused);
    this.setAtomDetail(this.atomDetail, false);
    this.benchLight.color.setRGB(...glowColorOf(el));
    this.benchLight.intensity = this.atomDetail === 'structure' ? 1.8 : 7;
    this.atomLight.intensity = this.atomDetail === 'structure' ? 9 : 0;
    this.ui.showInspector(el);
    this.ui.setPaused(this.paused);
    this.ui.toast(`${el.sym} ${el.zh} · Z ${String(z).padStart(3, '0')}`);
  }

  backToPeriodic() {
    this.setMode('periodic');
  }

  resetView() {
    this.flyTo(this.poseFor(this.mode));
  }

  poseFor(mode) {
    const portrait = innerWidth / innerHeight < 0.8;
    if (portrait) return mode === 'atom' ? POSES.atomMobile : POSES.periodicMobile;
    return POSES[mode] || POSES.periodic;
  }

  flyTo(pose, duration = 1.4) {
    this.tween = {
      t: 0, dur: duration,
      fromPos: this.camera.position.clone(), toPos: new THREE.Vector3(...pose.pos),
      fromTarget: this.controls.target.clone(), toTarget: new THREE.Vector3(...pose.target),
      fromFov: this.camera.fov, toFov: pose.fov,
    };
    this.controls.enabled = false;
  }

  applyPose(pose) {
    this.tween = null;
    this.camera.position.set(...pose.pos);
    this.controls.target.set(...pose.target);
    this.camera.fov = pose.fov;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.controls.target);
    this.controls.update();
  }

  updateTween(dt) {
    const tw = this.tween;
    if (!tw) return;
    tw.t += dt / tw.dur;
    const p = Math.min(1, tw.t), e = easeInOut(p);
    this.camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
    this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
    this.camera.fov = tw.fromFov + (tw.toFov - tw.fromFov) * e;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.controls.target);
    if (p >= 1) {
      this.tween = null;
      this.controls.enabled = true;
      this.controls.update();
    }
  }

  /* ------------------------------ picking ------------------------------ */
  handleClick() {
    if (this.mode === 'periodic') {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.wall.pick(this.raycaster, this.camera);
      if (hit) this.openElement(hit.element);
    }
  }

  updateHover() {
    if (!this.pointerDirty) return;
    this.pointerDirty = false;
    if (this.mode !== 'periodic') {
      if (this.hovered >= 0) { this.hovered = -1; this.wall.setHover(-1); }
      this.canvas.style.cursor = 'grab';
      this.ui.hideAtlasTip();
      return;
    }
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.wall.pick(this.raycaster, this.camera);
    this.hovered = hit ? hit.index : -1;
    this.wall.setHover(this.hovered);
    this.canvas.style.cursor = hit ? 'pointer' : 'grab';
    if (hit) this.ui.showAtlasTip(hit.element, this.pointerScreen);
    else this.ui.hideAtlasTip();
  }

  /* -------------------------------- loop -------------------------------- */
  loop() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;
    this.updateTween(dt);
    if (!this.tween) this.controls.update();
    this.updateHover();

    this.wall.update(dt, this.time, this.camera);
    this.bench.update(dt, this.time);
    this.stageRing.rotation.z = this.time * 0.08;
    this.grade.uniforms.uTime.value = this.time;
    this.stars.rotation.y = this.time * 0.003;
    this.composer.render();
  }
}

function frame() {
  return new Promise(r => requestAnimationFrame(() => r()));
}