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

const abs = Math.abs;


export default class CanvasRenderer {
  constructor({canvas}) {
    this.canvas = canvas;
    this.ctx2D = canvas.getContext("2d", { alpha: false });
  }

  render({camera, objects, useOptimize, useFill, useWireframe, useTexture, debug}) {
    this.useFill = useFill;
    this.useWireframe = useWireframe;
    this.useTexture = useTexture;
    this.useOptimize = useOptimize;
    this.debug = debug;

    let screenW = this.canvas.width;
    let screenH = this.canvas.height;

    let ctx = this.ctx2D;

    if (useOptimize) {
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

  renderMesh(mesh, ctx, viewPort, viewTranslate, viewPos, lightDir) {
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

    let textureVertexes = mesh.textureVertexes.map(v => { return v; });

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
      let clipped = viewPort.nearPlane.clip(viewTri, viewVertexes, textureVertexes);
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
          let clippedTris = plane.clip(curr, projectedVertexes, textureVertexes);
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
        let p0 = projectedVertexes[tri.v0];
        let p1 = projectedVertexes[tri.v1];
        let p2 = projectedVertexes[tri.v2];

        if (this.useFill || this.useWireframe) {
          ctx.beginPath();

          // https://stackoverflow.com/questions/8205828/html5-canvas-performance-and-optimization-tips-tricks-and-coding-best-practices
          // CLAIM: rounded numbers are *faster* in canvas
          if (this.useOptimize) {
            ctx.moveTo(p0.x << 0, p0.y << 0);
            ctx.lineTo(p1.x << 0, p1.y << 0);
            ctx.lineTo(p2.x << 0, p2.y << 0);
          } else {
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }

        if (this.useFill) {
          let texture = this.useTexture ? tri.material.texture : null;
          if (texture) {
            let tp0 = textureVertexes[tri.t0];
            let tp1 = textureVertexes[tri.t1];
            let tp2 = textureVertexes[tri.t2];

            this.renderTexture(ctx, viewPort, p0, p1, p2, tp0, tp1, tp2, texture, tri);
          } else {
            ctx.fillStyle = tri.material.getColor(tri.lightAmount);
            ctx.fill();
          }
        }

        if (this.useWireframe) {
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

  /**
   * Extremely slow texture render; just pure exercise
   *
   * https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
   */
  renderTexture(ctx, viewPort, p0, p1, p2, tp0, tp1, tp2, texture, tri) {
    let pixelData;// = new ImageData(new Uint8ClampedArray(4), 1, 1);

    function putPixel(x, y, color) {
      if (x < 0 || x > 800 || y < 0 || y > 800) {
        throw `KO: ${x}, ${y}`;
      }
      if (false) {
        let data = pixelData.data;
        data[0] = color[0];
        data[1] = color[1];
        data[2] = color[2];
        data[3] = color[3];

        ctx.putImageData(pixelData, x, y);
      } else {
        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        //viewPort.putPixel(x, y, color);
      }
    }

    function getColorRGBA(tx, ty, lightAmount) {
      let rgba = texture.getRGBA(tx, ty);
      let color = [
        255 & (rgba >> 24),
        255 & (rgba >> 16),
        255 & (rgba >> 8),
        255 & (rgba)];
      return color.map(c => {
        return Math.max(Math.floor(c + (c / 2) * lightAmount), 0);
      });
    }

    function getColor(tx, ty, lightAmount) {
      let color = texture.getColor(tx, ty);
      return color.map(c => {
        return Math.max(Math.floor(c + (c / 2) * lightAmount), 0);
      });
    }

    let w = texture.width;
    let h = texture.height;

    let axis = [[p0, tp0], [p1, tp1], [p2, tp2]];
    axis.sort((a, b) => {
      let d = a[0].y - b[0].y;
      if (d == 0) {
        d = b[0].x - a[0].x;
      }
      return d;
    });

    let min = axis[0];
    let mid = axis[1];
    let max = axis[2];

    let y0 = Math.round(min[0].y);
    let y1 = Math.round(mid[0].y);
    let y2 = Math.round(max[0].y);

    let x0 = Math.round(min[0].x);
    let x1 = Math.round(mid[0].x);
    let x2 = Math.round(max[0].x);

    let v0 = min[1].y;
    let v1 = mid[1].y;
    let v2 = max[1].y;

    let u0 = min[1].x;
    let u1 = mid[1].x;
    let u2 = max[1].x;

    let w0 = min[1].w;
    let w1 = mid[1].w;
    let w2 = max[1].w;

    if (this.debug) {
      ctx.closePath();
      ctx.stroke();
    }

    ctx.fillStyle = tri.material.getColor(tri.lightAmount);

    if (this.debug) {
      console.log(min[0], mid[0], max[0]);
    }

    if (this.debug) {
      ctx.fillStyle = '#FF0000';
    }

    if (this.debug) {
      console.log(min, mid, max);
      console.log(`y_diff = ${y2 - y0} `);
      console.log(`x_diff = ${Math.max(x0, x1, x2) - Math.min(x0, x1, x2)} `);
    }

    let dy1 = y1 - y0;
    let dx1 = x1 - x0;

    let dv1 = v1 - v0;
    let du1 = u1 - u0;
    let dw1 = w1 - w0;

    let dy2 = y2 - y0;
    let dx2 = x2 - x0;

    let dv2 = v2 - v0;
    let du2 = u2 - u0;
    let dw2 = w2 - w0;

    let tex_u = 0;
    let tex_v = 0;
    let tex_w = 0;

    let dax_step = 0;
    let dbx_step = 0;

    let du1_step = 0;
    let dv1_step = 0;
    let du2_step = 0;
    let dv2_step = 0;
    let dw1_step = 0;
    let dw2_step = 0;

    // PART: top
    if (dy1 !== 0) {
      dax_step = dx1 / abs(dy1);

      du1_step = du1 / abs(dy1);
      dv1_step = dv1 / abs(dy1);
      dw1_step = dw1 / abs(dy1);
    }

    if (dy2 !== 0) {
      dbx_step = dx2 / abs(dy2);

      du2_step = du2 / abs(dy2);
      dv2_step = dv2 / abs(dy2);
      dw2_step = dw2 / abs(dy2);
    }

    if (dy1 !== 0) {
      for (let y = y0; y < y1; y++) {
        let ax = Math.round(x0 + (y - y0) * dax_step);
        let bx = Math.round(x0 + (y - y0) * dbx_step);

        let tex_su = u0 + (y - y0) * du1_step;
        let tex_sv = v0 + (y - y0) * dv1_step;
        let tex_sw = w0 + (y - y0) * dw1_step;

        let tex_eu = u0 + (y - y0) * du2_step;
        let tex_ev = v0 + (y - y0) * dv2_step;
        let tex_ew = w0 + (y - y0) * dw2_step;

        if (ax > bx) {
          let t = ax;
          ax = bx;
          bx = t;

          t = tex_eu;
          tex_eu = tex_su;
          tex_su = t;

          t = tex_ev;
          tex_ev = tex_sv;
          tex_sv = t;

          t = tex_ew;
          tex_ew = tex_sw;
          tex_sw = t;
        }

        tex_u = tex_su;
        tex_v = tex_sv;
        tex_w = tex_sw;

        let tstep = 1.0 / (bx - ax);
        let t = 0.0;

        for (let x = ax; x < bx; x++) {
          tex_u = (1.0 - t) * tex_su + t * tex_eu;
          tex_v = (1.0 - t) * tex_sv + t * tex_ev;
          tex_w = (1.0 - t) * tex_sw + t * tex_ew;

          let color = getColor(tex_u / tex_w, tex_v / tex_w, tri.lightAmount);
          putPixel(x, y, color);
	  t += tstep;
        }
      }
    }

    // PART: bottom
    dy1 = y2 - y1;
    dx1 = x2 - x1;

    dv1 = v2 - v1;
    du1 = u2 - u1;
    dw1 = w2 - w1;

    if (dy1 !== 0) {
      dax_step = dx1 / dy1;

      du1_step = 0;
      dv1_step = 0;

      du1_step = du1 / abs(dy1);
      dv1_step = dv1 / abs(dy1);
      dw1_step = dw1 / abs(dy1);

      for (let y = y1; y < y2; y++) {
        let ax = Math.round(x1 + (y - y1) * dax_step);
        let bx = Math.round(x0 + (y - y0) * dbx_step);

        let tex_su = u1 + (y - y1) * du1_step;
        let tex_sv = v1 + (y - y1) * dv1_step;
        let tex_sw = w1 + (y - y1) * dw1_step;

        let tex_eu = u0 + (y - y0) * du2_step;
        let tex_ev = v0 + (y - y0) * dv2_step;
        let tex_ew = w0 + (y - y0) * dw2_step;

        if (ax > bx) {
          let t = ax;
          ax = bx;
          bx = t;

          t = tex_eu;
          tex_eu = tex_su;
          tex_su = t;

          t = tex_ev;
          tex_ev = tex_sv;
          tex_sv = t;

          t = tex_ew;
          tex_ew = tex_sw;
          tex_sw = t;
        }

        tex_u = tex_su;
        tex_v = tex_sv;
        tex_w = tex_sw;

        let tstep = 1.0 / (bx - ax);
        let t = 0.0;

        for (let x = ax; x < bx; x++) {
          tex_u = (1.0 - t) * tex_su + t * tex_eu;
          tex_v = (1.0 - t) * tex_sv + t * tex_ev;
          tex_w = (1.0 - t) * tex_sw + t * tex_ew;

          let color = getColor(tex_u / tex_w, tex_v / tex_w, tri.lightAmount);
          putPixel(x, y, color);
	  t += tstep;
        }
      }
    }
  }
}
