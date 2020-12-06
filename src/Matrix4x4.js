import Vec3D from './Vec3D.js';

export default class Matrix4x4 {
  constructor(rows) {
    this.rows = rows;
  }

  toString() {
    let r = this.rows;
    return `[${r[0][0]}, ${r[0][1]}, ${r[0][2]}, ${r[0][3]}]\n[${r[1][0]}, ${r[1][1]}, ${r[1][2]}, ${r[1][3]}]\n[${r[2][0]}, ${r[2][1]}, ${r[2][2]}, ${r[2][3]}]\n[${r[3][0]}, ${r[3][1]}, ${r[3][2]}, ${r[3][3]}]`;
  }

  multiplyVec(v) {
    let r = this.rows;
    return new Vec3D(
      v.x * r[0][0] + v.y * r[1][0] + v.z * r[2][0]+ v.w * r[2][0],
      v.x * r[0][1] + v.y * r[1][1] + v.z * r[2][1]+ v.w * r[3][1],
      v.x * r[0][2] + v.y * r[1][2] + v.z * r[2][2]+ v.w * r[3][2],
      v.x * r[0][3] + v.y * r[1][3] + v.z * r[2][3]+ v.w * r[3][3],
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

  static rotationZ(theta) {
    return new Matrix4x4(
      [
        [Math.cos(theta), Math.sin(theta), 0, 0],
        [-Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
    );
  }

  static rotationX(theta) {
    return new Matrix4x4(
      [
        [1, 0, 0, 0],
        [0, Math.cos(theta/2), Math.sin(theta/2), 0],
        [0, -Math.sin(theta), Math.cos(theta/2), 0],
        [0, 0, 0, 1],
      ]
    );
  }
}
