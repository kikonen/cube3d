import Vec3D from './Vec3D.js';
import Triangle from './Triangle.js';

export default class Mesh {
  constructor(triangles) {
    this.triangles = triangles;
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
              parseFloat(parts[2]));
            vectors.push(vec);
            break;
          }
          case 'f': {
            let triangle = new Triangle(
              [
                vectors[parseInt(parts[1], 10) - 1],
                vectors[parseInt(parts[2], 10) - 1],
                vectors[parseInt(parts[2], 10) - 1]
              ]);
            triangles.push(triangle);
            break;
          }
        }
      });

      console.log(triangles);
      this.triangles = triangles;
    });
  }
}
