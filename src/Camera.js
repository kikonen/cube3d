import Vec3D from './Vec3D.js';

export default class Camera {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
  }
}
