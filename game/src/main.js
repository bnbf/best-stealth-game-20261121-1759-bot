// The Quiet Gallery — game loop, states and level flow.
// States: menu, playing, caught, levelclear, victory. The loop runs on
// requestAnimationFrame with a clamped delta so a tab switch cannot fling
// the thief across the room. window.GAME exposes the live state so a
// screenshot script can stage a scene without playing it by hand.

import { LEVELS, VIEW_WIDTH, VIEW_HEIGHT } from './config.js';
import { Input } from './input.js';
import { SoundEngine } from './audio.js';
import { Player } from './player.js';
import { Guard } from './guards.js';
import { drawFloor, drawGuard, drawPlayer, drawHud, drawScreen } from './render.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas, () => this.sound.unlock());
    this.sound = new SoundEngine();
    this.state = 'menu';
    this.levelIndex = 0;
    this.elapsed = 0;
    this.alarm = false;
    this.time = 0;
    this.totalTime = 0;
    this.caughtBy = null;
    this.loadLevel(0);
    this.lastTick = 0;
  }

  loadLevel(index) {
    this.levelIndex = index;
    const def = LEVELS[index];
    // Fresh copies: relics are marked taken as the player lifts them.
    this.level = {
      ...def,
      walls: def.walls.map((w) => ({ ...w })),
      lowCover: def.lowCover.map((c) => ({ ...c })),
      shadows: def.shadows.map((s) => ({ ...s })),
      lamps: def.lamps.map((l) => ({ ...l })),
      relics: def.relics.map((r) => ({ ...r, taken: false })),
    };
    this.player = new Player(def.playerStart);
    this.guards = def.guards.map((g) => new Guard(g));
    this.alarm = false;
    this.elapsed = 0;
  }

  start() {
    this.state = 'playing';
    this.totalTime = 0;
    this.loadLevel(0);
  }

  retryLevel() {
    this.loadLevel(this.levelIndex);
    this.state = 'playing';
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.elapsed += dt;
    this.totalTime += dt;
    this.player.update(dt, this.input, this.level, this.guards, this.sound);
    let alarmNow = false;
    for (const guard of this.guards) {
      alarmNow = guard.update(dt, this.player, this.level, this.sound, alarmNow);
    }
    if (alarmNow && !this.alarm) this.sound.alarm();
    this.alarm = alarmNow;
    for (const guard of this.guards) {
      if (guard.caughtPlayer(this.player)) {
        this.state = 'caught';
        this.caughtBy = guard;
        this.sound.caught();
        return;
      }
    }
    if (this.player.allRelicsTaken && this.player.atExit(this.level)) {
      if (this.levelIndex >= LEVELS.length - 1) {
        this.state = 'victory';
        this.sound.victory();
      } else {
        this.state = 'levelclear';
        this.sound.levelClear();
      }
    }
  }

  handleKeys() {
    if (this.state === 'menu' && (this.input.wasPressed('enter') || this.input.wasPressed(' '))) {
      this.start();
    } else if (this.state === 'caught' && this.input.wasPressed('r')) {
      this.retryLevel();
    } else if (this.state === 'levelclear' && this.input.wasPressed('enter')) {
      this.loadLevel(this.levelIndex + 1);
      this.state = 'playing';
    } else if (this.state === 'victory' && this.input.wasPressed('enter')) {
      this.start();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    if (this.state === 'menu') {
      drawFloor(ctx, this.level, this.time);
      for (const guard of this.guards) drawGuard(ctx, guard, this.level, false);
      drawPlayer(ctx, this.player);
      drawScreen(ctx, 'THE QUIET GALLERY', [
        'A museum at night. Three relics. Four guards who never blink.',
        'Move with WASD or arrows. Hold Shift to sneak behind low cover.',
        'Click to throw a coin and pull a guard away. Shadows slow detection.',
        'Lift every relic, then reach the green EXIT unseen.',
        '',
        'Press Enter to begin.',
      ], '#ffd75a');
      return;
    }
    drawFloor(ctx, this.level, this.time);
    for (const guard of this.guards) drawGuard(ctx, guard, this.level, this.alarm);
    drawPlayer(ctx, this.player);
    drawHud(ctx, this);
    if (this.state === 'caught') {
      drawScreen(ctx, 'CAUGHT!', [
        'A guard laid a hand on your shoulder.',
        `Level ${this.levelIndex + 1} — ${this.level.name}. The relics stay where they are.`,
        '',
        'Press R to try the level again.',
      ], '#ff453a');
    } else if (this.state === 'levelclear') {
      drawScreen(ctx, 'CLEAN GETAWAY', [
        `${this.level.name} cleared in ${Math.floor(this.elapsed)} seconds.`,
        'The next wing is darker, and the patrols are tighter.',
        '',
        'Press Enter for the next level.',
      ], '#7ddc8a');
    } else if (this.state === 'victory') {
      drawScreen(ctx, 'THE QUIET GALLERY', [
        'Every relic lifted. Every guard still walking its rounds,',
        'none of them ever knowing you were there.',
        `Total time: ${Math.floor(this.totalTime)} seconds.`,
        '',
        'Press Enter to play again.',
      ], '#ffd75a');
    }
  }

  frame(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTick) / 1000 || 0.016);
    this.lastTick = timestamp;
    this.time += dt;
    this.handleKeys();
    this.update(dt);
    this.render();
    this.input.endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }

  run() {
    requestAnimationFrame((t) => {
      this.lastTick = t;
      this.frame(t);
    });
  }
}

// Staging hook for screenshots and play-testing: a script can move the
// thief, place a guard's gaze, raise detection or jump to a state.
export function exposeForShots(game) {
  window.GAME = game;
  window.QG = {
    start: () => game.start(),
    setPlayer: (x, y, sneaking) => {
      game.player.x = x;
      game.player.y = y;
      game.player.sneaking = !!sneaking;
    },
    setGuard: (i, x, y, facing, detection) => {
      const guard = game.guards[i];
      if (!guard) return;
      guard.x = x;
      guard.y = y;
      guard.facing = facing;
      guard.detection = detection;
      guard.state = detection >= 100 ? 'chase' : 'patrol';
    },
    takeRelics: () => {
      for (const relic of game.level.relics) relic.taken = true;
      game.player.relicsTaken = game.level.relics.length;
    },
    loadLevel: (i) => {
      game.loadLevel(i);
      game.state = 'playing';
    },
    setTime: (seconds) => {
      game.totalTime = seconds;
    },
    setState: (state) => {
      game.state = state;
    },
    state: () => game.state,
  };
}
