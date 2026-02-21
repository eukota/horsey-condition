# HORSEY CONDITION — Project Context

## What this is
A neon-aesthetic side-scrolling platformer game built for family play. Single HTML file + Node.js score server. No frameworks, no build step.

## File map
| File | Purpose |
|------|---------|
| `platformer.html` | Game engine — canvas, game loop, rendering, input, physics |
| `levels.js` | All level data + procedural generator. **Edit here to add levels.** |
| `server.js` | Minimal HTTP server — serves HTML + levels.js, GET/POST `/scores` |
| `scores.json` | Persistent score storage, keyed by settings (see below) |
| `Dockerfile` | node:20-alpine, port 2000 internal |
| `Makefile` | `make build`, `make run`, `make dev` (hot-reload via node --watch) |
| `package.json` | No deps — just `node server.js` |

## Running
```
make dev        # build + run with hot-reload on port 8080
make run        # production docker run on port 8080
node server.js  # local dev directly on port 2000
```

## Game architecture (platformer.html)

### Canvas / constants
- **Size**: 800×450
- **Physics**: GRAVITY=0.28, JUMP_VY=-9.2, SPEED=3.0
- **Rendering**: `ctx` (2d canvas), scrolling camera via `ctx.translate(-cameraX, 0)`

### Game phases
`lobby` → `play` → `win` | `dead` → `lobby`
Also: `settings` (overlay, accessible from lobby or play via ESC/TAB)

### Player
- Cyan `#00FFFF`, 20×26px, starts at x=80 y=340
- 5 HP, iframes=90 on hit (flickers every 8 ticks)
- Stomping enemies: player vy>1 and feet above enemy midpoint → kill enemy, bounce, +5pts
- Taking damage: knockback applied, HP--, if HP=0 → dead phase

### Scoring
- Coin collected: +10pts
- Enemy stomped: +5pts
- Win bonus: `player.hp * 5`
- Score submitted on win AND on death (with `finished: false`)

### Timer
- Starts on first keypress during play phase
- Displayed in gold `#FFD700` center HUD while active
- Saved as `finalTime` (ms) on win or death

### Levels
Two levels defined as JS objects with `id`, `name`, `platforms`, `coins`, `enemies`, `goal`:
- **LEVEL_1** "Level 1: Neon Run" — 11 platforms, 19 coins, 8 enemies, goal at x=2530
- **LEVEL_2** "Level 2: Neon Night" — 11 platforms, 18 coins, 6 enemies, goal at x=2600

Platform format: `[x, y, width, height, color]`
Enemy def: `{ platIdx, startX, speed }` — enemies patrol their assigned platform

### Settings
- `levelIdx` — which level to play (cycle through ALL_LEVELS)
- `enemyRespawn` — toggle enemy respawn after stomp

Settings key for score namespacing: `lvl:{id}|er:{0|1}` (e.g. `lvl:1|er:0`)

### Server / scores
- `GET /scores?key=...` → returns `{ highScores: [], fastTimes: [] }` for that key
- `POST /scores` body: `{ name, score, time, finished, settingsKey }`
- **High Scores**: sorted by score desc, then time asc (faster time wins tie)
- **Fast Times**: finished entries first, then time asc, score desc for tie
- Each list capped at 10 entries

### Visual style
- Background: `#05000F` (near-black purple)
- Grid overlay: purple `rgba(120,0,255,0.15)`
- Horizon glow: purple gradient at bottom
- Platform top edge: neon glow, body is color at 13% opacity
- Font: `"Courier New", monospace` throughout
- Neon palette: cyan `#00FFFF`, pink `#FF2D78`, green `#00FF99`, gold `#FFD700`, red `#FF3300`

### Controls
| Key | Action |
|-----|--------|
| A/D or ←/→ | Move |
| W/↑/Space | Jump |
| R | Restart (from win/dead → lobby) |
| ESC/TAB | Toggle settings |

## Known players (from scores.json)
EDWARD, DAD, DARRELL, BIRTH GIVER, DAR — family game context.

## Level switching (fixed)
- `currentLevel`, `COINS`, `GOAL` are all set fresh in `initPlay()` via `buildLevelData()`
- Settings `levelIdx` cycles through `[...ALL_LEVELS.map(l=>l.name), 'RANDOM']`
- RANDOM generates a procedural level each new game via `generateLevel()`
- `getSettingsKey()` derives level id from `settings.levelIdx`, not `currentLevel`

## Procedural generator (generateLevel)
- 1 ground platform + 8 random mid platforms + 1 wide final platform
- Platforms: w=100–210px, y clamped 190–360, gap 55–120px horizontal
- Coins: 1–3 per mid platform, 4 fixed on final
- Enemies: ~40% chance on mid platforms ≥130px wide, 1–2 on final
- Goal at finalX+270, pole top = finalY-150 (pole bottom = platform surface)
- Jump physics: SPEED=3, JUMP_VY=-9.2, GRAVITY=0.28 → max ~197px horizontal reach

## Adding a new level
Edit `levels.js` only — add a new `const LEVEL_N = { ... }` and append it to `ALL_LEVELS`. The engine picks it up automatically (settings cycle, score keys, etc). Do not touch `platformer.html` for level content.

## Known issues
- scores.json has legacy top-level `highScores`/`fastTimes` (pre-settings-key era) alongside `lvl:X|er:Y` keyed entries.
- No sound, no mobile/touch support.
- No deduplication of scores per player.
