import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';

export default class Camera {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
  }

  /**
   *
   * http://danceswithcode.net/engineeringnotes/rotations_in_3d/rotations_in_3d_part1.html
   */
  move(input, dt) {

    let r = 3.5;
    if (input.keys.rotateXMinus) {
      this.angleX -= r * dt;
    }
    if (input.keys.rotateXPlus) {
      this.angleX += r * dt;
    }
    if (input.keys.rotateYMinus) {
      this.angleY -= r * dt;
    }
    if (input.keys.rotateYPlus) {
      this.angleY += r * dt;
    }
    if (input.keys.rotateZMinus) {
      this.angleZ -= r * dt;
    }
    if (input.keys.rotateZPlus) {
      this.angleZ += r * dt;
    }

    // https://mikro.naprvyraz.sk/docs/Coding/Atari/Maggie/3DCAM.TXT
    let thisRotate = Matrix4x4.rotationZ(this.angleZ)
        .multiply(Matrix4x4.rotationY(this.angleY))
        .multiply(Matrix4x4.rotationX(this.angleX));

    this.dir = thisRotate.multiplyVec(new Vec3D(0, 0, 1));
    this.leftDir = thisRotate.multiplyVec(new Vec3D(1, 0, 0));
    this.upDir = this.dir.cross(this.leftDir);

    this.lightDir = thisRotate.multiplyVec(new Vec3D(0, 0, -1));

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
    let left = this.leftDir.multiply(m * dt);
    let up = this.upDir.multiply(m * dt);

    if (input.keys.forward) {
      this.pos = this.pos.plus(forward);
    }
    if (input.keys.backward) {
      this.pos = this.pos.minus(forward);
    }
    if (input.keys.left) {
      this.pos = this.pos.plus(left);
    }
    if (input.keys.right) {
      this.pos = this.pos.minus(left);
    }
    if (input.keys.up) {
      this.pos = this.pos.plus(up);
    }
    if (input.keys.down) {
      this.pos = this.pos.minus(up);
    }
  }
}
