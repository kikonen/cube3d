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
  }

  openModel(model) {
    return this.mesh.loadObject(model);
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;

    this.theta = 0;
    this.thetaZ = 0;
    this.thetaX = 0;

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

    timeScale = 0.2;
//    console.log(timeScale, elapsed);

    if (this.rotate) {
      this.thetaZ += timeScale * 8;
      this.thetaX += timeScale * 4;
    }

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
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

    let camera = new Vec3D(0, 0, 0);
    let light = new Vec3D(0, 0, -1).normalize();

    let screenW = canvas.width;
    let screenH = canvas.height;

    let aspectRatio = screenH / screenW;
    let near = 0.1;
    let far = 1000;
    let fov = 90;

    let projection = Matrix4x4.projectionMatrix(aspectRatio, fov, near, far);
    let rotateZ = Matrix4x4.rotationZ(this.thetaZ);
    let rotateX = Matrix4x4.rotationX(this.thetaX);

//    let ctx = screen.getContext("2d");
    let ctx = this.ctx2D;

//    ctx.clearRect(0, 0, screenW, screenH);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.lineWidth = 1;
    ctx.strokeColor = '#ffffff';

    let drawList = [];

    for (let triangle of this.mesh.triangles) {
      let points = [];

      for (let p of triangle.points) {
        let p1 = rotateZ.multiplyVec(p);
        p1 = rotateX.multiplyVec(p1);
        p1.z += 5;

        points.push(p1);
      }

      let line1 = points[1].minus(points[0]);
      let line2 = points[2].minus(points[0]);
      let normal = line1.cross(line2).normalize();

      let dot = normal.dot(points[0].minus(camera));
      if (dot >= 0) {
        skipped += 1;
        continue;
      }

      let lightAmount = normal.dot(light);

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
      let ma = a[2][0].z;
      let mb = b[2][0].z;

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

      ctx.fill();

//      ctx.stroke();
    }

    let diff = new Date().getTime() - startTs;

    console.log(`skip=${skipped}, ms=${diff}`);

    requestAnimationFrame(this.render);
  }
}
