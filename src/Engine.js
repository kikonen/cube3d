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

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  render() {
    if (this.stopped) {
      return;
    }

    let canvas = this.canvasEl;
//    canvas.width = canvas.parentElement.clientWidth;
//    canvas.height = canvas.parentElement.clientHeight;

    let ctx = canvas.getContext("2d");
    let scale = 50;
    let offset = 200;

    let id = Matrix4x4.identifyMatrix();
    let v2 = id.multiplyVec(new Vec3D(1, 2, 3, 4));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.mesh.triangles.forEach((triangle) => {
      ctx.beginPath();

      let first = true;
      triangle.points.forEach((p) => {
        if (first) {
          ctx.moveTo(offset + p.x * scale, offset + p.y * scale);
        } else {
          ctx.lineTo(offset + p.x * scale, offset + p.y * scale);
        }
        first = false;
      });

//      ctx.lineTo(offset + triangle.points[0].x * scale, offset + triangle.points[0].y * scale);

      ctx.closePath();

      ctx.lineWidth = 2;
      ctx.strokeColor = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffff00';
      ctx.fill();
    });

    requestAnimationFrame(this.render);
  }
}
