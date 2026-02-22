# Horsey Condition

A neon side-scrolling platformer built by a family, for a family.

Play it live at **[eukota.com/horsey/](https://eukota.com/horsey/)**

---

## What it is

Horsey Condition is a browser-based platformer featuring a unicorn horse navigating seven hand-crafted neon levels. Collect coins, stomp enemies, and race for the best time. There's also a secret exit hidden in Level 6 that leads to a bonus world — if you can find it.

The leaderboard tracks scores and times for every level and for full runs. Family competition is fierce.

---

## How to run locally

**Requirements:** Docker + Make (or Node.js 20+ with PHP 8.2)

```bash
make dev        # builds Docker image and runs on http://localhost:8080
```

Or without Docker:
```bash
# Requires PHP 8.2+ with SQLite support
php -S localhost:2000 scores.php   # not quite right — see server note below
node server.js                     # not used; backend is scores.php
```

The easiest path is `make dev`. Hot-reload is enabled — edit files and refresh.

---

## Controls

| Key | Action |
|-----|--------|
| A / ← | Move left |
| D / → | Move right |
| W / ↑ / Space | Jump |
| R | Restart (from win or death screen) |
| ESC / TAB | Open/close settings |

Mobile: on-screen joystick and jump button appear automatically on touch devices.

---

## Gameplay

- You have **5 HP**. Touching an enemy costs 1 HP; losing all HP ends the run.
- **Stomp** enemies by jumping on them (land on their top half) — +5 points and a bounce.
- **Coins** are worth 10 points each.
- Reach the **goal pole** to finish the level. Bonus points for remaining HP.
- Your **time** starts on first input and stops at the goal.

### Scoring

| Event | Points |
|-------|--------|
| Coin collected | +10 |
| Enemy stomped | +5 |
| Level complete (per HP remaining) | +5 each |

Scores are submitted on both wins and deaths. The leaderboard tracks **high scores** (score desc, then time asc) and **fast times** (finished runs first, then time asc).

---

## Levels

| # | Name | Theme |
|---|------|-------|
| 1 | Neon Run | Classic intro — learn the basics |
| 2 | Neon Night | Longer run, more enemies |
| 3 | Vertical Ascent | Rising staircase, use the vertical camera |
| 4 | Neon Labyrinth | Sharp altitude swings, zigzag routing |
| 5 | Kinetic Highway | Dense enemies, fast pace |
| 6 | The Glass Edge | Fast enemies, narrow platforms — and a secret |
| 7 | The Rainbow Bridge | Gold platforms, secret world bonus level |

### Full run

Starting from **Level 1** plays all levels consecutively. Your score and time accumulate across all levels and are submitted as a single full-run entry when you finish Level 6 (or Level 7 via the secret exit).

### The secret exit

Level 6 has two goal poles. The normal pole ends your run. A **green pole** further into the level sends you to Level 7: The Rainbow Bridge instead. Find it for glory (and a separate secret-run leaderboard).

---

## Leaderboard

The lobby shows a leaderboard for whichever level is selected in settings:

- **Level 1 selected** → Full Run leaderboard
- **Level 7 selected** → Secret Run leaderboard
- **Any other level** → Per-level leaderboard

Each leaderboard shows top 10 by high score and top 10 by fastest time (completed runs only for fast times).

---

## Settings

Open with ESC or TAB during the lobby or mid-game.

| Setting | Description |
|---------|-------------|
| Level | Which level to play (or start a full run from Level 1) |
| Enemy Respawn | Enemies respawn after being stomped |
| High Quality FX | Richer visual effects |
| Rainbow Trail | Player leaves a rainbow trail |
| Unicorn Horn | Renders the unicorn horn on the player |

---

## Tech stack

- **Frontend**: Vanilla JS, HTML5 Canvas — single `index.html`, no build step, no frameworks
- **Backend**: PHP 8.2 (`scores.php`) — SQLite locally, MySQL on DreamHost
- **Levels**: `levels.js` — plain JS objects, loaded by the game engine
- **Deployment**: GitHub Actions → DreamHost via SFTP on push to `main`

---

## Design process

This game was designed and built as a family project. Level concepts, enemy placement, and gameplay tuning came from the kids (Edward). Code and infrastructure by Dad (Darrell), with AI assistance from Claude Code and Gemini 3 Flash within Antigravity for level design and iterative refinement.

The neon aesthetic — cyan `#00FFFF`, pink `#FF2D78`, green `#00FF99` on a near-black purple background — was chosen to look good on a TV in a dark room.

---

## License

See the [LICENSE](LICENSE) file for details.
