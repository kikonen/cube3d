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

    this.updateViewPos();
    this.updateAngle();

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

  updateViewPos() {
//    let forward = this.dir.multiply(10000);
//    this.viewPos = this.pos.minus(forward);
    this.viewPos = this.pos;
  }

  /**
   * https://www.mathopenref.com/arccos.html
   */
  updateAngle() {
    let n = this.dir;
    let dx = n.dot(new Vec3D(1, 0, 0));
    let dy = n.dot(new Vec3D(0, 1, 0));
    let dz = n.dot(new Vec3D(0, 0, 1));
    this.angleX = 180 - (Math.acos(dx) * 180 / Math.PI);
    this.angleY = 180 - (Math.acos(dy) * 180 / Math.PI);
    this.angleZ = (Math.acos(dz) * 180 / Math.PI);
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
    let keys = input.keys;
    let r = 3.5;

    let changed = true;

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    if (keys.rotateXMinus) {
      angleX -= r * dt;
    }
    if (keys.rotateXPlus) {
      angleX += r * dt;
    }
    if (keys.rotateYMinus) {
      angleY -= r * dt;
    }
    if (keys.rotateYPlus) {
      angleY += r * dt;
    }
    if (keys.rotateZMinus) {
      angleZ -= r * dt;
    }
    if (keys.rotateZPlus) {
      angleZ += r * dt;
    }

    if (angleX !== 0 || angleY !== 0 || angleZ !== 0) {
      let rot = this.rotate.multiply(this.createRotate(angleX, angleY, angleZ));
      this.rotate = rot;

      this.dir = rot.multiplyVec(new Vec3D(0, 0, 1)).normalize();
      this.rightDir = rot.multiplyVec(new Vec3D(1, 0, 0)).normalize();
      this.upDir = this.dir.cross(this.rightDir).normalize();

      this.updateAngle();

      this.lightDir = rot.multiplyVec(new Vec3D(0, 0, -1)).normalize();
      changed = true;
    }

    let m = 0.7;

    // if (keys.decX) {
    //   this.x -= m * dt;
    // }
    // if (keys.incX) {
    //   this.x += m * dt;
    // }
    // if (keys.decY) {
    //   this.y -= m * dt;
    // }
    // if (keys.incY) {
    //   this.y += m * dt;
    // }
    // if (keys.decZ) {
    //   this.z -= m * dt;
    // }
    // if (keys.incZ) {
    //   this.z += m * dt;
    // }

    let isMove = keys.forward || keys.backward || keys.left || keys.right || keys.up || keys.down;

    if (isMove) {
      let forward = this.dir.multiply(m * dt);
      let right = this.rightDir.multiply(m * dt);
      let up = this.upDir.multiply(m * dt);

      if (keys.forward) {
        this.pos = this.pos.plus(forward);
      }
      if (keys.backward) {
        this.pos = this.pos.minus(forward);
      }
      if (keys.left) {
        this.pos = this.pos.plus(right);
      }
      if (keys.right) {
        this.pos = this.pos.minus(right);
      }
      if (keys.up) {
        this.pos = this.pos.plus(up);
      }
      if (keys.down) {
        this.pos = this.pos.minus(up);
      }

      changed = true;
    }

    if (changed) {
      this.updateViewPos();
    }
  }
}
