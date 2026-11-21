# The Quiet Gallery — a stealth game

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/bnbf/best-stealth-game-20261121-1759-bot/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/bnbf/best-stealth-game-20261121-1759-bot/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

A top-down stealth game for [make.fun](https://make.fun)'s best stealth game bounty. You are Wren, a thief in a museum at night: lift every relic, then reach the green EXIT unseen.

## How to play

- **Move:** WASD or arrow keys
- **Sneak:** hold Shift — slower and quieter, harder to spot, and low cover (display cases, crates, plants) blocks a guard's sight while you crouch behind it
- **Throw a coin:** click anywhere — a nearby guard walks over to look
- **Shadows:** standing in a dark patch halves how fast a guard's detection meter fills
- **Detection:** a guard's meter fills while you are in its vision cone with a clear line of sight; full means the alarm, and every guard chases. Break sight to cool down.
- **Goal:** lift every relic, then reach the green EXIT. Three levels: The Atrium, The East Wing, The Vault.

## Run it

Serve `game/` with any static server and open `index.html` in desktop Chrome. No network requests, no build step, no assets — all art is drawn on canvas and all sound is synthesized with Web Audio.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html` — page shell
- `game/src/config.js` — tuning and the three levels
- `game/src/world.js` — collision, line of sight, shadows
- `game/src/guards.js` — patrols, vision cones, detection, alarm
- `game/src/player.js` — movement, sneaking, coins, relics
- `game/src/audio.js` — synthesized sound
- `game/src/input.js` — keyboard and mouse
- `game/src/render.js` — canvas drawing
- `game/src/main.js` — game loop and states
- `vendor/makefun-game.ts` — make.fun's dossier library, unchanged from the kit
