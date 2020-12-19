import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';

export default class Camera {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;

    this.rotate = this.createRotate(0, 0, 0);

    this.dir = new Vec3D(0, 0, 1);
    this.rightDir = new Vec3D(1, 0, 0);
    this.upDir = this.dir.cross(this.rightDir);

    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 90;

    this.lightDir = new Vec3D(0, 0, -1);
  }

  /**
   * ORDER: yaw-pitch-roll
   */
  createRotate(tx, ty, tz) {
    return Matrix4x4.rotationZ(tz)
      .multiply(Matrix4x4.rotationY(ty))
      .multiply(Matrix4x4.rotationX(tx));
  }

  updateMesh(mesh) {
    if (!mesh) {
      return;
    }
    mesh.rotate = this.rotate;
  }

  /**
   *
   * https://mikro.naprvyraz.sk/docs/Coding/Atari/Maggie/3DCAM.TXT
   * http://danceswithcode.net/engineeringnotes/rotations_in_3d/rotations_in_3d_part1.html
   */
  move(input, dt) {
    let r = 3.5;

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    if (input.keys.rotateXMinus) {
      angleX -= r * dt;
    }
    if (input.keys.rotateXPlus) {
      angleX += r * dt;
    }
    if (input.keys.rotateYMinus) {
      angleY -= r * dt;
    }
    if (input.keys.rotateYPlus) {
      angleY += r * dt;
    }
    if (input.keys.rotateZMinus) {
      angleZ -= r * dt;
    }
    if (input.keys.rotateZPlus) {
      angleZ += r * dt;
    }

    if (angleX !== 0 || angleY !== 0 || angleZ !== 0) {
      let rot = this.rotate.multiply(this.createRotate(angleX, angleY, angleZ));
      this.rotate = rot;

      this.dir = rot.multiplyVec(new Vec3D(0, 0, 1)).normalize();
      this.rightDir = rot.multiplyVec(new Vec3D(1, 0, 0)).normalize();
      this.upDir = this.dir.cross(this.rightDir).normalize();

      let n = this.dir;
      let dx = n.dot(new Vec3D(1, 0, 0));
      let dy = n.dot(new Vec3D(0, 1, 0));
      let dz = n.dot(new Vec3D(0, 0, 1));
      this.angleX = dx > 0 ? Math.acos(dx) / Math.PI * 180 : 0;
      this.angleY = dy > 0 ? Math.acos(dy) / Math.PI * 180 : 0;
      this.angleZ = dz > 0 ? Math.acos(dz) / Math.PI * 180 : 0;

      this.lightDir = rot.multiplyVec(new Vec3D(0, 0, -1)).normalize();
    }

    let m = 0.7;

    if (input.keys.decX) {
      this.x -= m * dt;
    }
    if (input.keys.incX) {
      this.x += m * dt;
    }
    if (input.keys.decY) {
      this.y -= m * dt;
    }
    if (input.keys.incY) {
      this.y += m * dt;
    }
    if (input.keys.decZ) {
      this.z -= m * dt;
    }
    if (input.keys.incZ) {
      this.z += m * dt;
    }

    let forward = this.dir.multiply(m * dt);
    let right = this.rightDir.multiply(m * dt);
    let up = this.upDir.multiply(m * dt);

    if (input.keys.forward) {
      this.pos = this.pos.plus(forward);
    }
    if (input.keys.backward) {
      this.pos = this.pos.minus(forward);
    }
    if (input.keys.left) {
      this.pos = this.pos.plus(right);
    }
    if (input.keys.right) {
      this.pos = this.pos.minus(right);
    }
    if (input.keys.up) {
      this.pos = this.pos.plus(up);
    }
    if (input.keys.down) {
      this.pos = this.pos.minus(up);
    }
  }
}
