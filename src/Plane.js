import Vec3D from './Vec3D.js';

export default class Plane {
  constructor(point, normal, debug) {
    this.point = point;
    this.normal = normal.normalize();
    this.distance = this.normal.dot(this.point);
    this.debug = debug;
  }

  intersectLine(lineStart, lineEnd) {
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
    } else {
      if (inside.length == 1) {
        // 1 inside

        let points = [];

        let p0 = inside[0];

        // but the two new points are at the locations where the
        // original sides of the triangle (lines) intersect with the plane
        let p1 =  this.intersectLine(p0, outside[0]);
        let p2 = this.intersectLine(p0, outside[1]);

        el.clippedTri.push([p0, p1, p2]);
        if (this.debug) {
          el.color = [0, 0, 140];
        }
      } else {
        // 2 inside

        let p0 = inside[0];
	let p1 = inside[1];
	let p2 = this.intersectLine(p0, outside[0]);

        el.clippedTri.push([p0, p1, p2]);

	// The second triangle is composed of one of he inside points, a
	// new point determined by the intersection of the other side of the
	// triangle and the plane, and the newly created point above
	p0 = inside[1];
	p1 = p2;
	p2 = this.intersectLine(inside[1], outside[0]);

        el.clippedTri.push([p0, p1, p2]);

        if (this.debug) {
          el.color = [0, 140, 0];
        }
      }
    }
  }
}
