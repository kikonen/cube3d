import {bindMethods} from './bindMethods.js';

import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Viewport from './Viewport.js';
import Triangle from './Triangle.js';
import Plane from './Plane.js';
import Camera from './Camera.js';

import Mesh from './Mesh.js';

const TICK_SPEED = 20;
// timescale ~ 0.2
const WORLD_SPEED = 80;


export default class CanvasRenderer {
  constructor({canvas}) {
    this.canvas = canvas;
    this.ctx2D = canvas.getContext("2d", { alpha: false });
  }

  render({camera, objects, optimize, fill, wireframe, debug}) {
    this.optimize = optimize;
    this.fill = fill;
    this.wireframe = wireframe;
    this.optimize = optimize;
    this.debug = debug;

    let screenW = this.canvas.width;
    let screenH = this.canvas.height;

    let ctx = this.ctx2D;

    if (optimize) {
      // https://stackoverflow.com/questions/195262/can-i-turn-off-antialiasing-on-an-html-canvas-element
      // https://html.spec.whatwg.org/multipage/canvas.html#fill-and-stroke-styles:dom-context-2d-imagesmoothingenabled
      // CLAIM: can be faster; didn't notice any difference
      ctx.imageSmoothingEnabled = false;

      // https://html.spec.whatwg.org/multipage/canvas.html#2dcontext:concept-canvas-desynchronized
      // CLAIM: may be faster
      ctx.desynchronized = true;
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenW, screenH);

    // NOTE KI mismatch between left vs. righthanded coords
    // https://en.wikipedia.org/wiki/Cartesian_coordinate_system

    let up = new Vec3D(0, -1, 0);

    let totalVertexes = 0;
    let totalTris = 0;
    let skippedTris = 0;
    let duplicateVertexes = 0;

    {
      let target = camera.pos.plus(camera.dir);
      let worldCameraTranslate = Matrix4x4.pointAtMatrix(camera.pos, target, up);
      let worldViewTranslate = Matrix4x4.quickInverseMatrix(worldCameraTranslate);

      let pad = 0;
      let viewPort = new Viewport(0 + pad, 0 + pad, screenW - 2 * pad, screenH - 2 * pad, debug);

      for (let mesh of objects) {
        let res = this.renderMesh(mesh, ctx, viewPort, worldViewTranslate, camera.viewPos, camera.lightDir);
        totalTris += res.totalTris;
        totalVertexes += res.totalVertexes;
        skippedTris += res.skippedTris;
        duplicateVertexes += res.duplicateVertexes;
      }
    }

    if (camera.mesh) {
      let viewPos = new Vec3D(0, 0, -10000);
      let cp = new Vec3D(0, 0, 0);
      let target = cp.plus(new Vec3D(0, 0, 1));
      let cpTrans = Matrix4x4.pointAtMatrix(cp, target, up);
      let cpView = Matrix4x4.quickInverseMatrix(cpTrans);

      let camPort = new Viewport(3, 3, 100, 100, debug);
      camPort.offset = new Vec3D(0.5, 1.3);

      let res = this.renderMesh(camera.mesh, ctx, camPort, cpView, viewPos, new Vec3D(0, -1, -1));
//      skippedTris += res.skippedTris;
//      duplicateVertexes += res.duplicateVertexes;
    }

    return {
      totalTris: totalTris,
      totalVertexes: totalVertexes,
      skippedTris: skippedTris,
      duplicateVertexes: duplicateVertexes,
    };
  }

  renderMesh(mesh, ctx, viewPort, viewTranslate, viewPos, lightDir, fill, wireframe) {
    let skippedTris = 0;
    let duplicateVertexes = 0;

    ctx.lineWidth = 0.5;
    ctx.strokeColor = '#a0a0a0';
    ctx.beginPath();
    ctx.rect(viewPort.x, viewPort.y, viewPort.h, viewPort.h);
    ctx.stroke();

    ctx.lineWidth = 0.1;
    ctx.strokeColor = '#ffffff';

    // ORDER: yaw-pitch-roll
    let worldMat = mesh.getWorldMatrix();

    let worldVertexes = mesh.vertexes.map(v => {
      return worldMat.multiplyVec(v);
    });

    let viewVertexes = worldVertexes.map(v => { return null; });
    let viewTris = [];

    for (let tri of mesh.triangles) {
      let v0 = tri.v0;
      let v1 = tri.v1;
      let v2 = tri.v2;
      let p0 = worldVertexes[v0];
      let p1 = worldVertexes[v1];
      let p2 = worldVertexes[v2];

      let normal;
      {
        let line1 = p1.minus(p0);
        let line2 = p2.minus(p0);
        normal = line1.cross(line2).normalize();

        let viewRay = p0.minus(viewPos);

        let dot = normal.dot(viewRay);
        if (dot > 0) {
          skippedTris += 1;
          continue;
        }
      }

      let lightAmount = normal.dot(lightDir);

      if (!viewVertexes[v0]) {
        viewVertexes[v0] = viewTranslate.multiplyVec(p0);
      } else {
        duplicateVertexes++;
      }

      if (!viewVertexes[v1]) {
        viewVertexes[v1] = viewTranslate.multiplyVec(p1);
      } else {
        duplicateVertexes++;
      }

      if (!viewVertexes[v2]) {
        viewVertexes[v2] = viewTranslate.multiplyVec(p2);
      } else {
        duplicateVertexes++;
      }

      let viewTri = new Triangle(tri.vertexIndexes, tri.textureIndexes, tri.material, lightAmount);
      let clipped = viewPort.nearPlane.clip(viewTri, viewVertexes);
      for (tri of clipped) {
        viewTris.push(tri);
      }
    }

    let projectedTris = [];

    let projectedVertexes = viewVertexes.map(v => { return null; });
    let projection = viewPort.projection;

    function project(v) {
      v = projection.multiplyVec(v);
      if (v.w != 0) {
        v = v.divide(v.w);
      }
      v = v.plus(viewPort.offset);
      v.x *= 0.5 * viewPort.w;
      v.y *= 0.5 * viewPort.h;
      return v;
    }

    for (let tri of viewTris) {
      let v0 = tri.v0;
      let v1 = tri.v1;
      let v2 = tri.v2;

      let p0 = viewVertexes[v0];
      let p1 = viewVertexes[v1];
      let p2 = viewVertexes[v2];

      if (!projectedVertexes[v0]) {
        projectedVertexes[v0] = project(p0);
      }
      if (!projectedVertexes[v1]) {
        projectedVertexes[v1] = project(p1);
      }
      if (!projectedVertexes[v2]) {
        projectedVertexes[v2] = project(p2);
      }

      let projectedTri = new Triangle(tri.vertexIndexes, tri.textureIndexes, tri.material, tri.lightAmount);
      projectedTri.calculateZ(projectedVertexes);
      projectedTris.push(projectedTri);
    }

    projectedTris.sort((a, b) => {
      return a.z > b.z ? -1 : (a.z == b.z ? 0 : 1);
    });

    // clip to screen
    for (let tri of projectedTris) {
      let tris = [];
      tris.push(tri);

      for (let s = 0; s < 4; s++) {
        let processedTris = [];
        while (tris.length > 0) {
          let curr = tris.pop();

          let plane = viewPort.planes[s];
          let clippedTris = plane.clip(curr, projectedVertexes);
          for (let clippedTri of clippedTris) {
            processedTris.push(clippedTri);
          }
        }
        for (let processedTri of processedTris) {
          tris.push(processedTri);
        }
      }

      // draw tris clipped to screen
      for (let tri of tris) {
        if (this.fill || this.wireframe) {
          ctx.beginPath();

          let p0 = projectedVertexes[tri.v0];
          let p1 = projectedVertexes[tri.v1];
          let p2 = projectedVertexes[tri.v2];

          // https://stackoverflow.com/questions/8205828/html5-canvas-performance-and-optimization-tips-tricks-and-coding-best-practices
          // CLAIM: rounded numbers are *faster* in canvas
          if (this.optimize) {
            ctx.moveTo(p0.x << 0, p0.y << 0);
            ctx.lineTo(p1.x << 0, p1.y << 0);
            ctx.lineTo(p2.x << 0, p2.y << 0);
          } else {
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }

        if (this.fill) {
          let texture = tri.material.getTexture(tri.lightAmount);
          if (texture) {
            ctx.fillStyle = ctx.createPattern(texture, "repeat");
          } else {
            ctx.fillStyle = tri.material.getColor(tri.lightAmount);
          }
          ctx.fill();
        }

        if (this.wireframe) {
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    return {
      totalTris: mesh.triangles.length,
      totalVertexes: mesh.vertexes.length,
      skippedTris: skippedTris,
      duplicateVertexes: duplicateVertexes,
    };
  }
}