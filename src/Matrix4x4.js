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
    let data = [];
    for (let i = 0; i < 4; i++) {
      let row = rows[i];
      for (let j = 0; j < 4; j++) {
        data.push(row[j]);
      }
    };
    this.data = data;
    this.rows = rows;
  }

  toString() {
    let d = this.data;
    return `[${d[C00]}, ${d[C01]}, ${d[C02]}, ${d[C03]}]\n[${d[C10]}, ${d[C11]}, ${d[C12]}, ${d[C13]}]\n[${d[C20]}, ${d[C21]}, ${d[C22]}, ${d[C23]}]\n[${d[C30]}, ${d[C31]}, ${d[C32]}, ${d[C33]}]`;
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

    for (let i = 0; i < 4; i++) {
      let ra = rows_a[i];
      for (let j = 0; j < 4; j++) {
        res[i][j] = ra[0] * rb0[j] + ra[1] * rb1[j] + ra[2] * rb2[j] + ra[3] * rb3[j];
      }
    }
    return new Matrix4x4(res);
  }

  multiplyVec(v) {
    let d = this.data;
    return new Vec3D(
      v.x * d[C00] + v.y * d[C10] + v.z * d[C20]+ v.w * d[C20],
      v.x * d[C01] + v.y * d[C11] + v.z * d[C21]+ v.w * d[C31],
      v.x * d[C02] + v.y * d[C12] + v.z * d[C22]+ v.w * d[C32],
      v.x * d[C03] + v.y * d[C13] + v.z * d[C23]+ v.w * d[C33],
    );
  }

  static identifyMatrix() {
    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  static translationMatrix(x, y, z) {
    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1],
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
  static rotationZ(thetaD) {
    let theta = thetaD * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [cos(theta), sin(theta), 0, 0],
        [-sin(theta), cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationX(thetaD) {
    let theta = thetaD * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, cos(theta), sin(theta), 0],
        [0, -sin(theta), cos(theta), 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationY(thetaD) {
    let theta = thetaD * TO_RAD_MUL;

    return new Matrix4x4(
      [
        [cos(theta), 0, sin(theta), 0],
        [0, 1, 0, 0],
        [-sin(theta), 0, cos(theta), 0],
        [0, 0, 0, 1],
      ]
    );
  }
}
