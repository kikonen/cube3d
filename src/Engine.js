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
      this.thetaZ += timeScale * 1;
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

    let canvas = this.canvasEl;

    let screenW = canvas.width;
    let screenH = canvas.height;

    let aspectRatio = screenH / screenW;
    let near = 0.1;
    let far = 1000;
    let fov = 90;

    let projection = Matrix4x4.projectionMatrix(aspectRatio, fov, near, far);
    let rotateZ = Matrix4x4.rotationZ(this.thetaZ);
    let rotateX = Matrix4x4.rotationX(this.thetaX);

    let ctx = canvas.getContext("2d");

//    ctx.clearRect(0, 0, screenW, screenH);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    let idx = 0;
    for (let triangle of this.mesh.triangles) {
      ctx.beginPath();

      let first = true;
      for (let p of triangle.points) {
        let p1 = rotateZ.multiplyVec(p);
        p1 = rotateX.multiplyVec(p1);
        p1.z += 10;

        let projected = projection.multiplyVec(p1);
        if (projected.w != 0) {
          projected.x /= projected.w;
          projected.y /= projected.w;
          projected.z /= projected.w;
        }

        projected = projected.add(1);

        projected.x *= 0.5 * screenW;
        projected.y *= 0.5 * screenH;

        if (first) {
          ctx.moveTo(projected.x, projected.y);
        } else {
          ctx.lineTo(projected.x, projected.y);
        }
        first = false;
      }

      ctx.closePath();

      ctx.lineWidth = 2;
      ctx.strokeColor = '#ffffff';
      ctx.stroke();

//      ctx.fillStyle = '#ffff00';
//      ctx.fill();
      idx += 1;
    }

    let endTs = new Date().getTime();

//    console.log(endTs - startTs);

    requestAnimationFrame(this.render);
  }
}
