import Vec3D from './Vec3D.js';
import Plane from './Plane.js';

export default class DrawElement {
  constructor({camera, rotateCamera, near, far}) {
    this.camera = camera;
    this.near = near;
    this.far = far;

    this.planes = [
      // front
      new Plane(new Vec3D(0, -1, near), new Vec3D(1, 0, near)),
      // left
      new Plane(new Vec3D(0, 0, 1), new Vec3D(0, -1, 0)),
      // right
      new Plane(new Vec3D(0, 0, 1), new Vec3D(0, -1, 0)),
      // top
      new Plane(new Vec3D(0, -1, 1), new Vec3D(1, -1, 0)),
      // bottom
      new Plane(new Vec3D(0, 0, 1), new Vec3D(1, 0, 0)),
      // back
      new Plane(new Vec3D(0, -1, far), new Vec3D(1, 0, far)),
    ];

    this.planes.forEach((plane) => {
//      plane.setupPlane(camera, rotateCamera);
    });
  }

  /**
   * https://www.cubic.org/docs/3dclip.htm
   * https://stackoverflow.com/questions/5666222/3d-line-plane-intersection
   *
   * @return 0, 1, 2, 3, 4 new draw elements
   */
  clip(el) {
    return [el];
    this.planes.forEach((plane) => {
      let pn = plane.normal;

      let intersections = el.points.map((p) => {
        let ln = p.normalize();
        let dist = p;

        if (pn.dot(ln) === 0) {
          return null;
        }

        let t = (pn.dot(plane.line1) - pn.dot(p)) / pn.dot(ln);
        return p.plus(ln.scale(t));
      });
      console.log(plane, intersections);
    });

    return [el];
  }
}
