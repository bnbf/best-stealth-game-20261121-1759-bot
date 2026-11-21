// The Quiet Gallery — the level's geometry: collision, sight lines, shadows.
// Walls block movement and sight. Low cover blocks a guard's sight only
// while the player is sneaking. Everything is plain rectangles, so the
// line-of-sight test is a segment-vs-rectangle slab test.

import { VIEW_WIDTH, VIEW_HEIGHT } from './config.js';

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (dx === 0) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let t1 = (rect.x - x1) / dx;
    let t2 = (rect.x + rect.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (dy === 0) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let t1 = (rect.y - y1) / dy;
    let t2 = (rect.y + rect.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

export function hasLineOfSight(x1, y1, x2, y2, level, playerSneaking) {
  for (const wall of level.walls) {
    if (segmentHitsRect(x1, y1, x2, y2, wall)) return false;
  }
  if (playerSneaking) {
    for (const cover of level.lowCover) {
      if (segmentHitsRect(x1, y1, x2, y2, cover)) return false;
    }
  }
  return true;
}

export function pointInShadow(x, y, level) {
  for (const shadow of level.shadows) {
    if (pointInRect(x, y, shadow)) return true;
  }
  return false;
}

function circleHitsRect(cx, cy, radius, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}

// Move a circle with axis-separated sliding: try x, then y, so a body
// slides along a wall instead of sticking to it.
export function moveCircle(body, dx, dy, level, radius) {
  let nx = body.x + dx;
  if (!hitsAny(nx, body.y, radius, level)) {
    body.x = nx;
  }
  let ny = body.y + dy;
  if (!hitsAny(body.x, ny, radius, level)) {
    body.y = ny;
  }
  body.x = Math.max(radius, Math.min(VIEW_WIDTH - radius, body.x));
  body.y = Math.max(radius, Math.min(VIEW_HEIGHT - radius, body.y));
}

function hitsAny(x, y, radius, level) {
  for (const wall of level.walls) {
    if (circleHitsRect(x, y, radius, wall)) return true;
  }
  for (const cover of level.lowCover) {
    if (circleHitsRect(x, y, radius, cover)) return true;
  }
  return false;
}
