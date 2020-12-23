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
    this.aspectRatio = 1;

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


    // https://www.tutorialspoint.com/how-to-get-image-data-url-in-javascript
    const canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);
    this.buffer = new ArrayBuffer(imageData.data.length);
    this.buffer8 = new Uint8ClampedArray(this.buffer);
    this.buffer32 = new Uint32Array(this.buffer);
  }

  clear() {
    const white = (255 << 24) | (255 << 16) | (255 << 8) | 255;
    for (let i = 0; i < this.w * this.h; i++) {
      this.buf32[i] = white;
    }
  }

  plotLineLow(x0, y0, x1, y1, plot) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let yi = 1;
    if (dy < 0) {
      yi = -1;
      dy = -dy;
    }
    let D = (2 * dy) - dx;
    let y = y0;

    for (let x = x0; x < x1; x++) {
      plot(x, y);

      if (D > 0) {
        y = y + yi;
        D = D + (2 * (dy - dx));
      } else {
        D = D + 2 * dy;
      }
    }
  }

  plotLineHigh(x0, y0, x1, y1, plot) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let xi = 1;
    if (dx < 0) {
      xi = -1;
      dx = -dx;
    }
    let D = (2 * dx) - dy;
    let x = x0;

    for (let y = y0; y < y1; y++) {
      plot(x, y);

      if (D > 0) {
        x = x + xi;
        D = D + (2 * (dx - dy));
      } else {
        D = D + 2 * dx;
      }
    }
  }

  plotLine(x0, y0, x1, y1, plot) {
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
      if (x0 > x1) {
        this.plotLineLow(x1, y1, x0, y0, plot);
      } else {
        this.plotLineLow(x0, y0, x1, y1, plot);
      }
    } else {
      if (y0 > y1) {
        this.plotLineHigh(x1, y1, x0, y0, plot);
      } else {
        this.plotLineHigh(x0, y0, x1, y1, plot);
      }
    }
  }

  putPixel(x, y, color) {
    const c = (255 << 24) | 255;
    this.buffer32[(y * this.w) + x] = c;
  }

  display(ctx) {
    this.imageData.data.set(this.buffer8);
    ctx.putImageData(this.imageData, this.x, this.y);
  }
}
