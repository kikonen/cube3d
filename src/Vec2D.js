export default class Vec2D {
  constructor(x, y, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
  }

  toString() {
    return `[${this.x}, ${this.y}, ${this.w}]`;
  }

  isEmpty() {
    return this.x === 0 && this.y === 0;
  }

  isPresent() {
    return this.x !== 0 || this.y !== 0;
  }

  isInfinity() {
    return this.magnitude() == Infinity;
  }

  magnitude() {
    if (this.x === 0 && this.y === 0) {
      return 0;
    }
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    let magnitude = this.magnitude();
    return new Vec2D(this.x /= magnitude, this.y /= magnitude, this.w);
  }

  signX() {
    if (this.x === 0) {
      return 0;
    }
    return this.x < 0 ? -1 : 1;
  }

  signY() {
    if (this.y === 0) {
      return 0;
    }
    return this.y < 0 ? -1 : 1;
  }

  reverse() {
    return new Vec2D(-this.x, -this.y, this.w);
  }

  reset(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    return this;
  }

  resetX(x) {
    this.x = x;
    return this;
  }

  resetY(y) {
    this.y = y;
    return this;
  }

  resetW(w) {
    this.w = w;
    return this;
  }

  plus(b) {
    return new Vec2D(this.x + b.x, this.y + b.y, this.w);
  }

  minus(b) {
    return new Vec2D(this.x - b.x, this.y - b.y, this.w);
  }

  multiply(scalar) {
    return new Vec2D(this.x * scalar, this.y * scalar, this.w);
  }

  multiplyX(scalar) {
    return new Vec2D(this.x * scalar, this.y, this.w);
  }

  multiplyY(scalar) {
    return new Vec2D(this.x, this.y * scalar, this.w);
  }

  changeX(x) {
    return new Vec2D(x, this.y, this.w);
  }

  changeY(y) {
    return new Vec2D(this.x, y, this.w);
  }

  divide(scalar) {
    return new Vec2D(this.x / scalar, this.y / scalar, this.w);
  }

  dot(b) {
    return this.x * b.x + this.y * b.y;
  }

  cross(b) {
    return;
  }
}
