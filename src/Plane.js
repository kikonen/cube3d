import Vec3D from './Vec3D.js';

export default class Plane {
  constructor(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;
  }

  setupPlane(camera, matrix) {
    this.line1 = matrix.multiplyVec(this.line1.plus(camera));
    this.line2 = matrix.multiplyVec(this.line2.plus(camera));
    this.normal = this.line1.cross(this.line2).normalize();
  }
}
