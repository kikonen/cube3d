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

  intersectLine(lineStart, lineEnd, res) {
    let ad = lineStart.dot(this.normal);
    let bd = lineEnd.dot(this.normal);
    let t = (this.d - ad) / (bd - ad);

    let lineStartToEnd = lineEnd.minus(lineStart);
    let lineToIntersect = lineStartToEnd.multiply(t);
    res.t = t;
    return lineStart.plus(lineToIntersect);
  }

  /**
   * https://www.cubic.org/docs/3dclip.htm
   * https://stackoverflow.com/questions/5666222/3d-line-plane-intersection
   */
  clip(tri, vertexes, textures) {
    let inside = [];
    let outside = [];

    let insideTex = [];
    let outsideTex = [];

    for (let i = 0; i < 3; i ++) {
      let vi = tri.vertexIndexes[i];
      let ti = tri.textureIndexes[i];

      let p = vertexes[vi];
      let d = this.normal.dot(p) - this.d;
      if (d < 0) {
        outside.push(vi);
        outsideTex.push(ti);
      } else {
        inside.push(vi);
        insideTex.push(ti);
      }
    }

    if (inside.length === 0) {
      return [];
    } else if (inside.length === 3) {
      return [tri];
    } else {
      if (inside.length == 1) {
        // 1 inside
        let material = tri.material;
        let lightAmount = tri.lightAmount;

        let v0 = inside[0];
        let p0 = vertexes[v0];

        let t0 = insideTex[0];
        let tp0 = textures[t0];

        // but the two new points are at the locations where the
        // original sides of the triangle (lines) intersect with the plane
        let res = {};
        let tpa;
        let tpb;

        let p1 = this.intersectLine(p0, vertexes[outside[0]], res);

        tpa = tp0;
        tpb = textures[outsideTex[0]];
        let tp1 = tpa.plus(tpb.minus(tpa).multiply(res.t));

        let p2 = this.intersectLine(p0, vertexes[outside[1]], res);

        tpa = tp0;
        tpb = textures[outsideTex[1]];
        let tp2 = tpa.plus(tpb.minus(tpa).multiply(res.t));

        // store indexes
        vertexes.push(p1);
        let v1 = vertexes.length - 1;

        vertexes.push(p2);
        let v2 = vertexes.length - 1;

        textures.push(tp1);
        let t1 = textures.length - 1;

        textures.push(tp2);
        let t2 = textures.length - 1;

        // new tri
        if (this.debug) {
          material = new Material('clip_one', [0, 0, 140]);
        }
        let tri1 = new Triangle([v0, v1, v2], [t0, t1, t2], material, lightAmount);

        return [tri1];
      } else {
        // 2 inside
        let material = tri.material;
        let lightAmount = tri.lightAmount;

        let v0 = inside[0];
        let v1 = inside[1];

        let p0 = vertexes[v0];
        let p1 = vertexes[v1];

        let t0 = insideTex[0];
        let t1 = insideTex[1];

        let tp0 = textures[t0];
        let tp1 = textures[t1];

        let res = {};
        let tpa;
        let tpb;

        let p2 = this.intersectLine(p0, vertexes[outside[0]], res);

        tpa = tp0;
        tpb = textures[outsideTex[0]];
        let tp2 = tpa.plus(tpb.minus(tpa).multiply(res.t));

        vertexes.push(p2);
        let v2 = vertexes.length - 1;

        textures.push(tp2);
        let t2 = textures.length - 1;

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

        t0 = insideTex[1];
        tp0 = textures[t0];

        t1 = t2;
        tp1 = tp2;

        p2 = this.intersectLine(vertexes[inside[1]], vertexes[outside[0]], res);

        tpa = textures[insideTex[1]];
        tpb = textures[outsideTex[0]];
        tp2 = tpa.plus(tpa.minus(tpb).multiply(res.t));

        vertexes.push(p2);
        v2 = vertexes.length - 1;

        textures.push(tp2);
        t2 = vertexes.length - 1;

        if (this.debug) {
          material = new Material('clip_two_2', [140, 0, 0]);
        }
        let tri2 = new Triangle([v0, v1, v2], [t0, t1, t2], material, lightAmount);

        return [tri1, tri2];
      }
    }
  }
}
