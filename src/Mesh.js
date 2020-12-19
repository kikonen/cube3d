import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Triangle from './Triangle.js';

const COLOR = [150, 150, 0];

export default class Mesh {
  constructor({triangles, debug}) {
    this.model = null;
    this.triangles = triangles;

    this.pos = new Vec3D();
    this.rotate = this.createRotate(0, 0, 0);

    this.color = COLOR;

    this.debug = debug;
  }

  /**
   * ORDER: yaw-pitch-roll
   */
  createRotate(tx, ty, tz) {
    return Matrix4x4.rotationZ(tz)
      .multiply(Matrix4x4.rotationY(ty))
      .multiply(Matrix4x4.rotationX(tx));
  }

  updateRotate(tx, ty, tz) {
    this.rotate = this.rotate.multiply(this.createRotate(tx, ty, tz));
  }

  getResource(model) {
    return `../cube3d/model/${model.name}.obj`;
  }

  loadObject(model) {
    this.model = model;
    this.color = model.color || COLOR;
    this.scale = model.scale || 1;
    this.pos = model.pos;

    let url = this.getResource(model);
    return fetch(url).then((response) => {
      return response.text();
    }).then((lines) => {
      let vectors = [];
      let triangles = [];

      lines.split('\n').forEach((line) =>  {
        let parts = line.split(' ');
        switch (parts[0]) {
          case 'v': {
            let vec = new Vec3D(
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3]));
            vectors.push(vec);
            break;
          }
          case 'f': {
            let x = vectors[parseInt(parts[1].split('/')[0], 10) - 1];
            let y = vectors[parseInt(parts[2].split('/')[0], 10) - 1];
            let z = vectors[parseInt(parts[3].split('/')[0], 10) - 1];

            let triangle = new Triangle(
              [
                x,
                y,
                z
              ],
              this.color,
              1);
            triangles.push(triangle);
            break;
          }
        }
      });

      this.triangles = triangles;

      if (this.debug) {
        console.log(this);
      }

      return this;
    });
  }
}
