import {bindMethods} from './bindMethods.js';

import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Triangle from './Triangle.js';
import DrawElement from './DrawElement.js';
import Clip from './Clip.js';

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
    this.cameraDir = new Vec3D(0, 0, 1);
    this.cameraAngleX = 0;
    this.cameraAngleY = 0;
    this.cameraAngleZ = 0;

    this.light = new Vec3D(0, 0, -1).normalize();
  }

  loadModels({models}) {
    let meshPromises = models.map((model) => {
      return new Mesh({debug: this.debug}).loadObject(model).then((mesh) => {
        this.objects.push(mesh);
      });
    });

    return Promise.all(meshPromises);
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
    let r = 1;
    if (this.input.keys.rotateXMinus) {
      this.cameraAngleX -= r * dt;
    }
    if (this.input.keys.rotateXPlus) {
      this.cameraAngleX += r * dt;
    }
    if (this.input.keys.rotateYMinus) {
      this.cameraAngleY -= r * dt;
    }
    if (this.input.keys.rotateYPlus) {
      this.cameraAngleY += r * dt;
    }
    if (this.input.keys.rotateZMinus) {
      this.cameraAngleZ -= r * dt;
    }
    if (this.input.keys.rotateZPlus) {
      this.cameraAngleZ += r * dt;
    }

    // https://mikro.naprvyraz.sk/docs/Coding/Atari/Maggie/3DCAM.TXT
    let cameraRotate = Matrix4x4.rotationX(this.cameraAngleX)
        .multiply(Matrix4x4.rotationY(this.cameraAngleY))
        .multiply(Matrix4x4.rotationZ(this.cameraAngleZ));

    this.cameraDir = cameraRotate.multiplyVec(new Vec3D(0, 0, 1));

    let m = 0.4;

    if (this.input.keys.decX) {
      this.camera.x -= m * dt;
    }
    if (this.input.keys.incX) {
      this.camera.x += m * dt;
    }
    if (this.input.keys.decY) {
      this.camera.y -= m * dt;
    }
    if (this.input.keys.incY) {
      this.camera.y += m * dt;
    }
    if (this.input.keys.decZ) {
      this.camera.z -= m * dt;
    }
    if (this.input.keys.incZ) {
      this.camera.z += m * dt;
    }

    let forward = this.cameraDir.multiply(m * dt);

    if (this.input.keys.forward) {
      this.camera = this.camera.plus(forward);
    }
    if (this.input.keys.backward) {
      this.camera = this.camera.minus(forward);
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

    let up = new Vec3D(0, -1, 0);
    let target = this.camera.plus(this.cameraDir);

    let cameraTranslate = Matrix4x4.pointAtMatrix(this.camera, target, up);
    let viewTranslate = Matrix4x4.quickInverseMatrix(cameraTranslate);

    let clip = new Clip({camera: this.camera, viewTranslate, near, far});

    let projection = Matrix4x4.projectionMatrix(aspectRatio, fov, near, far);
    let viewOffset = new Vec3D(1, 1, 0);

    let ctx = this.ctx2D;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.lineWidth = 0.1;
    ctx.strokeColor = '#ffffff';

    let drawList = [];

    for (let mesh of this.objects) {
      let world = Matrix4x4.rotationX(mesh.thetaX)
          .multiply(Matrix4x4.rotationY(mesh.thetaY))
          .multiply(Matrix4x4.rotationZ(mesh.thetaZ))
          .multiply(Matrix4x4.translationMatrix(mesh.pos));
      world = Matrix4x4.translationMatrix(mesh.pos);

      for (let triangle of mesh.triangles) {
        let points = [];

        for (let p of triangle.points) {
          points.push(world.multiplyVec(p));
        }

        let line1 = points[1].minus(points[0]);
        let line2 = points[2].minus(points[0]);
        let normal = line1.cross(line2).normalize();

        let cameraRay = points[0].minus(this.camera);

        let dot = normal.dot(cameraRay);
        if (dot > 0) {
          skipped += 1;
          continue;
        }

        let lightAmount = normal.dot(this.light);
        let clipped = clip.clip(new DrawElement({triangle, lightAmount, points}));

        for (let el of clipped) {
          let projectedPoints = [];

          for (let p of points) {
            let vp = viewTranslate.multiplyVec(p);
            let projected = projection.multiplyVec(vp);

            if (projected.w != 0) {
              projected = projected.divide(projected.w);
            }

            projected = projected.plus(viewOffset);

            projected.x *= 0.5 * screenW;
            projected.y *= 0.5 * screenH;

            projectedPoints.push(projected);
          }
          el.setProjected(projectedPoints);

          drawList.push(el);
        }
      }
    }

    drawList.sort((a, b) => {
      return a.z > b.z ? -1 : (a.z == b.z ? 0 : 1);
    });

    for (let el of drawList) {
      let triangle = el.triangle;
      let points = el.projectedPoints;

      ctx.beginPath();

      if (this.fill || this.wireframe) {
        for (let i = 0; i < points.length; i++) {
          let p = points[i];
          if (i == 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      }

      if (this.fill) {
        let color = triangle.color;
        let lightAmount = el.lightAmount;

        ctx.fillStyle = `rgb(
        ${Math.floor(color[0] + 155 * lightAmount)},
        ${Math.floor(color[1] + 155 * lightAmount)},
        0)`;

        ctx.fill();
      }

      if (this.wireframe) {
        ctx.closePath();
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
