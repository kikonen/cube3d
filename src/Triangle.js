import Vec3D from './Vec3D.js';

export default class Triangle {
  constructor(vertexIndexes, textureIndexes, material, lightAmount) {
    this.vertexIndexes = vertexIndexes;

    this.v0 = vertexIndexes[0];
    this.v1 = vertexIndexes[1];
    this.v2 = vertexIndexes[2];

    textureIndexes = textureIndexes || [0, 0, 0];
    this.textureIndexes = textureIndexes;
    this.t0 = textureIndexes[0];
    this.t1 = textureIndexes[1];
    this.t2 = textureIndexes[2];

    this.material = material;
    this.lightAmount = lightAmount;
  }

  calculateZ(vertexes) {
    let p0 = vertexes[this.vertexIndexes[0]];
    let p1 = vertexes[this.vertexIndexes[1]];
    let p2 = vertexes[this.vertexIndexes[2]];
    this.z = (p0.z + p1.z + p2.z) / 3;
  }
}
