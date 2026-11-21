// The Quiet Gallery — guard patrols, vision cones and the alarm.
// A guard walks its waypoints and pauses at each one. When the player is
// inside its vision cone with a clear line of sight, its detection meter
// fills; full means the alarm, and every guard chases. Breaking sight
// drains the meter, and the alarm cools down after a few unseen seconds.
// A noise (footsteps, a thrown coin) makes a nearby guard investigate.

import {
  GUARD_SPEED_PATROL,
  GUARD_SPEED_SUSPICIOUS,
  GUARD_SPEED_CHASE,
  GUARD_RADIUS,
  VISION_RANGE,
  VISION_HALF_ANGLE,
  DETECT_FILL_PER_SECOND,
  DETECT_DRAIN_PER_SECOND,
  SHADOW_FILL_FACTOR,
  SNEAK_FILL_FACTOR,
  CATCH_DISTANCE,
  ALARM_COOLDOWN_SECONDS,
} from './config.js';
import { hasLineOfSight, moveCircle, pointInShadow } from './world.js';

export class Guard {
  constructor(def) {
    this.waypoints = def.waypoints;
    this.pauseSeconds = def.pause || 1;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.waypointIndex = 1 % def.waypoints.length;
    this.pauseTimer = 0;
    this.facing = 0;
    this.state = 'patrol'; // patrol | suspicious | chase | investigate
    this.detection = 0;
    this.lastSeen = null;
    this.investigateTarget = null;
    this.unseenTimer = 0;
    this.huhPlayed = false;
  }

  canSee(player, level) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > VISION_RANGE) return false;
    const angle = Math.atan2(dy, dx);
    let diff = angle - this.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > VISION_HALF_ANGLE) return false;
    return hasLineOfSight(this.x, this.y, player.x, player.y, level, player.sneaking);
  }

  fillRate(player, level) {
    let rate = DETECT_FILL_PER_SECOND;
    if (pointInShadow(player.x, player.y, level)) rate *= SHADOW_FILL_FACTOR;
    if (player.sneaking) rate *= SNEAK_FILL_FACTOR;
    return rate;
  }

  update(dt, player, level, sound, alarmOn) {
    const sees = this.canSee(player, level);
    if (sees) {
      this.detection += this.fillRate(player, level) * dt;
      this.lastSeen = { x: player.x, y: player.y };
      this.unseenTimer = 0;
      if (this.detection >= 50 && !this.huhPlayed) {
        this.huhPlayed = true;
        sound.guardHuh();
      }
    } else {
      this.detection = Math.max(0, this.detection - DETECT_DRAIN_PER_SECOND * dt);
      this.unseenTimer += dt;
      if (this.detection < 50) this.huhPlayed = false;
    }
    if (this.detection >= 100) this.detection = 100;

    if (this.state !== 'chase' && this.detection >= 100) {
      this.state = 'chase';
    }
    if (this.state === 'chase' && this.unseenTimer > ALARM_COOLDOWN_SECONDS) {
      this.state = 'suspicious';
      this.detection = 30;
      this.investigateTarget = this.lastSeen;
    }
    if (this.state === 'suspicious' && this.investigateTarget) {
      const arrived = this.walkTo(this.investigateTarget, GUARD_SPEED_SUSPICIOUS, dt, level);
      if (arrived) {
        this.investigateTarget = null;
        this.state = 'patrol';
        this.detection = 0;
      }
    }
    if (this.state === 'investigate' && this.investigateTarget) {
      const arrived = this.walkTo(this.investigateTarget, GUARD_SPEED_SUSPICIOUS, dt, level);
      if (arrived) {
        this.pauseTimer = 1.6;
        this.investigateTarget = null;
        this.state = 'patrol';
      }
    }
    if (this.state === 'chase' && this.lastSeen) {
      this.walkTo(this.lastSeen, GUARD_SPEED_CHASE, dt, level);
    }
    if (this.state === 'patrol') {
      if (this.pauseTimer > 0) {
        this.pauseTimer -= dt;
      } else {
        const target = this.waypoints[this.waypointIndex];
        const arrived = this.walkTo(target, GUARD_SPEED_PATROL, dt, level);
        if (arrived) {
          this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
          this.pauseTimer = this.pauseSeconds;
        }
      }
    }
    return alarmOn || this.state === 'chase';
  }

  walkTo(target, speed, dt, level) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return true;
    this.facing = Math.atan2(dy, dx);
    const step = Math.min(dist, speed * dt);
    moveCircle(this, (dx / dist) * step, (dy / dist) * step, level, GUARD_RADIUS);
    return dist - step < 4;
  }

  hearNoise(point, radius) {
    if (this.state === 'chase') return;
    const dist = Math.hypot(point.x - this.x, point.y - this.y);
    if (dist > radius) return;
    this.state = 'investigate';
    this.investigateTarget = { x: point.x, y: point.y };
  }

  caughtPlayer(player) {
    return Math.hypot(player.x - this.x, player.y - this.y) < CATCH_DISTANCE;
  }
}
