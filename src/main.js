import './style.css';
import { NeonLab } from './core/app.js';

const canvas = document.getElementById('scene');
const app = new NeonLab(canvas);
app.init().catch((err) => {
  console.error(err);
  const step = document.getElementById('boot-step');
  if (step) {
    step.textContent = '初始化失败：' + (err && err.message ? err.message : err);
    step.style.color = '#ff6a7a';
  }
});