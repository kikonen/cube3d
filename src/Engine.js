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

    this.objects = [];

    this.rotate = false;
    this.debug = false;
    this.ticks = 0;

    this.camera = new Vec3D(0, 0, 0);
    this.cameraAngleX = 0;
    this.cameraAngleY = 0;
    this.cameraAngleZ = 0;

    this.light = new Vec3D(0, 0, -1).normalize();
  }

  openModel({resource, pos}) {
    return new Mesh().loadObject(resource).then((mesh) => {
      mesh.pos = pos;
      this.objects.push(mesh);
    });
  }

  resetFrames() {
    this.startTime = new Date();
    this.frames = 0;
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;

    this.currentTime = Date.now();
    setTimeout(this.tick, TICK_SPEED);
    this.render();

    this.resetFrames();
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
      let mesh = this.objects[0];
      mesh.thetaZ += timeScale * 8;
      mesh.thetaX += timeScale * 4;
    }

    this.handleKeys(timeScale);

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  handleKeys(dt) {
    let m = 0.1;
    if (this.input.keys.forward) {
      this.camera.z += m * dt;
    }
    if (this.input.keys.backward) {
      this.camera.z -= m * dt;
    }
    if (this.input.keys.left) {
      this.camera.x -= m * dt;
    }
    if (this.input.keys.right) {
      this.camera.x += m * dt;
    }
    if (this.input.keys.up) {
      this.camera.y -= m * dt;
    }
    if (this.input.keys.down) {
      this.camera.y += m * dt;
    }


    let r = 3;
    let mesh = this.objects[0];
    if (this.input.keys.rotateXMinus) {
      mesh.thetaX -= r * dt;
    }
    if (this.input.keys.rotateXPlus) {
      mesh.thetaX += r * dt;
    }
    if (this.input.keys.rotateYMinus) {
      mesh.thetaY -= r * dt;
    }
    if (this.input.keys.rotateYPlus) {
      mesh.thetaY += r * dt;
    }
    if (this.input.keys.rotateZMinus) {
      mesh.thetaZ -= r * dt;
    }
    if (this.input.keys.rotateZPlus) {
      mesh.thetaZ += r * dt;
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

    // https://mikro.naprvyraz.sk/docs/Coding/Atari/Maggie/3DCAM.TXT
    let rotateCamera = Matrix4x4.rotationX(this.cameraAngleX)
        .multiply(Matrix4x4.rotationY(this.cameraAngleY))
        .multiply(Matrix4x4.rotationZ(this.cameraAngleZ));

    let translatedCamera = rotateCamera.multiplyVec(this.camera);

    let ctx = this.ctx2D;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.lineWidth = 0.1;
    ctx.strokeColor = '#ffffff';

    let drawList = [];

    for (let mesh of this.objects) {
      let rotate = Matrix4x4.rotationX(mesh.thetaX)
          .multiply(Matrix4x4.rotationY(mesh.thetaY))
          .multiply(Matrix4x4.rotationZ(mesh.thetaZ));

      for (let triangle of mesh.triangles) {
        let points = [];

        for (let p of triangle.points) {
          let p2 = rotate.multiplyVec(p);

          p2 = p2.plus(mesh.pos);
          p2 = p2.minus(this.camera);

          p2 = rotateCamera.multiplyVec(p2);

          points.push(p2);
        }

        let line1 = points[1].minus(points[0]);
        let line2 = points[2].minus(points[0]);
        let normal = line1.cross(line2).normalize();

        let dot = normal.dot(points[0]);
        if (dot > 0) {
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

      if (this.fill || this.wireframe) {
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

        let color = triangle.color;

        ctx.fillStyle = `rgb(
        ${Math.floor(color[0] + 155 * lightAmount)},
        ${Math.floor(color[1] + 155 * lightAmount)},
        0)`;
      }

      if (this.fill) {
        ctx.fill();
      }

      if (this.wireframe) {
        ctx.stroke();
      }
    }

    this.frames += 1;
    let diff = new Date().getTime() - startTs;

    if (this.debug) {
      console.log(`skip=${skipped}, ms=${diff}`);
    }

    requestAnimationFrame(this.render);
  }
}
