import Vec3D from './Vec3D.js';

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const C00 = 0 * 4 + 0;
const C01 = 0 * 4 + 1;
const C02 = 0 * 4 + 2;
const C03 = 0 * 4 + 3;
const C10 = 1 * 4 + 0;
const C11 = 1 * 4 + 1;
const C12 = 1 * 4 + 2;
const C13 = 1 * 4 + 3;
const C20 = 2 * 4 + 0;
const C21 = 2 * 4 + 1;
const C22 = 2 * 4 + 2;
const C23 = 2 * 4 + 3;
const C30 = 3 * 4 + 0;
const C31 = 3 * 4 + 1;
const C32 = 3 * 4 + 2;
const C33 = 3 * 4 + 3;

const TO_RAD_MUL = 1 / 180 * Math.PI;


export default class Matrix4x4 {
  constructor(rows) {
    this.rows = rows;
    this.c00 = rows[0][0];
    this.c01 = rows[0][1];
    this.c02 = rows[0][2];
    this.c03 = rows[0][3];
    this.c10 = rows[1][0];
    this.c11 = rows[1][1];
    this.c12 = rows[1][2];
    this.c13 = rows[1][3];
    this.c20 = rows[2][0];
    this.c21 = rows[2][1];
    this.c22 = rows[2][2];
    this.c23 = rows[2][3];
    this.c30 = rows[3][0];
    this.c31 = rows[3][1];
    this.c32 = rows[3][2];
    this.c33 = rows[3][3];
  }

  toString() {
    return `[${this.c00}, ${this.c01}, ${this.c02}, ${this.c03}\n[${this.c10}, ${this.c11}, ${this.c12}, ${this.c13}\n[${this.c20}, ${this.c21}, ${this.c22}, ${this.c23}\n[${this.c30}, ${this.c31}, ${this.c32}, ${this.c33}`;
  }

  multiply(b) {
    let rows_a = this.rows;
    let rows_b = b.rows;

    let rb0 = rows_b[0];
    let rb1 = rows_b[1];
    let rb2 = rows_b[2];
    let rb3 = rows_b[3];

    let res = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];

    for (let r = 0; r < 4; r++) {
      let ra = rows_a[r];
      for (let c = 0; c < 4; c++) {
        res[r][c] = ra[0] * rb0[c] + ra[1] * rb1[c] + ra[2] * rb2[c] + ra[3] * rb3[c];
      }
    }

    return new Matrix4x4(res);
  }

  multiplyVec(v) {
    let x = v.x;
    let y = v.y;
    let z = v.z;
    let w = v.w;
    return new Vec3D(
      x * this.c00 + y * this.c10 + z * this.c20 + w * this.c30,
      x * this.c01 + y * this.c11 + z * this.c21 + w * this.c31,
      x * this.c02 + y * this.c12 + z * this.c22 + w * this.c32,
      x * this.c03 + y * this.c13 + z * this.c23 + w * this.c33,
    );
  }

  static identityMatrix() {
    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  static scaleMatrix(scale) {
    return new Matrix4x4(
      [
        [scale, 0, 0, 0],
        [0, scale, 0, 0],
        [0, 0, scale, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  static translationMatrix(p) {
    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [p.x, p.y, p.z, 1],
      ]
    );
  }

  static pointAtMatrix(pos, target, up0) {
    let forward = target.minus(pos).normalize();

    let a = forward.multiply(up0.dot(forward));
    let up = up0.minus(a).normalize();

    let right = up.cross(forward);

    return new Matrix4x4(
      [
        [right.x, right.y, right.z, 0],
        [up.x, up.y, up.z, 0],
        [forward.x, forward.y, forward.z, 0],
        [pos.x, pos.y, pos.z, 1],
      ]
    );
  }

  static quickInverseMatrix(m) {
    let r = m.rows;

    return new Matrix4x4(
      [
        [r[0][0], r[1][0], r[2][0], 0],
        [r[0][1], r[1][1], r[2][1], 0],
        [r[0][2], r[1][2], r[2][2], 0],
        [
          -(r[3][0] * r[0][0] + r[3][1] * r[1][0] + r[3][2] * r[2][0]),
          -(r[3][0] * r[0][1] + r[3][1] * r[1][1] + r[3][2] * r[2][1]),
          -(r[3][0] * r[0][2] + r[3][1] * r[1][2] + r[3][2] * r[2][2]),
          1,
        ],
      ]
    );
  }

  static lookAtMatrix(a, b, c, t) {
    return new Matrix4x4(
      [
        [a.x, b.x, c.x, 0],
        [a.y, b.y, c.y, 0],
        [a.z, b.z, c.z, 0],
        [t.dot(a), t.dot(b), t.dot(c), 1],
      ]
    );
  }

  // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix
  static projectionMatrix(aspectRatio, fov, near, far) {
    let f = 1 / tan((fov / 2) * TO_RAD_MUL);
    let q = far / (far - near);

    return new Matrix4x4(
      [
        [aspectRatio * f, 0, 0,         0],
        [0,               f, 0,         0],
        [0,               0, q,         1],
        [0,               0, -near * q, 0],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationX(angle) {
    let rad = angle * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, cos(rad), sin(rad), 0],
        [0, -sin(rad), cos(rad), 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationY(angle) {
    let rad = angle * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [cos(rad), 0, -sin(rad), 0],
        [0, 1, 0, 0],
        [sin(rad), 0, cos(rad), 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationZ(angle) {
    let rad = angle * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [cos(rad), sin(rad), 0, 0],
        [-sin(rad), cos(rad), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }
}
