// The Quiet Gallery — everything the player sees, drawn on one canvas.
// The floor reads at a glance: dark parquet, a red carpet runner, lamp
// pools of warm light, shadow patches, pale vision cones, guards in
// maroon against the floor, the thief in teal, relics gold, exit green.

import { VIEW_WIDTH, VIEW_HEIGHT, VISION_RANGE, VISION_HALF_ANGLE } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFloor(ctx, level, time) {
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  // Parquet tiles.
  for (let ty = 0; ty < 15; ty += 1) {
    for (let tx = 0; tx < 24; tx += 1) {
      const odd = (tx + ty) % 2 === 0;
      ctx.fillStyle = odd ? '#2e2115' : '#2a1d13';
      ctx.fillRect(tx * 40, ty * 40, 40, 40);
    }
  }
  // Carpet runner down the middle.
  ctx.fillStyle = '#5a1f24';
  ctx.fillRect(0, 280, VIEW_WIDTH, 44);
  ctx.fillStyle = '#7a2a2e';
  ctx.fillRect(0, 288, VIEW_WIDTH, 4);
  ctx.fillRect(0, 316, VIEW_WIDTH, 4);
  // Shadow patches.
  for (const shadow of level.shadows) {
    ctx.fillStyle = 'rgba(6, 8, 18, 0.55)';
    ctx.fillRect(shadow.x, shadow.y, shadow.w, shadow.h);
  }
  // Walls.
  for (const wall of level.walls) {
    ctx.fillStyle = '#3d4457';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = '#5a6378';
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
  }
  // Low cover: display cases, crates, plants.
  for (const cover of level.lowCover) {
    if (cover.kind === 'case') {
      ctx.fillStyle = '#8a6d2f';
      ctx.fillRect(cover.x - 3, cover.y - 3, cover.w + 6, cover.h + 6);
      ctx.fillStyle = 'rgba(180, 220, 255, 0.28)';
      ctx.fillRect(cover.x, cover.y, cover.w, cover.h);
      ctx.fillStyle = '#d8b45a';
      ctx.fillRect(cover.x + cover.w / 2 - 4, cover.y + cover.h / 2 - 4, 8, 8);
    } else if (cover.kind === 'crates') {
      ctx.fillStyle = '#6b4a22';
      ctx.fillRect(cover.x, cover.y, cover.w, cover.h);
      ctx.strokeStyle = '#4a3013';
      ctx.lineWidth = 2;
      ctx.strokeRect(cover.x + 3, cover.y + 3, cover.w - 6, cover.h - 6);
      ctx.beginPath();
      ctx.moveTo(cover.x + 3, cover.y + 3);
      ctx.lineTo(cover.x + cover.w - 3, cover.y + cover.h - 3);
      ctx.moveTo(cover.x + cover.w - 3, cover.y + 3);
      ctx.lineTo(cover.x + 3, cover.y + cover.h - 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#2f5d33';
      ctx.beginPath();
      ctx.arc(cover.x + cover.w / 2, cover.y + cover.h / 2, cover.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f7d44';
      ctx.beginPath();
      ctx.arc(cover.x + cover.w / 2, cover.y + cover.h / 2, cover.w / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Lamp pools.
  for (const lamp of level.lamps) {
    const pulse = 0.10 + 0.02 * Math.sin(time * 2 + lamp.x);
    const grad = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, 120);
    grad.addColorStop(0, `rgba(255, 205, 110, ${pulse + 0.10})`);
    grad.addColorStop(1, 'rgba(255, 205, 110, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lamp.x - 120, lamp.y - 120, 240, 240);
    ctx.fillStyle = '#ffd97a';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Exit door.
  const exit = level.exit;
  ctx.fillStyle = '#1f7a44';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = '#d8ffe4';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
  if (exit.w < exit.h) ctx.rotate(-Math.PI / 2);
  ctx.fillText('EXIT', 0, 0);
  ctx.restore();
  // Relics.
  for (const relic of level.relics) {
    if (relic.taken) continue;
    const glow = 0.5 + 0.3 * Math.sin(time * 3 + relic.x);
    ctx.fillStyle = `rgba(255, 215, 90, ${glow})`;
    ctx.beginPath();
    ctx.arc(relic.x, relic.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd75a';
    ctx.save();
    ctx.translate(relic.x, relic.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(relic.x - 2, relic.y - 2, 4, 4);
  }
}

// Distance along a ray before it hits a wall (or maxDist). The cone is
// clipped by walls so it never shines through solid stone.
function rayWallDistance(ox, oy, dx, dy, walls, maxDist) {
  let best = maxDist;
  for (const rect of walls) {
    let tmin = 0;
    let tmax = best;
    let ok = true;
    if (Math.abs(dx) < 1e-9) {
      if (ox < rect.x || ox > rect.x + rect.w) ok = false;
    } else {
      let t1 = (rect.x - ox) / dx;
      let t2 = (rect.x + rect.w - ox) / dx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) ok = false;
    }
    if (ok) {
      if (Math.abs(dy) < 1e-9) {
        if (oy < rect.y || oy > rect.y + rect.h) ok = false;
      } else {
        let t1 = (rect.y - oy) / dy;
        let t2 = (rect.y + rect.h - oy) / dy;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) ok = false;
      }
    }
    if (ok && tmin < best) best = tmin;
  }
  return best;
}

export function drawVisionCone(ctx, guard, level, alarmOn) {
  const alerted = guard.state === 'chase' || alarmOn;
  const color = alerted ? 'rgba(255, 60, 50, 0.34)' : 'rgba(255, 220, 110, 0.26)';
  const steps = 26;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  for (let i = 0; i <= steps; i += 1) {
    const angle = guard.facing - VISION_HALF_ANGLE + (2 * VISION_HALF_ANGLE * i) / steps;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const dist = rayWallDistance(guard.x, guard.y, dx, dy, level.walls, VISION_RANGE);
    ctx.lineTo(guard.x + dx * dist, guard.y + dy * dist);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = alerted ? 'rgba(255, 80, 60, 0.5)' : 'rgba(255, 220, 110, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawGuard(ctx, guard, level, alarmOn) {
  drawVisionCone(ctx, guard, level, alarmOn);
  // Body.
  ctx.fillStyle = guard.state === 'chase' ? '#a11f1f' : '#7a2a2a';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8d8c8';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cap and facing tick.
  ctx.fillStyle = '#e8d8c8';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y - 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 17, guard.y + Math.sin(guard.facing) * 17);
  ctx.stroke();
  // Detection meter.
  if (guard.detection > 2) {
    const w = 30;
    const frac = guard.detection / 100;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(guard.x - w / 2, guard.y - 26, w, 6);
    ctx.fillStyle = frac > 0.66 ? '#ff453a' : frac > 0.33 ? '#ffb340' : '#ffd75a';
    ctx.fillRect(guard.x - w / 2, guard.y - 26, w * frac, 6);
    if (frac > 0.66) {
      ctx.fillStyle = '#ff453a';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 32);
    }
  }
}

export function drawPlayer(ctx, player) {
  if (player.sneaking) {
    ctx.strokeStyle = 'rgba(90, 220, 200, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#2fae9e';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8fff8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0d3f39';
  ctx.beginPath();
  ctx.arc(player.x, player.y - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Thrown coins.
  for (const coin of player.coinsInFlight) {
    ctx.fillStyle = '#ffd75a';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 90, 0.5)';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 8 + coin.t * 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawHud(ctx, game) {
  const level = game.level;
  const player = game.player;
  ctx.fillStyle = 'rgba(8, 10, 16, 0.72)';
  ctx.fillRect(0, 0, VIEW_WIDTH, 34);
  ctx.fillStyle = '#f0e8d8';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`THE QUIET GALLERY — ${level.name}`, 12, 17);
  ctx.textAlign = 'right';
  ctx.fillText(`Relics ${player.relicsTaken}/${level.relics.length}`, 560, 17);
  ctx.fillText(`Coins ${player.coins}`, 660, 17);
  ctx.fillText(`Time ${Math.floor(game.elapsed)}s`, 770, 17);
  ctx.fillText(`Level ${game.levelIndex + 1}/3`, 940, 17);
  // Alarm banner.
  if (game.alarm) {
    ctx.fillStyle = 'rgba(160, 20, 16, 0.85)';
    ctx.fillRect(330, 40, 300, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALARM — BREAK LINE OF SIGHT', 480, 53);
  }
  // Objective line.
  ctx.fillStyle = 'rgba(8, 10, 16, 0.6)';
  ctx.fillRect(0, VIEW_HEIGHT - 26, VIEW_WIDTH, 26);
  ctx.fillStyle = '#cfc4a8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  const objective = player.allRelicsTaken
    ? 'All relics taken — reach the green EXIT.'
    : `Take the relic${level.relics.length > 1 ? 's' : ''}, then reach the EXIT.`;
  ctx.fillText(`${objective}   WASD move · Shift sneak · Click throws a coin`, 480, VIEW_HEIGHT - 13);
}

export function drawScreen(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(6, 8, 14, 0.82)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW_WIDTH / 2, 190);
  ctx.fillStyle = '#f0e8d8';
  ctx.font = '17px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_WIDTH / 2, 260 + i * 30);
  });
}
