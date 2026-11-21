// The Quiet Gallery — keyboard and mouse input.
// WASD or arrows move, Shift sneaks, E picks up, R retries, Enter starts.
// A mouse click throws a coin to distract a guard. Clicking also unlocks
// the Web Audio context (browsers require a gesture for sound).

export class Input {
  constructor(canvas, onFirstGesture) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
    this.pressed = new Set();
    this.canvas = canvas;
    this.onFirstGesture = onFirstGesture;
    this.gestureDone = false;

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        event.preventDefault();
      }
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      this.noteGesture();
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    });
    canvas.addEventListener('mousedown', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.clickY = ((event.clientY - rect.top) / rect.height) * canvas.height;
      this.mouse.clicked = true;
      this.noteGesture();
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  noteGesture() {
    if (!this.gestureDone) {
      this.gestureDone = true;
      if (this.onFirstGesture) this.onFirstGesture();
    }
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.hypot(x, y);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  get sneaking() {
    return this.keys.has('shift');
  }

  wasPressed(key) {
    return this.pressed.has(key.toLowerCase());
  }

  consumeClick() {
    if (!this.mouse.clicked) return null;
    this.mouse.clicked = false;
    return { x: this.mouse.clickX, y: this.mouse.clickY };
  }

  endFrame() {
    this.pressed.clear();
  }
}
