export default class DrawElement {
  constructor({triangle, lightAmount, points}) {
    this.triangle = triangle;
    this.lightAmount = lightAmount;
    this.points = points;
  }

  setProjected(projectedPoints) {
    this.projectedPoints = projectedPoints;
    this.z = (projectedPoints[0].z + projectedPoints[1].z + projectedPoints[2].z) / 3;
  }
}
