import Vec3D from './Vec3D.js';

export default class Triangle {
  constructor(points, material, lightAmount) {
    this.points = points;
    this.material = material;
    this.lightAmount = lightAmount;
  }

  calculateZ() {
    this.z = (this.points[0].z + this.points[1].z + this.points[2].z) / 3;
  }
}
