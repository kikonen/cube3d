import Vec3D from './Vec3D.js';

export default class Plane {
  constructor(point, normal) {
    this.point = point;
    this.normal = normal.normalize();
    this.distance = this.normal.dot(this.point);
  }

  intersectLine(p, lineStart, lineEnd) {
    let ad = lineStart.dot(this.normal);
    let bd = lineEnd.dot(this.normal);
    let t = (this.distance - ad) / (bd - ad);

    let lineStartToEnd = lineEnd.minus(lineStart);
    let lineToIntersect = lineStartToEnd.multiply(t);
    return lineStart.plus(lineToIntersect);
  }

  /**
   * https://www.cubic.org/docs/3dclip.htm
   * https://stackoverflow.com/questions/5666222/3d-line-plane-intersection
   */
  clip(el) {
    let inside = [];
    let outside = [];

    let points = el.viewPoints;
    let distances = points.forEach(p => {
      let d = this.normal.dot(p) - this.distance;
      if (d < 0) {
        outside.push(p);
      } else {
        inside.push(p);
      }
    });

    if (inside.length === 0) {
      // all out
    } else if (inside.length === 3) {
      el.clippedTri.push(points);
//      el.color = [0, 0, 100];
    } else {
      if (inside.length == 1) {
        // 1 inside
      } else {
        // 2 inside
      }
    }
  }
}
