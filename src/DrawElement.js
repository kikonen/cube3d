import Triangle from './Triangle.js';

export default class DrawElement {
  constructor({triangle, lightAmount}) {
    this.triangle = triangle;
    this.color = triangle.color;
    this.lightAmount = lightAmount;

    this.clippedTri = [];
    this.projectedTri = [];
//    this.projectedZ = [];
  }

  addProjected(projectedPoints, tri) {
    this.projectedTri.push(new Triangle(projectedPoints, tri.color));
    this.z = this.z || (projectedPoints[0].z + projectedPoints[1].z + projectedPoints[2].z) / 3;
//    this.projectedZ.push(z);
  }
}
