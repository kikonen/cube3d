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
      v.x * r[0][0] + v.y * r[0][1] + v.z * r[0][2]+ v.w * r[0][3],
      v.x * r[1][0] + v.y * r[1][1] + v.z * r[1][2]+ v.w * r[1][3],
      v.x * r[2][0] + v.y * r[2][1] + v.z * r[2][2]+ v.w * r[2][3],
      v.x * r[3][0] + v.y * r[3][1] + v.z * r[3][2]+ v.w * r[3][3],
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
}
