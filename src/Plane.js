import Vec3D from './Vec3D.js';
import Triangle from './Triangle.js';
import Material from './Material.js';

export default class Plane {
  constructor(point, normal, debug) {
    this.point = point;
    this.normal = normal.normalize();
    this.d = this.normal.dot(this.point);
    this.debug = debug;
  }

  intersectLine(lineStart, lineEnd) {
    let ad = lineStart.dot(this.normal);
    let bd = lineEnd.dot(this.normal);
    let t = (this.d - ad) / (bd - ad);

    let lineStartToEnd = lineEnd.minus(lineStart);
    let lineToIntersect = lineStartToEnd.multiply(t);
    return lineStart.plus(lineToIntersect);
  }

  /**
   * https://www.cubic.org/docs/3dclip.htm
   * https://stackoverflow.com/questions/5666222/3d-line-plane-intersection
   */
  clip(tri, vertexes, textures) {
    let inside = [];
    let outside = [];

    tri.vertexIndexes.forEach(vi => {
      let p = vertexes[vi];
      let d = this.normal.dot(p) - this.d;
      if (d < 0) {
        outside.push(vi);
      } else {
        inside.push(vi);
      }
    });

    if (inside.length === 0) {
      return [];
    } else if (inside.length === 3) {
      return [tri];
    } else {
      if (inside.length == 1) {
        // 1 inside
        let material = tri.material;
        let lightAmount = tri.lightAmount;

        let t0 = tri.t0;
        let t1 = tri.t1;
        let t2 = tri.t2;

        let v0 = inside[0];
        let p0 = vertexes[v0];

        // but the two new points are at the locations where the
        // original sides of the triangle (lines) intersect with the plane
        let p1 = this.intersectLine(p0, vertexes[outside[0]]);
        let p2 = this.intersectLine(p0, vertexes[outside[1]]);

        vertexes.push(p1);
        let v1 = vertexes.length - 1;

        vertexes.push(p2);
        let v2 = vertexes.length - 1;

        if (this.debug) {
          material = new Material('clip_one', [0, 0, 140]);
        }
        let tri1 = new Triangle([v0, v1, v2], [t0, t1, t2], material, lightAmount);

        return [tri1];
      } else {
        // 2 inside
        let material = tri.material;
        let lightAmount = tri.lightAmount;

        let t0 = tri.t0;
        let t1 = tri.t1;
        let t2 = tri.t2;

        let v0 = inside[0];
        let v1 = inside[1];

        let p0 = vertexes[v0];
        let p1 = vertexes[v1];

        let p2 = this.intersectLine(p0, vertexes[outside[0]]);

        vertexes.push(p2);
        let v2 = vertexes.length - 1;

        if (this.debug) {
          material = new Material('clip_two_1', [0, 140, 0]);
        }
        let tri1 = new Triangle([v0, v1, v2], [t0, t1, t2], material, lightAmount);

        // The second triangle is composed of one of he inside points, a
        // new point determined by the intersection of the other side of the
        // triangle and the plane, and the newly created point above
        v0 = inside[1];
        p0 = vertexes[v0];

        v1 = v2;
        p1 = p2;

        p2 = this.intersectLine(vertexes[inside[1]], vertexes[outside[0]]);

        vertexes.push(p2);
        v2 = vertexes.length - 1;

        if (this.debug) {
          material = new Material('clip_two_2', [140, 0, 0]);
        }
        let tri2 = new Triangle([v0, v1, v2], [t0, t1, t2], material, lightAmount);

        return [tri1, tri2];
      }
    }
  }
}
