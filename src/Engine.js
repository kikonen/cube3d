import {bindMethods} from './bindMethods.js';

import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Viewport from './Viewport.js';
import Triangle from './Triangle.js';
import Plane from './Plane.js';
import Camera from './Camera.js';
import CanvasRenderer from './CanvasRenderer.js';

import Mesh from './Mesh.js';

const TICK_SPEED = 20;
// timescale ~ 0.2
const WORLD_SPEED = 80;


export default class Engine {
  constructor({ input, canvas }) {
    bindMethods(this);

    this.input = input;

    this.objects = [];

    this.useFill = true;
    this.useWireframe = false;
    this.useTexture = true;

    this.useOptimize = true;
    this.useRotate = false;
    this.debug = false;
    this.ticks = 0;

    this.camera = new Camera(new Vec3D(0, 0, 0), new Vec3D(0, 0, 1));
    this.renderer = new CanvasRenderer({canvas, debug: this.debug});
  }

  loadModels({models}) {
    let meshPromises = models.map((model) => {
      return new Mesh({debug: this.debug}).loadObject(model).then((mesh) => {
        if (model.cameraMesh) {
          this.cameraMesh = mesh;
        } else {
          this.objects.push(mesh);
        }
      });
    });

    return Promise.all(meshPromises);
  }

  resetFrames() {
    this.startTime = new Date();
    this.frames = 0;
    this.renderer.debug = this.debug;
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

    if (this.useRotate) {
      let mesh = this.objects[0];
      mesh.updateRotate(0, timeScale * 4, timeScale * 8);
    }

    this.handleKeys(timeScale);

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  handleKeys(dt) {
    this.camera.move(this.input, dt);
  }

  render() {
    if (this.stopped) {
      return;
    }

    let startTs = performance.now();

    this.camera.updateMesh(this.cameraMesh);

    let res = this.renderer.render({
      camera: this.camera,
      objects: this.objects,
      useFill: this.useFill,
      useWireframe: this.useWireframe,
      useTexture: this.useTexture,
      useOptimize: this.useOptimize,
      debug: this.debug});

    this.frames += 1;
    let diff = performance.now() - startTs;

    if (this.debug) {
      console.log(`total=${res.totalTris}, skip=${res.skippedTris}, vertexes=${res.totalVertexes}, dup=${res.duplicateVertexes} ms=${diff.toFixed(2)}`);
    }

    requestAnimationFrame(this.render);
  }

}
