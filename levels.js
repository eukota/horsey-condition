// ── level definitions ─────────────────────────────────────
// All levels stored as compact encoding strings and decoded at startup.
// Platform format: [x, y, width, height, color]
// Coins: array of x positions (engine finds the platform above each)
// Enemies: { platIdx, startX, speed }
// Goal: { x, y, poleH }  — pole bottom = y + poleH (should touch platform surface)

// ── encoding ──────────────────────────────────────────────
// 1 grid unit = 40px. Color codes: cy=#00FFFF  pk=#FF2D78  gr=#00FF99
// Tokens (concatenated, no separator):
//   (p,x1,y1,x2,y2,h,col)  — platform in grid units (flat: y1===y2)
//   (c,off1,off2,...)       — coin x-offsets in px from platform left edge
//   (e,off,spd)             — enemy at px offset from platform left, speed spd
//   (g,x,y)                 — goal position in grid units (poleH always 150)
const GRID = 40;
const COLOR_ENC = { '#00FFFF': 'cy', '#FF2D78': 'pk', '#00FF99': 'gr' };
const COLOR_DEC = { cy: '#00FFFF', pk: '#FF2D78', gr: '#00FF99' };

function encodeLevel(level) {
  const r2 = n => +n.toFixed(2);
  let out = '';
  for (let pi = 0; pi < level.platforms.length; pi++) {
    const [px, py, pw, ph, color] = level.platforms[pi];
    const x1 = r2(px / GRID), y1 = r2(py / GRID), x2 = r2((px + pw) / GRID), h = r2(ph / GRID);
    const col = COLOR_ENC[color] || 'cy';
    out += `(p,${x1},${y1},${x2},${y1},${h},${col})`;
    const plCoins = level.coins.filter(cx => cx >= px && cx < px + pw);
    if (plCoins.length > 0) out += `(c,${plCoins.map(cx => Math.round(cx - px)).join(',')})`;
    for (const e of level.enemies.filter(e => e.platIdx === pi)) {
      out += `(e,${Math.round(e.startX - px)},${e.speed})`;
    }
  }
  out += `(g,${r2(level.goal.x / GRID)},${r2(level.goal.y / GRID)})`;
  return out;
}

function decodeLevel(str, name, id = 'rnd') {
  const platforms = [], coins = [], enemies = [];
  const token = /\((\w+),([\d.,\w-]+)\)/g;
  let m, curPlatIdx = -1, goalX = null, goalY = null;
  while ((m = token.exec(str)) !== null) {
    const type = m[1], args = m[2].split(',');
    if (type === 'p') {
      const px = Math.round(+args[0] * GRID), py = Math.round(+args[1] * GRID);
      const pw = Math.round((+args[2] - +args[0]) * GRID), ph = Math.round(+args[4] * GRID);
      platforms.push([px, py, pw, ph, COLOR_DEC[args[5]] || '#00FFFF']);
      curPlatIdx++;
    } else if (type === 'c') {
      const [px] = platforms[curPlatIdx];
      for (const off of args) coins.push(px + +off);
    } else if (type === 'e') {
      const [px] = platforms[curPlatIdx];
      enemies.push({ platIdx: curPlatIdx, startX: px + +args[0], speed: +args[1] });
    } else if (type === 'g') {
      goalX = Math.round(+args[0] * GRID);
      goalY = Math.round(+args[1] * GRID);
    }
  }
  const last = platforms[platforms.length - 1];
  const gx = goalX !== null ? goalX : last[0] + 270;
  const gy = goalY !== null ? goalY : last[1] - 150;
  return { id, name, platforms, coins, enemies, goal: { x: gx, y: gy, poleH: 150 }, encoding: str };
}

// ── level encodings ───────────────────────────────────────
// Edit these strings to modify levels. Add a new const + entry in ALL_LEVELS to add a level.
// Verification: decodeLevel(ENC_LEVEL_1, 'TEST', 1) in browser console.

const ENC_LEVEL_1 =
  '(p,0,9.75,10.5,9.75,1.5,cy)(e,200,1.4)(e,340,1.8)' +
  '(p,11.75,9.25,16.25,9.25,0.5,pk)(c,20,50)(e,40,2)' +
  '(p,17.5,8.25,20.75,8.25,0.5,cy)(c,20,60)' +
  '(p,22.25,7.13,25.25,7.13,0.5,pk)(c,20,60)' +
  '(p,26.75,8.25,31.75,8.25,0.5,gr)(c,30,70)(e,40,1.9)' +
  '(p,33.25,7.25,36,7.25,0.5,pk)(c,20)' +
  '(p,37.5,6.13,40.75,6.13,0.5,cy)(c,20,60)(e,30,2.2)' +
  '(p,42.25,7.5,46.5,7.5,0.5,gr)(c,20,60)(e,40,1.7)' +
  '(p,48,6.25,50.75,6.25,0.5,pk)(c,20)' +
  '(p,52.25,5.25,55.75,5.25,0.5,cy)(c,20,60)' +
  '(p,57.25,6.5,65.25,6.5,3.25,gr)(c,20,60,100)(e,60,1.6)(e,170,2.1)' +
  '(g,63.25,2.75)';

const ENC_LEVEL_2 =
  '(p,0,9.75,7.5,9.75,1.5,pk)(e,100,1.6)' +
  '(p,9.5,8.75,13.25,8.75,0.5,cy)(c,20,70)' +
  '(p,15,7.75,19.5,7.75,0.5,gr)(c,20,80)(e,30,2.2)' +
  '(p,21.25,6.75,24.75,6.75,0.5,pk)(c,20,60)' +
  '(p,26.25,8,30.25,8,0.5,cy)(c,30,70)(e,30,2)' +
  '(p,32,7,35,7,0.5,gr)(c,30)' +
  '(p,36.75,6,40.5,6,0.5,pk)(c,30,80)(e,30,2.5)' +
  '(p,42.5,5,45.75,5,0.5,cy)(c,20)' +
  '(p,47.5,6.25,52,6.25,0.5,gr)(c,20,60)(e,30,1.9)' +
  '(p,53.75,5.5,57.25,5.5,0.5,pk)(c,30)' +
  '(p,58.75,6.75,67.5,6.75,3.75,cy)(c,30,70,110)(e,50,2.3)' +
  '(g,65,3)';

const LEVEL_1 = decodeLevel(ENC_LEVEL_1, 'Level 1: Neon Run', 1);
const LEVEL_2 = decodeLevel(ENC_LEVEL_2, 'Level 2: Neon Night', 2);

// ── add new levels here — engine picks them up automatically ──
const ALL_LEVELS = [LEVEL_1, LEVEL_2];

// ── procedural generator ──────────────────────────────────
function generateLevel() {
  const PAL = ['#00FFFF', '#FF2D78', '#00FF99'];
  const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
  const rndI = (lo, hi) => Math.floor(rnd(lo, hi + 1));
  const platforms = [], coins = [], enemies = [];

  platforms.push([0, 390, 380, 60, PAL[0]]);

  const NUM_MID = 8;
  let x = 440, y = 355;
  for (let i = 0; i < NUM_MID; i++) {
    const w = rndI(100, 210);
    y = Math.max(190, Math.min(360, y + rndI(-75, 50)));
    platforms.push([x, y, w, 20, PAL[i % PAL.length]]);
    const n = rndI(1, 3);
    const step = Math.floor(w / (n + 1));
    for (let c = 1; c <= n; c++) coins.push(x + step * c);
    if (w >= 130 && Math.random() < 0.4)
      enemies.push({ platIdx: i + 1, startX: x + rndI(20, 60), speed: +rnd(1.5, 2.5).toFixed(1) });
    x += w + rndI(55, 120);
  }

  const finalX = x, finalY = Math.max(200, y + rndI(-50, 30));
  platforms.push([finalX, finalY, 320, 130, PAL[0]]);
  [70, 130, 190, 250].forEach(cx => coins.push(finalX + cx));
  enemies.push({ platIdx: NUM_MID + 1, startX: finalX + 60, speed: +rnd(1.6, 2.2).toFixed(1) });
  if (Math.random() < 0.5)
    enemies.push({ platIdx: NUM_MID + 1, startX: finalX + 200, speed: +rnd(1.8, 2.4).toFixed(1) });

  const level = { id: 'random', name: 'RANDOM', platforms, coins, enemies,
                  goal: { x: finalX + 270, y: finalY - 150, poleH: 150 } };
  level.encoding = encodeLevel(level);
  return level;
}
