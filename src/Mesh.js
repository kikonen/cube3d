import Vec3D from './Vec3D.js';
import Triangle from './Triangle.js';

export default class Mesh {
  constructor({triangles, debug}) {
    this.model = null;
    this.triangles = triangles;

    this.pos = new Vec3D();
    this.thetaX = 0;
    this.thetaY = 0;
    this.thetaZ = 0;

    this.color = [100, 100, 0];

    this.debug = debug;
  }

  getResource(model) {
    return `../cube3d/model/${model.name}.obj`;
  }

  loadObject(model) {
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
              this.color);
            triangles.push(triangle);
            break;
          }
        }
      });

      this.model = model;
      this.pos = model.pos;
      this.triangles = triangles;

      if (this.debug) {
        console.log(this);
      }

      return this;
    });
  }
}
