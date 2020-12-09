import Vec3D from './Vec3D.js';

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

export default class Matrix4x4 {
  constructor(rows) {
    let data = [];
    data.push(...rows[0]);
    data.push(...rows[1]);
    data.push(...rows[2]);
    data.push(...rows[3]);
    this.data = data;
  }

  toString() {
    let d = this.data;
    return `[${d[C00]}, ${d[C01]}, ${d[C02]}, ${d[C03]}]\n[${d[C10]}, ${d[C11]}, ${d[C12]}, ${d[C13]}]\n[${d[C20]}, ${d[C21]}, ${d[C22]}, ${d[C23]}]\n[${d[C30]}, ${d[C31]}, ${d[C32]}, ${d[C33]}]`;
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

  // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix
  static projectionMatrix(aspectRatio, fov, near, far) {
    let f = 1 / Math.tan((fov / 2) / 180 * Math.PI);
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
    let theta = thetaD / 180 * Math.PI;

    return new Matrix4x4(
      [
        [Math.cos(theta), Math.sin(theta), 0, 0],
        [-Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationX(thetaD) {
    let theta = thetaD / 180 * Math.PI;

    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, Math.cos(theta), Math.sin(theta), 0],
        [0, -Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 0, 1],
      ]
    );
  }

  // https://en.wikipedia.org/wiki/Rotation_matrix
  static rotationY(thetaD) {
    let theta = thetaD / 180 * Math.PI;

    return new Matrix4x4(
      [
        [Math.cos(theta), 0, Math.sin(theta), 0],
        [0, 1, 0, 0],
        [-Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1],
      ]
    );
  }
}
