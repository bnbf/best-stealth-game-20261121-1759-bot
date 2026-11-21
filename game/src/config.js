// The Quiet Gallery — level data and tuning constants.
// All coordinates are pixels on a 960 x 600 top-down floor plan.
// Walls block movement and sight. Low cover blocks a guard's sight only
// while the player is sneaking (crouched behind it). Shadow zones halve
// how fast a guard's detection meter fills while the player stands in one.

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 600;

export const PLAYER_SPEED = 150;
export const PLAYER_SNEAK_SPEED = 72;
export const PLAYER_RADIUS = 11;

export const GUARD_SPEED_PATROL = 62;
export const GUARD_SPEED_SUSPICIOUS = 88;
export const GUARD_SPEED_CHASE = 132;
export const GUARD_RADIUS = 13;
export const VISION_RANGE = 195;
export const VISION_HALF_ANGLE = 0.61; // radians, ~35 degrees each side
export const DETECT_FILL_PER_SECOND = 95;
export const DETECT_DRAIN_PER_SECOND = 42;
export const SHADOW_FILL_FACTOR = 0.5;
export const SNEAK_FILL_FACTOR = 0.6;
export const NOISE_WALK_RADIUS = 95;
export const NOISE_SNEAK_RADIUS = 28;
export const COIN_NOISE_RADIUS = 170;
export const MAX_COINS = 3;
export const CATCH_DISTANCE = 17;
export const ALARM_COOLDOWN_SECONDS = 5;

export const LEVELS = [
  {
    name: 'The Atrium',
    briefing: 'Lift the Sun Opal, then slip out the west door unseen.',
    playerStart: { x: 60, y: 60 },
    exit: { x: 0, y: 520, w: 60, h: 80 },
    relics: [{ x: 880, y: 80, name: 'Sun Opal' }],
    walls: [
      { x: 320, y: 120, w: 20, h: 240 },
      { x: 560, y: 200, w: 240, h: 20 },
      { x: 640, y: 380, w: 20, h: 220 },
    ],
    lowCover: [
      { x: 200, y: 400, w: 80, h: 40, kind: 'case' },
      { x: 480, y: 120, w: 80, h: 40, kind: 'crates' },
      { x: 760, y: 420, w: 40, h: 40, kind: 'plant' },
      { x: 420, y: 480, w: 80, h: 40, kind: 'case' },
    ],
    shadows: [
      { x: 100, y: 80, w: 200, h: 120 },
      { x: 700, y: 300, w: 160, h: 100 },
    ],
    lamps: [
      { x: 480, y: 300 },
      { x: 840, y: 140 },
      { x: 160, y: 520 },
    ],
    guards: [
      { waypoints: [{ x: 140, y: 140 }, { x: 500, y: 140 }, { x: 500, y: 300 }], pause: 1.2 },
      { waypoints: [{ x: 700, y: 500 }, { x: 700, y: 300 }, { x: 850, y: 300 }], pause: 0.9 },
    ],
  },
  {
    name: 'The East Wing',
    briefing: 'Two relics tonight: the Jade Fox and the Brass Moth.',
    playerStart: { x: 60, y: 60 },
    exit: { x: 900, y: 520, w: 60, h: 80 },
    relics: [
      { x: 880, y: 60, name: 'Jade Fox' },
      { x: 60, y: 540, name: 'Brass Moth' },
    ],
    walls: [
      { x: 300, y: 0, w: 20, h: 240 },
      { x: 300, y: 360, w: 20, h: 240 },
      { x: 520, y: 360, w: 240, h: 20 },
      { x: 620, y: 0, w: 20, h: 180 },
    ],
    lowCover: [
      { x: 180, y: 300, w: 80, h: 40, kind: 'case' },
      { x: 420, y: 120, w: 80, h: 40, kind: 'case' },
      { x: 720, y: 480, w: 80, h: 40, kind: 'crates' },
      { x: 860, y: 200, w: 40, h: 80, kind: 'crates' },
      { x: 520, y: 520, w: 40, h: 40, kind: 'plant' },
    ],
    shadows: [
      { x: 80, y: 420, w: 180, h: 120 },
      { x: 640, y: 80, w: 180, h: 100 },
    ],
    lamps: [
      { x: 240, y: 300 },
      { x: 480, y: 60 },
      { x: 840, y: 420 },
    ],
    guards: [
      { waypoints: [{ x: 120, y: 120 }, { x: 240, y: 120 }, { x: 240, y: 280 }], pause: 1.0 },
      { waypoints: [{ x: 400, y: 480 }, { x: 700, y: 480 }, { x: 700, y: 300 }], pause: 1.1 },
      { waypoints: [{ x: 820, y: 120 }, { x: 900, y: 120 }, { x: 900, y: 320 }], pause: 0.8 },
    ],
  },
  {
    name: 'The Vault',
    briefing: 'The Ember Crown and the Silver Key. Four guards. No mistakes.',
    playerStart: { x: 60, y: 540 },
    exit: { x: 0, y: 0, w: 60, h: 80 },
    relics: [
      { x: 900, y: 60, name: 'Ember Crown' },
      { x: 480, y: 540, name: 'Silver Key' },
    ],
    walls: [
      { x: 240, y: 120, w: 20, h: 360 },
      { x: 240, y: 120, w: 320, h: 20 },
      { x: 560, y: 140, w: 20, h: 280 },
      { x: 580, y: 420, w: 300, h: 20 },
    ],
    lowCover: [
      { x: 120, y: 300, w: 80, h: 40, kind: 'case' },
      { x: 360, y: 300, w: 80, h: 40, kind: 'case' },
      { x: 700, y: 200, w: 80, h: 40, kind: 'case' },
      { x: 840, y: 500, w: 80, h: 40, kind: 'crates' },
      { x: 440, y: 520, w: 40, h: 40, kind: 'plant' },
      { x: 700, y: 520, w: 80, h: 40, kind: 'case' },
    ],
    shadows: [
      { x: 300, y: 180, w: 160, h: 120 },
      { x: 620, y: 460, w: 200, h: 100 },
    ],
    lamps: [
      { x: 140, y: 120 },
      { x: 420, y: 60 },
      { x: 760, y: 320 },
      { x: 300, y: 520 },
    ],
    guards: [
      { waypoints: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 500 }], pause: 1.0 },
      { waypoints: [{ x: 320, y: 200 }, { x: 520, y: 200 }, { x: 520, y: 380 }], pause: 1.2 },
      { waypoints: [{ x: 660, y: 100 }, { x: 860, y: 100 }, { x: 860, y: 380 }], pause: 0.9 },
      { waypoints: [{ x: 640, y: 520 }, { x: 880, y: 520 }], pause: 1.4 },
    ],
  },
];
