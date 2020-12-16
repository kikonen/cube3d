import Vec3D from './Vec3D.js';

export default class Triangle {
  constructor(points, color, lightAmount) {
    this.points = points;
    this.color = color;
    this.lightAmount = lightAmount;
  }

  calculateZ() {
    this.z = (this.points[0].z + this.points[1].z + this.points[2].z) / 3;
  }
}
