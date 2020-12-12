export default class DrawElement {
  constructor({triangle, lightAmount, projectedPoints}) {
    this.triangle = triangle;
    this.lightAmount = lightAmount;
    this.projectedPoints = projectedPoints;

    this.z = (projectedPoints[0].z + projectedPoints[1].z + projectedPoints[2].z) / 3;
  }
}
