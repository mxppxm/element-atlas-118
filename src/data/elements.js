/* ------------------------------------------------------------------
   Neon Lab 3D — 118 element dataset + emission spectra
   Data only, no external assets.
------------------------------------------------------------------- */

export const CATEGORIES = {
  nonmetal:  { label: '非金属',   color: '#8dff9e' },
  noble:     { label: '稀有气体', color: '#c08bff' },
  alkali:    { label: '碱金属',   color: '#ff7561' },
  alkaline:  { label: '碱土金属', color: '#ffb35c' },
  metalloid: { label: '类金属',   color: '#5fe6bd' },
  halogen:   { label: '卤素',     color: '#ffe267' },
  transition:{ label: '过渡金属', color: '#4fd4ff' },
  post:      { label: '后过渡金属', color: '#7c96ff' },
  lanthanide:{ label: '镧系',     color: '#ff7fd9' },
  actinide:  { label: '锕系',     color: '#b78bff' },
  unknown:   { label: '性质未知', color: '#8695a6' },
};

/* z, symbol, latin name, 中文名, relative atomic mass, category */
const RAW = [
  [1,'H','Hydrogen','氢','1.008','nonmetal'],
  [2,'He','Helium','氦','4.0026','noble'],
  [3,'Li','Lithium','锂','6.94','alkali'],
  [4,'Be','Beryllium','铍','9.0122','alkaline'],
  [5,'B','Boron','硼','10.81','metalloid'],
  [6,'C','Carbon','碳','12.011','nonmetal'],
  [7,'N','Nitrogen','氮','14.007','nonmetal'],
  [8,'O','Oxygen','氧','15.999','nonmetal'],
  [9,'F','Fluorine','氟','18.998','halogen'],
  [10,'Ne','Neon','氖','20.180','noble'],
  [11,'Na','Sodium','钠','22.990','alkali'],
  [12,'Mg','Magnesium','镁','24.305','alkaline'],
  [13,'Al','Aluminium','铝','26.982','post'],
  [14,'Si','Silicon','硅','28.085','metalloid'],
  [15,'P','Phosphorus','磷','30.974','nonmetal'],
  [16,'S','Sulfur','硫','32.06','nonmetal'],
  [17,'Cl','Chlorine','氯','35.45','halogen'],
  [18,'Ar','Argon','氩','39.948','noble'],
  [19,'K','Potassium','钾','39.098','alkali'],
  [20,'Ca','Calcium','钙','40.078','alkaline'],
  [21,'Sc','Scandium','钪','44.956','transition'],
  [22,'Ti','Titanium','钛','47.867','transition'],
  [23,'V','Vanadium','钒','50.942','transition'],
  [24,'Cr','Chromium','铬','51.996','transition'],
  [25,'Mn','Manganese','锰','54.938','transition'],
  [26,'Fe','Iron','铁','55.845','transition'],
  [27,'Co','Cobalt','钴','58.933','transition'],
  [28,'Ni','Nickel','镍','58.693','transition'],
  [29,'Cu','Copper','铜','63.546','transition'],
  [30,'Zn','Zinc','锌','65.38','transition'],
  [31,'Ga','Gallium','镓','69.723','post'],
  [32,'Ge','Germanium','锗','72.630','metalloid'],
  [33,'As','Arsenic','砷','74.922','metalloid'],
  [34,'Se','Selenium','硒','78.971','nonmetal'],
  [35,'Br','Bromine','溴','79.904','halogen'],
  [36,'Kr','Krypton','氪','83.798','noble'],
  [37,'Rb','Rubidium','铷','85.468','alkali'],
  [38,'Sr','Strontium','锶','87.62','alkaline'],
  [39,'Y','Yttrium','钇','88.906','transition'],
  [40,'Zr','Zirconium','锆','91.224','transition'],
  [41,'Nb','Niobium','铌','92.906','transition'],
  [42,'Mo','Molybdenum','钼','95.95','transition'],
  [43,'Tc','Technetium','锝','98','transition'],
  [44,'Ru','Ruthenium','钌','101.07','transition'],
  [45,'Rh','Rhodium','铑','102.91','transition'],
  [46,'Pd','Palladium','钯','106.42','transition'],
  [47,'Ag','Silver','银','107.87','transition'],
  [48,'Cd','Cadmium','镉','112.41','transition'],
  [49,'In','Indium','铟','114.82','post'],
  [50,'Sn','Tin','锡','118.71','post'],
  [51,'Sb','Antimony','锑','121.76','metalloid'],
  [52,'Te','Tellurium','碲','127.60','metalloid'],
  [53,'I','Iodine','碘','126.90','halogen'],
  [54,'Xe','Xenon','氙','131.29','noble'],
  [55,'Cs','Caesium','铯','132.91','alkali'],
  [56,'Ba','Barium','钡','137.33','alkaline'],
  [57,'La','Lanthanum','镧','138.91','lanthanide'],
  [58,'Ce','Cerium','铈','140.12','lanthanide'],
  [59,'Pr','Praseodymium','镨','140.91','lanthanide'],
  [60,'Nd','Neodymium','钕','144.24','lanthanide'],
  [61,'Pm','Promethium','钷','145','lanthanide'],
  [62,'Sm','Samarium','钐','150.36','lanthanide'],
  [63,'Eu','Europium','铕','151.96','lanthanide'],
  [64,'Gd','Gadolinium','钆','157.25','lanthanide'],
  [65,'Tb','Terbium','铽','158.93','lanthanide'],
  [66,'Dy','Dysprosium','镝','162.50','lanthanide'],
  [67,'Ho','Holmium','钬','164.93','lanthanide'],
  [68,'Er','Erbium','铒','167.26','lanthanide'],
  [69,'Tm','Thulium','铥','168.93','lanthanide'],
  [70,'Yb','Ytterbium','镱','173.05','lanthanide'],
  [71,'Lu','Lutetium','镥','174.97','lanthanide'],
  [72,'Hf','Hafnium','铪','178.49','transition'],
  [73,'Ta','Tantalum','钽','180.95','transition'],
  [74,'W','Tungsten','钨','183.84','transition'],
  [75,'Re','Rhenium','铼','186.21','transition'],
  [76,'Os','Osmium','锇','190.23','transition'],
  [77,'Ir','Iridium','铱','192.22','transition'],
  [78,'Pt','Platinum','铂','195.08','transition'],
  [79,'Au','Gold','金','196.97','transition'],
  [80,'Hg','Mercury','汞','200.59','transition'],
  [81,'Tl','Thallium','铊','204.38','post'],
  [82,'Pb','Lead','铅','207.2','post'],
  [83,'Bi','Bismuth','铋','208.98','post'],
  [84,'Po','Polonium','钋','209','post'],
  [85,'At','Astatine','砹','210','halogen'],
  [86,'Rn','Radon','氡','222','noble'],
  [87,'Fr','Francium','钫','223','alkali'],
  [88,'Ra','Radium','镭','226','alkaline'],
  [89,'Ac','Actinium','锕','227','actinide'],
  [90,'Th','Thorium','钍','232.04','actinide'],
  [91,'Pa','Protactinium','镤','231.04','actinide'],
  [92,'U','Uranium','铀','238.03','actinide'],
  [93,'Np','Neptunium','镎','237','actinide'],
  [94,'Pu','Plutonium','钚','244','actinide'],
  [95,'Am','Americium','镅','243','actinide'],
  [96,'Cm','Curium','锔','247','actinide'],
  [97,'Bk','Berkelium','锫','247','actinide'],
  [98,'Cf','Californium','锎','251','actinide'],
  [99,'Es','Einsteinium','锿','252','actinide'],
  [100,'Fm','Fermium','镄','257','actinide'],
  [101,'Md','Mendelevium','钔','258','actinide'],
  [102,'No','Nobelium','锘','259','actinide'],
  [103,'Lr','Lawrencium','铹','266','actinide'],
  [104,'Rf','Rutherfordium','𬬻','267','transition'],
  [105,'Db','Dubnium','𬭊','268','transition'],
  [106,'Sg','Seaborgium','𬭳','269','transition'],
  [107,'Bh','Bohrium','𬭛','270','transition'],
  [108,'Hs','Hassium','𬭶','269','transition'],
  [109,'Mt','Meitnerium','鿏','278','unknown'],
  [110,'Ds','Darmstadtium','𫟼','281','unknown'],
  [111,'Rg','Roentgenium','𬬭','282','unknown'],
  [112,'Cn','Copernicium','鿔','285','unknown'],
  [113,'Nh','Nihonium','鿭','286','post'],
  [114,'Fl','Flerovium','𫓧','289','post'],
  [115,'Mc','Moscovium','镆','290','post'],
  [116,'Lv','Livermorium','𫟷','293','post'],
  [117,'Ts','Tennessine','鿬','294','halogen'],
  [118,'Og','Oganesson','鿫','294','noble'],
];

function periodOf(z) {
  if (z <= 2) return 1;
  if (z <= 10) return 2;
  if (z <= 18) return 3;
  if (z <= 36) return 4;
  if (z <= 54) return 5;
  if (z <= 86) return 6;
  return 7;
}
function groupOf(z, period) {
  if (z === 1) return 1;
  if (z === 2) return 18;
  if (period === 2) return z <= 4 ? z - 2 : z + 8;
  if (period === 3) return z <= 12 ? z - 10 : z;
  if (period === 4) return z - 18;
  if (period === 5) return z - 36;
  if (period === 6) {
    if (z <= 56) return z - 54;
    if (z <= 71) return 3;
    return z - 68;
  }
  if (z <= 88) return z - 86;
  if (z <= 103) return 3;
  return z - 100;
}

const FEATURED = { 1: 1, 6: 1, 10: 1, 18: 1 };

export const ELEMENTS = RAW.map(([z, sym, en, zh, mass, cat]) => {
  const period = periodOf(z);
  const group = groupOf(z, period);
  const fblock = (z >= 57 && z <= 71) || (z >= 89 && z <= 103);
  let row = period - 1;
  let col = group - 1;
  if (fblock) {
    row = z <= 71 ? 7 : 8;
    col = z - (z <= 71 ? 55 : 87);
  }
  return {
    z, sym, en, zh, mass, cat, group, period,
    row, col, fblock: !!fblock,
    featured: !!FEATURED[z],
    name: `${zh} · ${en}`,
  };
});

export const byZ = Object.fromEntries(ELEMENTS.map(e => [e.z, e]));
export const bySym = Object.fromEntries(ELEMENTS.map(e => [e.sym, e]));

/* ---------------- electron shells (aufbau) ---------------- */
const ORBITALS = [
  ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2],
  ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2],
  ['4f', 14], ['5d', 10], ['6p', 6], ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6],
];
const SUP = { 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹' };
const sup = n => String(n).split('').map(c => SUP[c] || c).join('');

/* Ground-state exceptions to the Madelung order (NIST). Each entry
   moves electrons between subshells relative to the aufbau filling. */
const CONFIG_EXCEPTIONS = {
  24: { '4s': -1, '3d': 1 },  29: { '4s': -1, '3d': 1 },
  41: { '5s': -1, '4d': 1 },  42: { '5s': -1, '4d': 1 },
  44: { '5s': -1, '4d': 1 },  45: { '5s': -1, '4d': 1 },
  46: { '5s': -2, '4d': 2 },  47: { '5s': -1, '4d': 1 },
  57: { '4f': -1, '5d': 1 },  58: { '4f': -1, '5d': 1 },
  64: { '4f': -1, '5d': 1 },  78: { '6s': -1, '5d': 1 },
  79: { '6s': -1, '5d': 1 },  89: { '5f': -1, '6d': 1 },
  90: { '5f': -2, '6d': 2 },  91: { '5f': -1, '6d': 1 },
  92: { '5f': -1, '6d': 1 },  93: { '5f': -1, '6d': 1 },
  96: { '5f': -1, '6d': 1 },  103: { '6d': -1, '7p': 1 },
};

const _configCache = new Map();
const NOBLE_CORES = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
const L_ORDER = { s: 0, p: 1, d: 2, f: 3 };

/* Noble-gas shorthand, valence subshells ordered by n then l: [Ar] 3d¹⁰ 4s¹ */
function shortConfig(z, occ) {
  const core = NOBLE_CORES.find(([cz]) => cz < z);
  if (!core) return [...occ].filter(([, n]) => n > 0).map(([k, n]) => k + sup(n)).join(' ');
  const coreOcc = new Map();
  let left = core[0];
  for (const [name, cap] of ORBITALS) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    left -= n;
    coreOcc.set(name, n);
  }
  const rest = [...occ]
    .map(([k, n]) => [k, n - (coreOcc.get(k) || 0)])
    .filter(([, n]) => n > 0)
    .sort((a, b) => (+a[0][0] - +b[0][0]) || (L_ORDER[a[0][1]] - L_ORDER[b[0][1]]));
  return `[${core[1]}] ` + rest.map(([k, n]) => k + sup(n)).join(' ');
}

export function electronConfig(z) {
  if (_configCache.has(z)) return _configCache.get(z);
  const occ = new Map();
  let left = z;
  for (const [name, cap] of ORBITALS) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    left -= n;
    occ.set(name, n);
  }
  const fix = CONFIG_EXCEPTIONS[z];
  if (fix) for (const [name, d] of Object.entries(fix)) occ.set(name, (occ.get(name) || 0) + d);
  const parts = [];
  const shell = [0, 0, 0, 0, 0, 0, 0];
  for (const [name] of ORBITALS) {
    const n = occ.get(name) || 0;
    if (n <= 0) continue;
    parts.push(name + sup(n));
    shell[parseInt(name[0], 10) - 1] += n;
  }
  let last = shell.length - 1;
  while (last > 0 && shell[last] === 0) last--;
  const res = { config: parts.join(' '), short: shortConfig(z, occ), shells: shell.slice(0, last + 1), exception: !!fix };
  _configCache.set(z, res);
  return res;
}

/* ---------------- wavelength → RGB ---------------- */
export function wavelengthToRGB(nm, normalize = true) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 780) { r = 1; }
  else { r = 0.55; g = 0.06; b = 0.42; } // IR → dim magenta mark

  let f = 1;
  if (nm >= 380 && nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm > 700 && nm <= 780) f = 0.3 + 0.7 * (780 - nm) / 80;
  else if (nm < 380 || nm > 780) f = 0.22;
  const gamma = 0.8;
  const out = [r, g, b].map(v => Math.pow(Math.max(0, v) * f, gamma));
  const mx = Math.max(...out);
  if (normalize && mx > 0) return out.map(v => v / mx);
  return out;
}

export function rgbCss(rgb, a = 1) {
  return `rgba(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)},${a})`;
}

/* ------------------------------------------------------------------
   Emission spectra.  `real: true` → measured prominent lines.
   Approximations are derived deterministically and labeled in the HUD.
------------------------------------------------------------------- */
const S = (lines, real = true) => ({ lines, real });
const L = (nm, i, band = false) => ({ nm, i, band });

const SPECTRA = {
  1:  S([L(656.28, 1), L(486.13, .46), L(434.05, .28), L(410.17, .19)]),
  2:  S([L(587.56, 1), L(501.57, .55), L(706.52, .5), L(447.15, .48), L(402.62, .3), L(471.31, .25)]),
  3:  S([L(670.78, 1), L(610.35, .32), L(460.29, .18)]),
  6:  S([L(247.86, .55), L(426.7, .35, true), L(473.7, .55, true), L(516.5, 1, true), L(558.5, .5, true)]),
  7:  S([L(500.5, .6), L(567.9, .8), L(648.2, .45), L(746.8, 1), L(821.6, .4)]),
  8:  S([L(777.4, 1), L(844.6, .75), L(630.0, .35), L(557.7, .3)]),
  10: S([L(585.25, 1), L(588.19, .5), L(594.48, .45), L(603.0, .5), L(607.43, .52),
         L(614.31, .48), L(616.36, .52), L(621.73, .58), L(626.65, .62), L(633.44, .55),
         L(638.3, .8), L(640.22, .85), L(650.65, 1), L(653.29, .55), L(659.9, .5),
         L(667.83, .45), L(671.7, .4), L(692.95, .3), L(703.24, .68), L(717.39, .3), L(724.52, .28)]),
  11: S([L(589.0, 1), L(589.59, .95), L(568.8, .3), L(615.4, .2)]),
  13: S([L(309.27, .55), L(394.4, 1), L(396.15, .95)]),
  14: S([L(288.16, .7), L(390.55, 1), L(410.29, .6), L(634.71, .4)]),
  18: S([L(420.07, .28), L(434.5, .24), L(442.6, .26), L(451.07, .3), L(458.0, .28),
         L(472.69, .35), L(488.0, .38), L(496.51, .4), L(506.2, .35), L(514.53, .32),
         L(696.54, .8), L(706.72, .72), L(738.4, .5), L(750.39, 1), L(763.51, .9),
         L(772.42, .55), L(794.82, .45), L(811.53, 1.05)]),
  20: S([L(393.37, .75), L(396.85, .9), L(422.67, 1), L(610.3, .35), L(616.2, .4)]),
  22: S([L(334.9, .4), L(365.35, .7), L(398.98, 1), L(498.17, .7), L(517.37, .65)]),
  24: S([L(357.87, .6), L(359.35, .55), L(425.43, 1), L(427.48, .95), L(520.6, .6)]),
  25: S([L(403.08, 1), L(403.31, .95), L(475.4, .6), L(478.34, .55)]),
  26: S([L(358.12, .65), L(371.99, .7), L(382.04, .5), L(404.58, .55), L(438.35, 1), L(495.76, .5), L(516.75, .7), L(527.04, .8)]),
  27: S([L(345.35, .65), L(412.13, 1), L(535.0, .4)]),
  28: S([L(341.48, .8), L(352.45, 1), L(361.94, .75)]),
  29: S([L(324.75, 1), L(327.4, .95), L(510.55, .4), L(515.32, .35), L(521.82, .3), L(578.21, .3)]),
  30: S([L(213.86, .7), L(307.59, .4), L(328.23, .8), L(334.5, 1), L(468.01, .5), L(472.22, .55), L(481.05, .6)]),
  34: S([L(196.09, .6), L(203.99, .5), L(206.28, .55), L(241.35, .4)]),
  35: S([L(447.68, .4), L(470.49, .55), L(481.67, 1)]),
  36: S([L(557.03, 1), L(587.09, .8), L(645.63, .7), L(758.74, .4), L(769.45, .3)]),
  37: S([L(780.03, 1), L(794.76, .7), L(420.18, .25)]),
  38: S([L(407.77, .6), L(421.55, .5), L(460.73, 1), L(687.83, .4)]),
  40: S([L(360.12, .5), L(386.24, .55), L(389.03, .6), L(471.01, .5)]),
  42: S([L(313.26, .6), L(317.03, .55), L(379.83, .7), L(386.41, .75), L(390.3, 1)]),
  46: S([L(340.46, .8), L(351.69, 1), L(363.47, .7)]),
  47: S([L(328.07, 1), L(338.29, .95), L(520.91, .4), L(546.55, .35)]),
  48: S([L(228.8, .7), L(326.11, .85), L(340.37, .6), L(508.58, 1), L(643.85, .55)]),
  54: S([L(450.1, .4), L(462.43, .7), L(467.12, 1), L(823.16, .5), L(881.94, .4)]),
  55: S([L(455.53, .35), L(852.11, 1), L(894.35, .8)]),
  56: S([L(553.55, 1), L(577.77, .7), L(614.17, .55), L(649.88, .45)]),
  57: S([L(394.91, .8), L(408.67, 1), L(412.29, .9), L(428.1, .7)]),
  59: S([L(495.14, 1), L(513.34, .8), L(525.97, .7)]),
  60: S([L(492.45, .9), L(521.4, 1), L(527.67, .8)]),
  63: S([L(459.4, 1), L(462.72, .95), L(576.52, .5), L(611.85, .45)]),
  64: S([L(422.58, 1), L(432.83, .8), L(440.47, .7)]),
  66: S([L(404.6, 1), L(421.17, .8), L(458.5, .6)]),
  68: S([L(400.8, .9), L(415.11, 1), L(440.88, .6)]),
  70: S([L(398.8, 1), L(399.1, .9), L(555.6, .4)]),
  74: S([L(400.88, 1), L(429.46, .8), L(488.69, .5)]),
  78: S([L(306.47, .8), L(340.82, .7), L(363.79, 1)]),
  79: S([L(242.8, .8), L(267.59, 1), L(312.28, .6), L(479.26, .4)]),
  80: S([L(253.65, 1), L(404.66, .7), L(435.83, .85), L(546.07, 1.05), L(576.96, .5), L(579.07, .5)]),
  82: S([L(283.31, 1), L(368.35, .6), L(405.78, .7)]),
  92: S([L(393.2, .6), L(409.01, .7), L(424.44, 1), L(434.17, .85), L(455.0, .55)]),
};

const FALLBACK_TINT = {
  nonmetal: [0.55, 1.0, 0.7], noble: [0.8, 0.55, 1.0], alkali: [1.0, 0.5, 0.42],
  alkaline: [1.0, 0.72, 0.4], metalloid: [0.4, 0.95, 0.8], halogen: [1.0, 0.9, 0.45],
  transition: [0.4, 0.82, 1.0], post: [0.55, 0.66, 1.0], lanthanide: [1.0, 0.55, 0.9],
  actinide: [0.75, 0.6, 1.0], unknown: [0.55, 0.62, 0.7],
};

function rand(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function spectrumOf(elOrZ) {
  const z = typeof elOrZ === 'number' ? elOrZ : elOrZ.z;
  const raw = SPECTRA[z];
  if (raw) {
    const lines = raw.lines.slice().sort((a, b) => b.i - a.i);
    return { ...raw, lines };
  }
  // deterministic approximation, clearly labelled in the UI
  const el = byZ[z];
  const tint = FALLBACK_TINT[el.cat] || [0.6, 0.75, 1];
  const base = 430 + rand(z) * 170;
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const nm = Math.max(400, Math.min(720, base + (rand(z * 3 + i) - 0.5) * 220));
    lines.push(L(nm, 0.45 + rand(z * 7 + i) * 0.55));
  }
  lines.sort((a, b) => b.i - a.i);
  return { lines, real: false, tint };
}

export function glowColorOf(el) {
  const sp = spectrumOf(el);
  const visible = sp.lines.filter(l => l.nm >= 420 && l.nm <= 690);
  let rgb;
  if (sp.tint && !sp.real) {
    rgb = sp.tint;
  } else if (visible.length) {
    rgb = wavelengthToRGB(visible[0].nm);
  } else {
    rgb = wavelengthToRGB(sp.lines[0].nm);
  }
  // weighted blend of the three strongest visible lines for a richer hue
  if (sp.real && visible.length) {
    const acc = [0, 0, 0];
    let wsum = 0;
    visible.slice(0, 4).forEach(l => {
      const c = wavelengthToRGB(l.nm);
      const w = l.i * l.i;
      acc[0] += c[0] * w; acc[1] += c[1] * w; acc[2] += c[2] * w;
      wsum += w;
    });
    if (wsum > 0) rgb = acc.map(v => v / wsum);
    const mx = Math.max(...rgb);
    if (mx > 0) rgb = rgb.map(v => v / mx);
  }
  const boost = rgb.map(v => Math.min(1, 0.18 + v * 0.92));
  return boost;
}

/* gas signature table used by the reaction chambers / neon sign */
export const GASES = {
  H:  { sym: 'H',  zh: '氢', en: 'HYDROGEN', z: 1,
        tube: '#ff36d2', core: '#ffd6fa', glow: [1.0, 0.18, 0.82],
        note: '高频品红等离子喷流 · 快速粒子脉冲', strike: 4.0 },
  C:  { sym: 'C',  zh: '碳', en: 'CARBON', z: 6,
        tube: '#5cffc6', core: '#eafff7', glow: [0.36, 1.0, 0.78],
        note: '高温碳蒸气 · C₂ Swan 带青绿放电', strike: 3.3 },
  Ne: { sym: 'Ne', zh: '氖', en: 'NEON', z: 10,
        tube: '#ff561e', core: '#ffcea0', glow: [1.0, 0.33, 0.10],
        note: '标志性橙红霓虹 · 实时分支电弧', strike: 3.1 },
  Ar: { sym: 'Ar', zh: '氩', en: 'ARGON', z: 18,
        tube: '#8060ff', core: '#d6dcff', glow: [0.5, 0.38, 1.0],
        note: '冷冽电光紫蓝 · 螺旋辉光放电', strike: 3.8 },
  Kr: { sym: 'Kr', zh: '氪', en: 'KRYPTON', z: 36,
        tube: '#cef0ff', core: '#ffffff', glow: [0.78, 0.92, 1.0],
        note: '冰白冷光 · 高纯净玻璃管', strike: 4.4 },
};

/* real spectra for the four gases feed the reaction chambers */
export const GAS_SPECTRUM = {
  Ne: SPECTRA[10], Ar: SPECTRA[18], H: SPECTRA[1], Kr: SPECTRA[36],
};
/* ------------------------------------------------------------------
   Element analysis: block / phase / curated physical data / notes
------------------------------------------------------------------- */

const F_BLOCK = new Set([...Array.from({ length: 15 }, (_, i) => 57 + i), ...Array.from({ length: 15 }, (_, i) => 89 + i)]);
const LIQUID = new Set(['Br', 'Hg']);
const GAS_PHASE = new Set(['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn']);
const SYNTHETIC = new Set([43, 61, ...Array.from({ length: 26 }, (_, i) => 93 + i)]);

export function blockOf(el) {
  if (F_BLOCK.has(el.z)) return 'f';
  if (el.group <= 2 || el.sym === 'He') return 's';
  if (el.group >= 13) return 'p';
  return 'd';
}

export function phaseOf(el) {
  if (SYNTHETIC.has(el.z)) return '合成';
  if (GAS_PHASE.has(el.sym)) return '气态';
  if (LIQUID.has(el.sym)) return '液态';
  return '固态';
}

export function isSynthetic(el) {
  return SYNTHETIC.has(el.z);
}

/* density, melting / boiling points, Pauling EN, common oxidation states,
   empirical radius, discovery year / discoverer, crustal abundance */
export const PHYS = {
  H:  { d: '0.0899 g/L', m: '−259.1 °C', bo: '−252.9 °C', en: '2.20', ox: '−1, +1', r: '53 pm', y: '1766', by: 'Cavendish', ab: '1 400 ppm' },
  He: { d: '0.1786 g/L', m: '−272.2 °C', bo: '−268.9 °C', en: '—', ox: '0', r: '31 pm', y: '1868', by: 'Janssen / Lockyer', ab: '0.008 ppm' },
  Li: { d: '0.534', m: '180.5 °C', bo: '1 342 °C', en: '0.98', ox: '+1', r: '152 pm', y: '1817', by: 'Arfwedson', ab: '20 ppm' },
  Be: { d: '1.85', m: '1 287 °C', bo: '2 469 °C', en: '1.57', ox: '+2', r: '112 pm', y: '1798', by: 'Vauquelin', ab: '2.8 ppm' },
  B:  { d: '2.34', m: '2 076 °C', bo: '3 927 °C', en: '2.04', ox: '+3', r: '90 pm', y: '1808', by: 'Gay-Lussac / Thénard', ab: '10 ppm' },
  C:  { d: '2.267', m: '3 550 °C', bo: '4 027 °C', en: '2.55', ox: '−4 … +4', r: '70 pm', y: '古代', by: '—', ab: '200 ppm' },
  N:  { d: '1.251 g/L', m: '−210.0 °C', bo: '−195.8 °C', en: '3.04', ox: '−3 … +5', r: '65 pm', y: '1772', by: 'Rutherford', ab: '19 ppm' },
  O:  { d: '1.429 g/L', m: '−218.8 °C', bo: '−183.0 °C', en: '3.44', ox: '−2', r: '60 pm', y: '1774', by: 'Priestley', ab: '461 000 ppm' },
  F:  { d: '1.696 g/L', m: '−219.7 °C', bo: '−188.1 °C', en: '3.98', ox: '−1', r: '50 pm', y: '1886', by: 'Moissan', ab: '585 ppm' },
  Ne: { d: '0.9002 g/L', m: '−248.6 °C', bo: '−246.1 °C', en: '—', ox: '0', r: '38 pm', y: '1898', by: 'Ramsay / Travers', ab: '0.005 ppm' },
  Na: { d: '0.968', m: '97.8 °C', bo: '883 °C', en: '0.93', ox: '+1', r: '186 pm', y: '1807', by: 'Davy', ab: '23 600 ppm' },
  Mg: { d: '1.738', m: '650 °C', bo: '1 091 °C', en: '1.31', ox: '+2', r: '160 pm', y: '1755', by: 'Black', ab: '23 300 ppm' },
  Al: { d: '2.70', m: '660.3 °C', bo: '2 519 °C', en: '1.61', ox: '+3', r: '143 pm', y: '1825', by: 'Ørsted', ab: '82 300 ppm' },
  Si: { d: '2.329', m: '1 414 °C', bo: '3 265 °C', en: '1.90', ox: '−4, +4', r: '111 pm', y: '1824', by: 'Berzelius', ab: '282 000 ppm' },
  P:  { d: '1.823', m: '44.2 °C', bo: '280.5 °C', en: '2.19', ox: '−3, +3, +5', r: '100 pm', y: '1669', by: 'Brand', ab: '1 050 ppm' },
  S:  { d: '2.07', m: '115.2 °C', bo: '444.7 °C', en: '2.58', ox: '−2, +4, +6', r: '100 pm', y: '古代', by: '—', ab: '350 ppm' },
  Cl: { d: '3.214 g/L', m: '−101.5 °C', bo: '−34.0 °C', en: '3.16', ox: '−1, +1, +3, +5, +7', r: '99 pm', y: '1774', by: 'Scheele', ab: '145 ppm' },
  Ar: { d: '1.784 g/L', m: '−189.3 °C', bo: '−185.8 °C', en: '—', ox: '0', r: '71 pm', y: '1894', by: 'Rayleigh / Ramsay', ab: '3.5 ppm' },
  K:  { d: '0.862', m: '63.4 °C', bo: '759 °C', en: '0.82', ox: '+1', r: '227 pm', y: '1807', by: 'Davy', ab: '20 900 ppm' },
  Ca: { d: '1.55', m: '842 °C', bo: '1 484 °C', en: '1.00', ox: '+2', r: '197 pm', y: '1808', by: 'Davy', ab: '41 500 ppm' },
  Sc: { d: '2.985', m: '1 541 °C', bo: '2 830 °C', en: '1.36', ox: '+3', r: '162 pm', y: '1879', by: 'Nilson', ab: '22 ppm' },
  Ti: { d: '4.506', m: '1 668 °C', bo: '3 287 °C', en: '1.54', ox: '+2, +3, +4', r: '147 pm', y: '1791', by: 'Gregor', ab: '5 650 ppm' },
  V:  { d: '6.11', m: '1 910 °C', bo: '3 407 °C', en: '1.63', ox: '+2 … +5', r: '134 pm', y: '1801', by: 'del Río', ab: '120 ppm' },
  Cr: { d: '7.19', m: '1 907 °C', bo: '2 671 °C', en: '1.66', ox: '+2, +3, +6', r: '128 pm', y: '1797', by: 'Vauquelin', ab: '102 ppm' },
  Mn: { d: '7.21', m: '1 246 °C', bo: '2 061 °C', en: '1.55', ox: '+2, +4, +7', r: '127 pm', y: '1774', by: 'Gahn', ab: '950 ppm' },
  Fe: { d: '7.874', m: '1 538 °C', bo: '2 861 °C', en: '1.83', ox: '+2, +3', r: '126 pm', y: '古代', by: '—', ab: '56 300 ppm' },
  Co: { d: '8.90', m: '1 495 °C', bo: '2 927 °C', en: '1.88', ox: '+2, +3', r: '125 pm', y: '1735', by: 'Brandt', ab: '25 ppm' },
  Ni: { d: '8.908', m: '1 455 °C', bo: '2 913 °C', en: '1.91', ox: '+2, +3', r: '124 pm', y: '1751', by: 'Cronstedt', ab: '84 ppm' },
  Cu: { d: '8.96', m: '1 084.6 °C', bo: '2 562 °C', en: '1.90', ox: '+1, +2', r: '128 pm', y: '古代', by: '—', ab: '60 ppm' },
  Zn: { d: '7.14', m: '419.5 °C', bo: '907 °C', en: '1.65', ox: '+2', r: '134 pm', y: '古代', by: '—', ab: '70 ppm' },
  Ga: { d: '5.91', m: '29.8 °C', bo: '2 400 °C', en: '1.81', ox: '+3', r: '135 pm', y: '1875', by: 'Boisbaudran', ab: '19 ppm' },
  Ge: { d: '5.323', m: '938.3 °C', bo: '2 833 °C', en: '2.01', ox: '+2, +4', r: '125 pm', y: '1886', by: 'Winkler', ab: '1.5 ppm' },
  As: { d: '5.727', m: '817 °C', bo: '614 °C', en: '2.18', ox: '−3, +3, +5', r: '119 pm', y: '古代', by: '—', ab: '1.8 ppm' },
  Se: { d: '4.81', m: '221 °C', bo: '685 °C', en: '2.55', ox: '−2, +4, +6', r: '116 pm', y: '1817', by: 'Berzelius', ab: '0.05 ppm' },
  Br: { d: '3.1028', m: '−7.2 °C', bo: '58.8 °C', en: '2.96', ox: '−1, +1, +3, +5', r: '114 pm', y: '1825', by: 'Balard', ab: '2.4 ppm' },
  Kr: { d: '3.749 g/L', m: '−157.4 °C', bo: '−153.2 °C', en: '3.00', ox: '0, +2', r: '88 pm', y: '1898', by: 'Ramsay / Travers', ab: '0.0001 ppm' },
  Rb: { d: '1.532', m: '39.3 °C', bo: '688 °C', en: '0.82', ox: '+1', r: '248 pm', y: '1861', by: 'Bunsen / Kirchhoff', ab: '90 ppm' },
  Sr: { d: '2.64', m: '777 °C', bo: '1 377 °C', en: '0.95', ox: '+2', r: '215 pm', y: '1790', by: 'Crawford', ab: '370 ppm' },
  Y:  { d: '4.472', m: '1 526 °C', bo: '3 345 °C', en: '1.22', ox: '+3', r: '180 pm', y: '1794', by: 'Gadolin', ab: '33 ppm' },
  Zr: { d: '6.506', m: '1 855 °C', bo: '4 409 °C', en: '1.33', ox: '+4', r: '160 pm', y: '1789', by: 'Klaproth', ab: '165 ppm' },
  Nb: { d: '8.57', m: '2 477 °C', bo: '4 744 °C', en: '1.6', ox: '+5', r: '146 pm', y: '1801', by: 'Hatchett', ab: '20 ppm' },
  Mo: { d: '10.28', m: '2 623 °C', bo: '4 639 °C', en: '2.16', ox: '+2 … +6', r: '139 pm', y: '1778', by: 'Scheele', ab: '1.2 ppm' },
  Ag: { d: '10.49', m: '961.8 °C', bo: '2 162 °C', en: '1.93', ox: '+1', r: '144 pm', y: '古代', by: '—', ab: '0.075 ppm' },
  Cd: { d: '8.65', m: '321.1 °C', bo: '767 °C', en: '1.69', ox: '+2', r: '151 pm', y: '1817', by: 'Stromeyer', ab: '0.15 ppm' },
  In: { d: '7.31', m: '156.6 °C', bo: '2 072 °C', en: '1.78', ox: '+3', r: '156 pm', y: '1863', by: 'Reich / Richter', ab: '0.25 ppm' },
  Sn: { d: '7.31', m: '231.9 °C', bo: '2 602 °C', en: '1.96', ox: '+2, +4', r: '145 pm', y: '古代', by: '—', ab: '2.3 ppm' },
  Sb: { d: '6.697', m: '630.6 °C', bo: '1 587 °C', en: '2.05', ox: '−3, +3, +5', r: '133 pm', y: '古代', by: '—', ab: '0.2 ppm' },
  Te: { d: '6.24', m: '449.5 °C', bo: '988 °C', en: '2.1', ox: '−2, +4, +6', r: '123 pm', y: '1782', by: 'Müller', ab: '0.001 ppm' },
  I:  { d: '4.933', m: '113.7 °C', bo: '184.3 °C', en: '2.66', ox: '−1, +1, +5, +7', r: '115 pm', y: '1811', by: 'Courtois', ab: '0.45 ppm' },
  Xe: { d: '5.894 g/L', m: '−111.8 °C', bo: '−108.1 °C', en: '2.6', ox: '0, +2, +4, +6, +8', r: '108 pm', y: '1898', by: 'Ramsay / Travers', ab: '0.00003 ppm' },
  Cs: { d: '1.93', m: '28.4 °C', bo: '671 °C', en: '0.79', ox: '+1', r: '265 pm', y: '1860', by: 'Bunsen / Kirchhoff', ab: '3 ppm' },
  Ba: { d: '3.62', m: '727 °C', bo: '1 897 °C', en: '0.89', ox: '+2', r: '217 pm', y: '1808', by: 'Davy', ab: '425 ppm' },
  La: { d: '6.146', m: '920 °C', bo: '3 464 °C', en: '1.10', ox: '+3', r: '187 pm', y: '1839', by: 'Mosander', ab: '39 ppm' },
  Ce: { d: '6.77', m: '795 °C', bo: '3 443 °C', en: '1.12', ox: '+3, +4', r: '182 pm', y: '1803', by: 'Berzelius / Hisinger', ab: '67 ppm' },
  Nd: { d: '7.007', m: '1 024 °C', bo: '3 074 °C', en: '1.14', ox: '+3', r: '181 pm', y: '1885', by: 'Welsbach', ab: '38 ppm' },
  Eu: { d: '5.264', m: '822 °C', bo: '1 529 °C', en: '1.2', ox: '+2, +3', r: '199 pm', y: '1901', by: 'Demarçay', ab: '2 ppm' },
  Gd: { d: '7.901', m: '1 313 °C', bo: '3 273 °C', en: '1.2', ox: '+3', r: '180 pm', y: '1880', by: 'Marignac', ab: '6.2 ppm' },
  W:  { d: '19.25', m: '3 422 °C', bo: '5 555 °C', en: '2.36', ox: '+2 … +6', r: '139 pm', y: '1783', by: 'Elhuyar', ab: '1.25 ppm' },
  Pt: { d: '21.45', m: '1 768.3 °C', bo: '3 825 °C', en: '2.28', ox: '+2, +4', r: '139 pm', y: '1735', by: 'Ulloa', ab: '0.005 ppm' },
  Au: { d: '19.30', m: '1 064.2 °C', bo: '2 856 °C', en: '2.54', ox: '+1, +3', r: '144 pm', y: '古代', by: '—', ab: '0.004 ppm' },
  Hg: { d: '13.534', m: '−38.8 °C', bo: '356.7 °C', en: '2.00', ox: '+1, +2', r: '151 pm', y: '古代', by: '—', ab: '0.085 ppm' },
  Pb: { d: '11.34', m: '327.5 °C', bo: '1 749 °C', en: '2.33', ox: '+2, +4', r: '175 pm', y: '古代', by: '—', ab: '14 ppm' },
  Bi: { d: '9.78', m: '271.4 °C', bo: '1 564 °C', en: '2.02', ox: '+3, +5', r: '155 pm', y: '古代', by: '—', ab: '0.009 ppm' },
  U:  { d: '19.1', m: '1 132.2 °C', bo: '4 131 °C', en: '1.38', ox: '+3 … +6', r: '156 pm', y: '1789', by: 'Klaproth', ab: '2.7 ppm' },
  Pu: { d: '19.816', m: '639.4 °C', bo: '3 228 °C', en: '1.28', ox: '+3 … +6', r: '159 pm', y: '1940', by: 'Seaborg', ab: '0（合成）' },
};

export const NOTES = {
  H: '宇宙中最丰富的元素。高压放电时 Balmer 线给出标志性品红，也是星际星云的主色。',
  He: '第二轻的元素，沸点最接近绝对零度。放电呈淡金/粉白，常用于低温与检漏。',
  C: '生命与有机化学的骨架。高温碳蒸气以 C₂ Swan 带呈青绿色，是火焰与碳星光谱的主角。',
  N: '地球大气的主要成分。放电呈红橙至紫色的氮气带，是闪电与极光的重要来源。',
  O: '地壳中最丰富的元素。氧等离子体在 630 / 558 nm 呈红绿极光色。',
  F: '电负性最高的元素，几乎与所有元素反应。室温下为淡黄色双原子气体。',
  Ne: '1898 年由 Ramsay 与 Travers 发现。585 / 640 nm 谱线群构成经典橙红霓虹，是本项目的默认元素。',
  Na: '碱金属，遇水剧烈反应。589 nm 钠双线是路灯与焰色反应的标志。',
  Mg: '轻质结构金属。燃烧时发出耀眼白光，早期闪光粉即使用镁。',
  Al: '地壳中含量最高的金属。表面自然氧化膜使其耐腐蚀。',
  Si: '半导体工业的基础。晶体硅的能带结构支撑了现代计算。',
  P: '白磷在空气中自燃，发出幽蓝光；是生命核酸与 ATP 的关键。',
  S: '古代已知元素。燃烧呈蓝色火焰，硫化物是火山气体的重要成分。',
  Cl: '黄绿色刺激性气体，强氧化剂；饮用水消毒的常用元素。',
  Ar: '大气中含量最高的稀有气体（约 0.93%）。放电呈冷冽紫蓝，广泛用于焊接保护。',
  K: '植物生长的关键元素；钾盐焰色呈淡紫。',
  Ca: '骨骼与贝壳的主要成分；石灰石、石膏的核心元素。',
  Ti: '强度重量比极高的金属；氧化钛是最常用的白色颜料。',
  Cr: '铬镀层与不锈钢的关键；红宝石的红色来自 Cr³⁺。',
  Mn: '钢铁冶炼的脱氧剂；锰结核是深海重要资源。',
  Fe: '地球核心的主要成分；铁的光谱与恒星核合成密切相关。',
  Co: '钴蓝颜料的来源；锂电池正极的重要元素。',
  Ni: '耐蚀合金与不锈钢的重要成分；镍氢电池。',
  Cu: '导电性优异的金属；铜焰色呈蓝绿，青铜时代的主角。',
  Zn: '镀锌防腐；氧化锌用于防晒与半导体。',
  Br: '室温下唯一的液态非金属之一（另一为汞）。',
  Kr: '稀有气体，KrF 激光与高效照明；放电呈冰白。',
  Ag: '导电性最好的金属；卤化银是传统摄影的基础。',
  Sn: '青铜的合金元素；锡疫是低温下的同素异形转变。',
  I: '紫黑色晶体，升华后呈紫色蒸气；甲状腺激素必需。',
  Xe: '稀有气体中较重者；氙灯与离子推进器的重要工质。',
  Cs: '电负性最低的稳定元素；铯原子钟定义了秒。',
  Ba: '钡餐造影；焰色反应呈黄绿色。',
  Au: '化学性质稳定的贵金属；金箔与电子接点的理想材料。',
  Hg: '室温下唯一的液态金属；蒸气有毒，已逐步淘汰。',
  Pb: '密度高、易加工；铅酸电池与辐射屏蔽。',
  U: '天然存在的最重元素；235U 的裂变支撑核能。',
  Pu: '人工合成的放射性锕系元素；钚电池用于深空探测器。',
};

export function noteOf(el) {
  return NOTES[el.sym] || `${CATEGORIES[el.cat].label} · 第 ${el.group} 族 / 第 ${el.period} 周期 · ${electronConfig(el.z).shells.length} 个电子壳层。`;
}

/* ------------------------------------------------------------------
   Common compounds and characteristic reactions (curated, teaching set)
------------------------------------------------------------------- */

export const COMPOUNDS = {
  H: [['H₂O', '水'], ['H₂O₂', '过氧化氢'], ['HCl', '盐酸'], ['NH₃', '氨']],
  He: [],
  Li: [['Li₂O', '氧化锂'], ['LiOH', '氢氧化锂'], ['Li₂CO₃', '碳酸锂']],
  Be: [['BeO', '氧化铍'], ['BeCl₂', '氯化铍']],
  B: [['B₂O₃', '氧化硼'], ['H₃BO₃', '硼酸'], ['Na₂B₄O₇', '硼砂']],
  C: [['CO₂', '二氧化碳'], ['CO', '一氧化碳'], ['CH₄', '甲烷'], ['CaCO₃', '碳酸钙']],
  N: [['NH₃', '氨'], ['HNO₃', '硝酸'], ['NO₂', '二氧化氮']],
  O: [['H₂O', '水'], ['O₃', '臭氧'], ['Fe₂O₃', '氧化铁']],
  F: [['HF', '氢氟酸'], ['NaF', '氟化钠'], ['CaF₂', '萤石']],
  Ne: [],
  Na: [['NaCl', '氯化钠'], ['NaOH', '氢氧化钠'], ['Na₂CO₃', '碳酸钠']],
  Mg: [['MgO', '氧化镁'], ['MgCl₂', '氯化镁'], ['Mg(OH)₂', '氢氧化镁']],
  Al: [['Al₂O₃', '氧化铝'], ['AlCl₃', '氯化铝'], ['Al(OH)₃', '氢氧化铝']],
  Si: [['SiO₂', '二氧化硅'], ['SiC', '碳化硅'], ['Na₂SiO₃', '硅酸钠']],
  P: [['P₂O₅', '五氧化二磷'], ['H₃PO₄', '磷酸'], ['Ca₃(PO₄)₂', '磷酸钙']],
  S: [['SO₂', '二氧化硫'], ['SO₃', '三氧化硫'], ['H₂SO₄', '硫酸']],
  Cl: [['HCl', '氯化氢'], ['NaClO', '次氯酸钠'], ['NaCl', '氯化钠']],
  Ar: [],
  K: [['KOH', '氢氧化钾'], ['KCl', '氯化钾'], ['K₂CO₃', '碳酸钾']],
  Ca: [['CaO', '氧化钙'], ['Ca(OH)₂', '氢氧化钙'], ['CaCO₃', '碳酸钙']],
  Ti: [['TiO₂', '二氧化钛'], ['TiCl₄', '四氯化钛']],
  Cr: [['Cr₂O₃', '氧化铬'], ['K₂Cr₂O₇', '重铬酸钾']],
  Mn: [['MnO₂', '二氧化锰'], ['KMnO₄', '高锰酸钾']],
  Fe: [['Fe₂O₃', '氧化铁'], ['Fe₃O₄', '四氧化三铁'], ['FeSO₄', '硫酸亚铁'], ['FeCl₃', '氯化铁']],
  Co: [['CoCl₂', '氯化钴'], ['Co₃O₄', '四氧化三钴']],
  Ni: [['NiSO₄', '硫酸镍'], ['NiO', '氧化镍']],
  Cu: [['CuSO₄', '硫酸铜'], ['CuO', '氧化铜'], ['CuCl₂', '氯化铜']],
  Zn: [['ZnCl₂', '氯化锌'], ['ZnO', '氧化锌'], ['ZnSO₄', '硫酸锌']],
  Ga: [['Ga₂O₃', '氧化镓'], ['GaAs', '砷化镓']],
  Ge: [['GeO₂', '二氧化锗'], ['GeCl₄', '四氯化锗']],
  As: [['As₂O₃', '三氧化二砷'], ['AsH₃', '砷化氢']],
  Se: [['SeO₂', '二氧化硒'], ['H₂Se', '硒化氢']],
  Br: [['HBr', '氢溴酸'], ['NaBr', '溴化钠'], ['Br₂', '溴单质']],
  Kr: [['KrF₂', '二氟化氪']],
  Ag: [['AgNO₃', '硝酸银'], ['AgCl', '氯化银']],
  Sn: [['SnO₂', '二氧化锡'], ['SnCl₂', '氯化亚锡']],
  I: [['KI', '碘化钾'], ['HI', '碘化氢'], ['I₂', '碘单质']],
  Xe: [['XeF₂', '二氟化氙'], ['XeF₄', '四氟化氙'], ['XeO₃', '三氧化氙']],
  Ba: [['BaSO₄', '硫酸钡'], ['BaCO₃', '碳酸钡'], ['BaO', '氧化钡']],
  W: [['WO₃', '三氧化钨'], ['Na₂WO₄', '钨酸钠']],
  Pt: [['PtCl₂', '氯化铂'], ['H₂PtCl₆', '氯铂酸']],
  Au: [['HAuCl₄', '氯金酸'], ['AuCl₃', '氯化金']],
  Hg: [['HgS', '硫化汞'], ['HgCl₂', '氯化汞']],
  Pb: [['PbO', '氧化铅'], ['PbSO₄', '硫酸铅'], ['Pb(NO₃)₂', '硝酸铅']],
  U: [['UO₂', '二氧化铀'], ['UF₆', '六氟化铀'], ['U₃O₈', '八氧化三铀']],
  Pu: [['PuO₂', '二氧化钚']],
};

export const REACTIONS = {
  H:  { eq: '2H₂ + O₂ → 2H₂O', note: '点燃 · 放热' },
  Li: { eq: '4Li + O₂ → 2Li₂O', note: '常温缓慢氧化' },
  Be: { eq: '2Be + O₂ → 2BeO', note: '高温' },
  B:  { eq: '4B + 3O₂ → 2B₂O₃', note: '高温' },
  C:  { eq: 'C + O₂ → CO₂', note: '点燃 · 完全燃烧' },
  N:  { eq: 'N₂ + 3H₂ ⇌ 2NH₃', note: '高温高压 · 催化剂' },
  O:  { eq: '2H₂ + O₂ → 2H₂O', note: '点燃 · 放热' },
  F:  { eq: 'H₂ + F₂ → 2HF', note: '暗处即可爆炸' },
  Na: { eq: '2Na + 2H₂O → 2NaOH + H₂↑', note: '剧烈反应 · 放热' },
  Mg: { eq: '2Mg + O₂ → 2MgO', note: '点燃 · 耀眼白光' },
  Al: { eq: '4Al + 3O₂ → 2Al₂O₃', note: '表面致密氧化膜' },
  Si: { eq: 'SiO₂ + 2C → Si + 2CO↑', note: '高温还原' },
  P:  { eq: '4P + 5O₂ → 2P₂O₅', note: '点燃 · 白烟' },
  S:  { eq: 'S + O₂ → SO₂', note: '点燃 · 蓝紫色火焰' },
  Cl: { eq: 'H₂ + Cl₂ → 2HCl', note: '光照或点燃' },
  K:  { eq: '2K + 2H₂O → 2KOH + H₂↑', note: '比钠更剧烈' },
  Ca: { eq: 'CaO + H₂O → Ca(OH)₂', note: '放热 · 生成熟石灰' },
  Ti: { eq: 'Ti + 2Cl₂ → TiCl₄', note: '高温氯化' },
  Cr: { eq: '4Cr + 3O₂ → 2Cr₂O₃', note: '高温' },
  Mn: { eq: '2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑', note: '加热分解' },
  Fe: { eq: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂', note: '高炉炼铁 · 高温' },
  Co: { eq: 'Co + Cl₂ → CoCl₂', note: '加热' },
  Ni: { eq: '2Ni + O₂ → 2NiO', note: '高温' },
  Cu: { eq: 'Cu + 2H₂SO₄(浓) → CuSO₄ + SO₂↑ + 2H₂O', note: '加热 · 浓硫酸' },
  Zn: { eq: 'Zn + 2HCl → ZnCl₂ + H₂↑', note: '置换反应' },
  Ga: { eq: '4Ga + 3O₂ → 2Ga₂O₃', note: '高温' },
  Ge: { eq: 'GeO₂ + 2H₂ → Ge + 2H₂O', note: '高温还原' },
  As: { eq: '4As + 3O₂ → 2As₂O₃', note: '燃烧' },
  Se: { eq: 'Se + O₂ → SeO₂', note: '燃烧' },
  Br: { eq: 'H₂ + Br₂ → 2HBr', note: '加热 / 催化剂' },
  Ag: { eq: '2AgNO₃ → 2Ag + 2NO₂↑ + O₂↑', note: '光照分解' },
  Sn: { eq: 'Sn + 2Cl₂ → SnCl₄', note: '加热' },
  I:  { eq: 'Cl₂ + 2KI → 2KCl + I₂', note: '置换 · 淀粉变蓝' },
  Xe: { eq: 'Xe + F₂ → XeF₂', note: '光照 · 低温' },
  Ba: { eq: 'BaO + H₂O → Ba(OH)₂', note: '放热' },
  W:  { eq: 'WO₃ + 3H₂ → W + 3H₂O', note: '高温还原' },
  Pt: { eq: 'Pt + 2Cl₂ → PtCl₄', note: '加热' },
  Au: { eq: 'Au + HNO₃ + 4HCl → HAuCl₄ + NO↑ + 2H₂O', note: '王水溶解' },
  Hg: { eq: 'Hg + S → HgS', note: '常温 · 硫粉处理' },
  Pb: { eq: 'PbO + C → Pb + CO↑', note: '高温还原' },
  U:  { eq: '²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n', note: '核裂变 · 释放能量' },
  Pu: { eq: '²³⁹Pu + n → 裂变产物 + 能量', note: '核裂变' },
};
