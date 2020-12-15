export default class DrawElement {
  constructor({triangle, lightAmount, viewPoints}) {
    this.triangle = triangle;
    this.color = triangle.color;
    this.lightAmount = lightAmount;
    this.viewPoints = viewPoints;

    this.clippedTri = [];
    this.projectedTri = [];
    this.projectedZ = [];
  }

  addProjected(projectedPoints) {
    this.projectedTri.push(projectedPoints);
    let z = (projectedPoints[0].z + projectedPoints[1].z + projectedPoints[2].z) / 3;
    this.projectedZ.push(z);
  }
}
