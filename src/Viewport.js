import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Plane from './Plane.js';

export default class Viewport {
  constructor(x, y, w, h, debug) {
    x = x || 0;
    y = y|| 0;
    w = w || 0;
    h = h || 0;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.x2 = x + w;
    this.y2 = y + h;

    this.debug = debug;

    if (this.w > 0) {
      this.aspectRatio = this.h / this.w;
    } else {
      this.aspectRatio = 0;
    }

    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;

    this.offset = new Vec3D(1, 1);

    this.nearPlane = new Plane(new Vec3D(x, y, this.near), new Vec3D(0, 0, 1), this.debug);
    this.projection = Matrix4x4.projectionMatrix(this.aspectRatio, this.fov, this.near, this.far);

    this.planes = [
      // top
      new Plane(new Vec3D(x, y, 0), new Vec3D(0, 1, 0), this.debug),
      // bottom
      new Plane(new Vec3D(x, y + this.h - 1, 0), new Vec3D(0, -1, 0), this.debug),
      // left
      new Plane(new Vec3D(x, y, 0), new Vec3D(1, 0, 0), this.debug),
      // right
      new Plane(new Vec3D(x + w - 1, y, 0), new Vec3D(-1, 0, 0), this.debug),
    ];
  }
}
