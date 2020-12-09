import {bindMethods} from './bindMethods.js';

import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Triangle from './Triangle.js';

import Mesh from './Mesh.js';

const TICK_SPEED = 20;
// timescale ~ 0.2
const WORLD_SPEED = 80;


export default class Engine {
  constructor({ input, canvasEl }) {
    bindMethods(this);

    this.input = input;
    this.canvasEl = canvasEl;

    this.mesh = new Mesh();

    this.rotate = false;
    this.debug = false;
    this.ticks = 0;

    this.theta = 0;
    this.thetaX = 0;
    this.thetaY = 0;
    this.thetaZ = 0;

    this.distance = 4;

    this.camera = new Vec3D(0, 0, 0);
    this.light = new Vec3D(0, 0, -1).normalize();
  }

  openModel({resource, distance}) {
    this.resource = resource;
    this.distance = distance;

    return this.mesh.loadObject(resource);
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;

    this.currentTime = Date.now();
    setTimeout(this.tick, TICK_SPEED);
    this.render();
  }

  stop() {
    this.stopped = true;
  }

  tick() {
    if (this.stopped) {
      return;
    }

    this.ticks += 1;

    let now = Date.now();
    let elapsed = now - this.currentTime;
    let timeScale = elapsed / WORLD_SPEED;

    if (this.rotate) {
      this.thetaZ += timeScale * 8;
      this.thetaX += timeScale * 4;
    }

    this.handleKeys(timeScale);

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  handleKeys(dt) {
    let m = 0.1;
    if (this.input.keys.forward) {
      this.camera.z -= m * dt;
    }
    if (this.input.keys.backward) {
      this.camera.z += m * dt;
    }
    if (this.input.keys.left) {
      this.camera.x -= m * dt;
    }
    if (this.input.keys.right) {
      this.camera.x += m * dt;
    }

    let r = 3;
    if (this.input.keys.rotateXMinus) {
      this.thetaX -= r * dt;
    }
    if (this.input.keys.rotateXPlus) {
      this.thetaX += r * dt;
    }
    if (this.input.keys.rotateYMinus) {
      this.thetaY -= r * dt;
    }
    if (this.input.keys.rotateYPlus) {
      this.thetaY += r * dt;
    }
    if (this.input.keys.rotateZMinus) {
      this.thetaZ -= r * dt;
    }
    if (this.input.keys.rotateZPlus) {
      this.thetaZ += r * dt;
    }

  }

  render() {
    if (this.stopped) {
      return;
    }

    let startTs = new Date().getTime();
    let skipped = 0;

    let canvas = this.canvasEl;

    if (!this.ctx2D) {
      this.ctx2D = canvas.getContext("2d", { alpha: false });
    }

    let screenW = canvas.width;
    let screenH = canvas.height;

    let aspectRatio = screenH / screenW;
    let near = 0.1;
    let far = 1000;
    let fov = 90;

    let projection = Matrix4x4.projectionMatrix(aspectRatio, fov, near, far);
    let rotateX = Matrix4x4.rotationX(this.thetaX);
    let rotateY = Matrix4x4.rotationY(this.thetaY);
    let rotateZ = Matrix4x4.rotationZ(this.thetaZ);

//    let ctx = screen.getContext("2d");
    let ctx = this.ctx2D;

//    ctx.clearRect(0, 0, screenW, screenH);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.lineWidth = 0.1;
    ctx.strokeColor = '#ffffff';

    let drawList = [];

    for (let triangle of this.mesh.triangles) {
      let points = [];

      for (let p of triangle.points) {
        let p1 = p;
        p1 = rotateX.multiplyVec(p1);
        p1 = rotateY.multiplyVec(p1);
        p1 = rotateZ.multiplyVec(p1);

        p1.z += this.distance;

        points.push(p1);
      }

      let line1 = points[1].minus(points[0]);
      let line2 = points[2].minus(points[0]);
      let normal = line1.cross(line2).normalize();

      let dot = normal.dot(points[0].minus(this.camera));
      if (dot >= 0) {
        skipped += 1;
        continue;
      }

      let lightAmount = normal.dot(this.light);

      let projectedPoints = [];

      for (let p of points) {
        let projected = projection.multiplyVec(p);
        if (projected.w != 0) {
          projected.x /= projected.w;
          projected.y /= projected.w;
          projected.z /= projected.w;
        }

        projected = projected.add(1);

        projected.x *= 0.5 * screenW;
        projected.y *= 0.5 * screenH;

        projectedPoints.push(projected);
      }

      drawList.push([triangle, lightAmount, projectedPoints]);
    }


    drawList.sort((a, b) => {
      let ma = (a[2][0].z + a[2][1].z + a[2][2].z) / 3;
      let mb = (b[2][0].z + b[2][1].z + b[2][2].z) / 3;

      return ma > mb ? -1 : (mb == ma ? 0 : 1);
    });


    for (let pair of drawList) {
      let triangle = pair[0];
      let lightAmount = pair[1];
      let points = pair[2];

      ctx.beginPath();

      let first = true;
      for (let p of points) {
        if (first) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
        first = false;
      }
      ctx.closePath();

      ctx.fillStyle = `rgb(
        ${Math.floor(100 + 155 * lightAmount)},
        ${Math.floor(100 + 155 * lightAmount)},
        0)`;

      if (this.fill) {
        ctx.fill();
      }

      if (this.wireframe) {
        ctx.stroke();
      }
    }

    let diff = new Date().getTime() - startTs;

    if (this.debug) {
      console.log(`skip=${skipped}, ms=${diff}`);
    }

    requestAnimationFrame(this.render);
  }
}
