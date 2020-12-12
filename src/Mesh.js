import Vec3D from './Vec3D.js';
import Triangle from './Triangle.js';

export default class Mesh {
  constructor(triangles) {
    this.triangles = triangles;

    this.thetaX = 0;
    this.thetaY = 0;
    this.thetaZ = 0;

    this.color = [100, 100, 0];
  }

  loadObject(resourceUrl) {
    return fetch(resourceUrl).then((response) => {
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

//      console.log(vectors);
//      console.log(triangles);

      this.triangles = triangles;

      return this;
    });
  }
}
