// ── level definitions ─────────────────────────────────────
// Platform format: [x, y, width, height, color]
// Coins: array of x positions (engine finds the platform above each)
// Enemies: { platIdx, startX, speed }
// Goal: { x, y, poleH }  — pole top = y, pole bottom = y + poleH (should touch platform surface)
// secretGoal: optional second goal pole for Level 6 secret exit

const LEVEL_1 = {
  id: 1,
  name: 'Level 1: Neon Run',
  platforms: [
    [0,    390, 420, 60,  '#00FFFF'],
    [470,  370, 180, 20,  '#FF2D78'],
    [700,  330, 130, 20,  '#00FFFF'],
    [890,  285, 120, 20,  '#FF2D78'],
    [1070, 330, 200, 20,  '#00FF99'],
    [1330, 290, 110, 20,  '#FF2D78'],
    [1500, 245, 130, 20,  '#00FFFF'],
    [1690, 300, 170, 20,  '#00FF99'],
    [1920, 250, 110, 20,  '#FF2D78'],
    [2090, 210, 140, 20,  '#00FFFF'],
    [2290, 260, 320, 130, '#00FF99'],
  ],
  coins:   [490, 520, 720, 760, 910, 950, 1100, 1140, 1350, 1520, 1560, 1710, 1750, 1940, 2110, 2150, 2310, 2350, 2390],
  enemies: [
    { platIdx: 0,  startX: 200,  speed: 1.4 },
    { platIdx: 0,  startX: 340,  speed: 1.8 },
    { platIdx: 1,  startX: 510,  speed: 2.0 },
    { platIdx: 4,  startX: 1110, speed: 1.9 },
    { platIdx: 6,  startX: 1530, speed: 2.2 },
    { platIdx: 7,  startX: 1730, speed: 1.7 },
    { platIdx: 10, startX: 2350, speed: 1.6 },
    { platIdx: 10, startX: 2460, speed: 2.1 },
  ],
  goal: { x: 2530, y: 110, poleH: 150 },
};

const LEVEL_2 = {
  id: 2,
  name: 'Level 2: Neon Night',
  platforms: [
    [0,    390, 300, 60,  '#FF2D78'],
    [380,  350, 150, 20,  '#00FFFF'],
    [600,  310, 180, 20,  '#00FF99'],
    [850,  270, 140, 20,  '#FF2D78'],
    [1050, 320, 160, 20,  '#00FFFF'],
    [1280, 280, 120, 20,  '#00FF99'],
    [1470, 240, 150, 20,  '#FF2D78'],
    [1700, 200, 130, 20,  '#00FFFF'],
    [1900, 250, 180, 20,  '#00FF99'],
    [2150, 220, 140, 20,  '#FF2D78'],
    [2350, 270, 350, 150, '#00FFFF'],
  ],
  coins:   [400, 450, 620, 680, 870, 910, 1080, 1120, 1310, 1500, 1550, 1720, 1920, 1960, 2180, 2380, 2420, 2460],
  enemies: [
    { platIdx: 0,  startX: 100,  speed: 1.6 },
    { platIdx: 2,  startX: 630,  speed: 2.2 },
    { platIdx: 4,  startX: 1080, speed: 2.0 },
    { platIdx: 6,  startX: 1500, speed: 2.5 },
    { platIdx: 8,  startX: 1930, speed: 1.9 },
    { platIdx: 10, startX: 2400, speed: 2.3 },
  ],
  goal: { x: 2600, y: 120, poleH: 150 },
};

// ── stub levels — Flash will replace these with full designs ──

const LEVEL_3 = {
  id: 3,
  name: 'Level 3: The Climb',
  platforms: [
    [0,    390, 400, 60,  '#00FFFF'],
    [480,  350, 130, 20,  '#FF2D78'],
    [680,  310, 130, 20,  '#00FF99'],
    [880,  270, 130, 20,  '#FF2D78'],
    [1060, 230, 300, 130, '#00FFFF'],
  ],
  coins:   [540, 740, 940],
  enemies: [
    { platIdx: 1, startX: 520,  speed: 1.8 },
    { platIdx: 4, startX: 1120, speed: 1.9 },
  ],
  goal: { x: 1290, y: 80, poleH: 150 },
};

const LEVEL_4 = {
  id: 4,
  name: 'Level 4: Zigzag',
  platforms: [
    [0,    390, 400, 60,  '#FF2D78'],
    [480,  300, 120, 20,  '#00FFFF'],
    [680,  370, 120, 20,  '#00FF99'],
    [870,  290, 120, 20,  '#FF2D78'],
    [1060, 360, 300, 130, '#00FFFF'],
  ],
  coins:   [540, 730, 920],
  enemies: [
    { platIdx: 2, startX: 720,  speed: 2.0 },
    { platIdx: 4, startX: 1120, speed: 2.0 },
  ],
  goal: { x: 1290, y: 210, poleH: 150 },
};

const LEVEL_5 = {
  id: 5,
  name: 'Level 5: Rush Hour',
  platforms: [
    [0,    390, 380, 60,  '#00FF99'],
    [460,  330, 120, 20,  '#FF2D78'],
    [650,  300, 110, 20,  '#00FFFF'],
    [840,  340, 110, 20,  '#00FF99'],
    [1020, 290, 300, 130, '#FF2D78'],
  ],
  coins:   [520, 700, 890],
  enemies: [
    { platIdx: 1, startX: 500,  speed: 2.2 },
    { platIdx: 3, startX: 880,  speed: 2.1 },
    { platIdx: 4, startX: 1080, speed: 2.0 },
  ],
  goal: { x: 1250, y: 140, poleH: 150 },
};

const LEVEL_6 = {
  id: 6,
  name: 'Level 6: Knife Edge',
  platforms: [
    [0,    390, 380, 60,  '#00FFFF'],
    [460,  320, 100, 20,  '#FF2D78'],
    [640,  290, 100, 20,  '#00FF99'],
    [820,  260, 300, 130, '#00FFFF'],
  ],
  coins:   [520, 700],
  enemies: [
    { platIdx: 3, startX: 880, speed: 2.5 },
  ],
  goal:       { x: 1050, y: 110, poleH: 150 },
  secretGoal: { x: 1200, y: 110, poleH: 150 },
};

const LEVEL_7 = {
  id: 7,
  name: 'Level 7: Secret World',
  platforms: [
    [0,   390, 380, 60,  '#FFD700'],
    [460, 320, 110, 20,  '#FFD700'],
    [650, 270, 110, 20,  '#FFD700'],
    [840, 230, 300, 130, '#FFD700'],
  ],
  coins:   [520, 710],
  enemies: [
    { platIdx: 3, startX: 900, speed: 2.5 },
  ],
  goal: { x: 1070, y: 80, poleH: 150 },
};

const ALL_LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7];
