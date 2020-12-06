export default class Vec3D {
  constructor(x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 1;
  }

  toString() {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
  }

  isEmpty() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  isPresent() {
    return this.x !== 0 || this.y !== 0 || this.z !== 0;
  }

  isInfinity() {
    return this.magnitude() == Infinity;
  }

  magnitude() {
    if (this.x === 0 && this.y === 0 && this.z === 0) {
      return 0;
    }
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normal() {
    let magnitude = this.magnitude();
    return new Vec3D(this.x /= magnitude, this.y /= magnitude, this.z /= magnitude, this.w);
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

  signZ() {
    if (this.z === 0) {
      return 0;
    }
    return this.z < 0 ? -1 : 1;
  }

  reverse() {
    return new Vec3D(-this.x, -this.y, -this.z, this.w);
  }

  reset(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  resetZ(z) {
    this.z = z;
    return this;
  }

  resetW(w) {
    this.w = w;
    return this;
  }

  plus(b) {
    return new Vec3D(this.x + b.x, this.y + b.y, this.z + b.z, this.w);
  }

  minus(b) {
    return new Vec3D(this.x - b.x, this.y - b.y, this.z - b.z, this.w);
  }

  add(scalar) {
    return new Vec3D(this.x + scalar, this.y + scalar, this.z + scalar, this.w);
  }

  addZ(scalar) {
    return new Vec3D(this.x, this.y, this.z + scalar, this.w);
  }

  multiply(scalar) {
    return new Vec3D(this.x * scalar, this.y * scalar, this.z * scalar, this.w);
  }

  multiplyX(scalar) {
    return new Vec3D(this.x * scalar, this.y, this.z, this.w);
  }

  multiplyY(scalar) {
    return new Vec3D(this.x, this.y * scalar, this.z, this.w);
  }

  multiplyZ(scalar) {
    return new Vec3D(this.x, this.y, this.z * scalar, this.w);
  }

  changeX(x) {
    return new Vec3D(x, this.y, this.z, this.w);
  }

  changeY(y) {
    return new Vec3D(this.x, y, this.z, this.w);
  }

  changeZ(z) {
    return new Vec3D(this.x, this.y, z, this.w);
  }

  divide(scalar) {
    return new Vec3D(this.x / scalar, this.y / scalar, this.z / scalar, this.w);
  }

  dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  }

  cross(b) {
    return;
  }
}
