// The Quiet Gallery — the thief: movement, sneaking, noise and coins.
// Walking is fast but loud; sneaking is slow, quiet and harder to spot.
// A thrown coin clinks where it lands and pulls a nearby guard over to
// look. Relics are lifted by walking over them; the exit only opens once
// every relic of the level is in hand.

import {
  PLAYER_SPEED,
  PLAYER_SNEAK_SPEED,
  PLAYER_RADIUS,
  NOISE_WALK_RADIUS,
  NOISE_SNEAK_RADIUS,
  COIN_NOISE_RADIUS,
  MAX_COINS,
} from './config.js';
import { moveCircle, pointInRect } from './world.js';

export class Player {
  constructor(start) {
    this.x = start.x;
    this.y = start.y;
    this.sneaking = false;
    this.moving = false;
    this.coins = MAX_COINS;
    this.relicsTaken = 0;
    this.coinsInFlight = [];
  }

  update(dt, input, level, guards, sound) {
    this.levelRelicCount = level.relics.length;
    const axis = input.axis();
    this.sneaking = input.sneaking;
    this.moving = axis.x !== 0 || axis.y !== 0;
    const speed = this.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_SPEED;
    if (this.moving) {
      moveCircle(this, axis.x * speed * dt, axis.y * speed * dt, level, PLAYER_RADIUS);
      sound.footstep(this.sneaking, !this.sneaking);
      const noiseRadius = this.sneaking ? NOISE_SNEAK_RADIUS : NOISE_WALK_RADIUS;
      for (const guard of guards) {
        if (guard.state !== 'chase') {
          guard.hearNoise({ x: this.x, y: this.y }, noiseRadius * 0.6);
        }
      }
    }

    const click = input.consumeClick();
    if (click && this.coins > 0) {
      this.coins -= 1;
      this.coinsInFlight.push({ x: click.x, y: click.y, t: 0 });
      sound.coinClink();
      for (const guard of guards) {
        guard.hearNoise({ x: click.x, y: click.y }, COIN_NOISE_RADIUS);
      }
    }
    for (const coin of this.coinsInFlight) coin.t += dt;
    this.coinsInFlight = this.coinsInFlight.filter((coin) => coin.t < 1.2);

    for (const relic of level.relics) {
      if (!relic.taken && Math.hypot(relic.x - this.x, relic.y - this.y) < 26) {
        relic.taken = true;
        this.relicsTaken += 1;
        sound.pickup();
      }
    }
  }

  get relicsDone() {
    return this.relicsTaken;
  }

  get allRelicsTaken() {
    return this.relicsTaken >= this.levelRelicCount;
  }

  atExit(level) {
    return pointInRect(this.x, this.y, level.exit);
  }
}
