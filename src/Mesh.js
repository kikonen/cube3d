import Vec3D from './Vec3D.js';
import Matrix4x4 from './Matrix4x4.js';
import Triangle from './Triangle.js';
import Material from './Material.js';

const COLOR = [150, 150, 0];
const MATERIAL = new Material('mesh', COLOR);

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => binary += String.fromCharCode(b));

  return window.btoa(binary);
}

export default class Mesh {
  constructor({debug}) {
    this.model = null;
    this.vertexes = [];
    this.triangles = [];

    this.pos = new Vec3D();

    this.rotate = this.createRotate(0, 0, 0);
    this.updateScale(1);

    this.material = MATERIAL;

    this.baseUrl = '../cube3d/model';
    this.debug = debug;
  }

  resetCache() {
    this.worldMatrix = null;
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
    this.resetCache();
  }

  updateScale(scale) {
    this.scale = scale;
    this.scaleMatrix = Matrix4x4.scaleMatrix(this.scale);
    this.resetCache();
  }

  updatePos(pos) {
    this.pos = pos;
    this.resetCache();
  }

  getWorldMatrix() {
    if (!this.worldMatrix) {
      this.worldMatrix = this.scaleMatrix
        .multiply(this.rotate)
        .multiply(Matrix4x4.translationMatrix(this.pos));
    }
    return this.worldMatrix;
  }

  /**
   * http://paulbourke.net/dataformats/mtl/
   */
  loadMaterialLibrary(materialLib) {
    let url = `${this.baseUrl}/${materialLib}`;

    return fetch(url).then((response) => {
      return response.text();
    }).then((lines) => {
      let materials = new Map();

      let material = null;

      lines.split('\n').forEach((line) =>  {
        let parts = line.split(' ');
        switch (parts[0]) {
        case 'newmtl': {
          if (material) {
            materials.set(material.name, material);
            material = null;
          }
          material = new Material(parts[1], this.material.color);
          break;
        }
        case 'Ns': {
          // Ns exponent
          // Specifies the specular exponent for the current material.  This defines
          // the focus of the specular highlight.
          material.ns = parseFloat(parts[1]);
          break;
        }
        case 'Ka': {
          // SYNTAX: Ka r g b
          // The Ka statement specifies the ambient reflectivity using RGB values.
          material.ka = [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]),
          ];
          break;
        }
        case 'Kd': {
          // SYNTAX: Kd r g b
          // The Kd statement specifies the diffuse reflectivity using RGB values.
          material.kd = [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]),
          ];
          break;
        }
        case 'Ks': {
          // SYNTAX: Ks r g b
          // The Ks statement specifies the specular reflectivity using RGB values.
          material.ks = [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]),
          ];
          break;
        }
        case 'Ke': {
          material.ke = [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]),
          ];
          break;
        }
        case 'Ni': {
          // SYNTAX: Ni optical_density
          // Specifies the optical density for the surface.  This is also known as
          // index of refraction.
          material.ni = parseFloat(parts[1]);
          break;
        }
        case 'd': {
          // d - material dissolve is multiplied by the texture value
          material.d = parseFloat(parts[1]);
          break;
        }
        case 'illum': {
          // illum illum_#
          //  The "illum" statement specifies the illumination model to use in the
          material.illum = parseInt(parts[1], 10);
          break;
        }
        case 'map_Kd': {
          // map_Kd -options args filename

          // Specifies that a color texture file or color procedural texture file is
          // linked to the diffuse reflectivity of the material.  During rendering,
          // the map_Kd value is multiplied by the Kd value.
          material.map_kd = parts[1];
          break;
        }
        }
      });

      if (material) {
        materials.set(material.name, material);
      }

      return materials;
    }).then(materials => {
      let texturePromises = [];

      materials.forEach((m, k) => {
        if (m.map_kd) {
          let url = `${this.baseUrl}/${m.map_kd}`;
          let promise = fetch(url).then(response => {
            // https://medium.com/front-end-weekly/fetching-images-with-the-fetch-api-fb8761ed27b2
            return response.arrayBuffer().then(buffer => {
              var base64Flag = 'data:image/jpeg;base64,';
              var imageStr = arrayBufferToBase64(buffer);
              let img = document.createElement('img');
              img.src = base64Flag + imageStr;
              return img;
            });
          }).then(img => {
            m.textureData = img;
            return m;
          });
          texturePromises.push(promise);
        }
      });

      if (texturePromises) {
        return Promise.all(texturePromises).then(result => {
          return materials;
        });
      } else {
        return materials;
      }
    });
  }

  /**
   * http://paulbourke.net/dataformats/obj/
   */
  loadObject(model) {
    this.model = model;
    this.material = model.material || this.material;
    this.pos = model.pos;
    this.updateScale(model.scale);

    let url = `${this.baseUrl}/${model.name}.obj`;
    let materialLib = null;

    return fetch(url).then((response) => {
      return response.text();
    }).then((lines) => {
      let vertexes = [];
      let textureVertexes = [];
      let triangles = [];

      let materialName = null;

      lines.split('\n').forEach((line) =>  {
        let parts = line.split(' ');
        switch (parts[0]) {
          case 'mtllib': {
            materialLib = parts[1];
            break;
          }
          case 'v': {
            let vec = new Vec3D(
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3]));
            vertexes.push(vec);
            break;
          }
          case 'vt': {
            let vec = new Vec3D(
              parseFloat(parts[1]),
              parseFloat(parts[2]));
            textureVertexes.push(vec);
            break;
          }
          case 'usemtl': {
            materialName = parts[1];
            break;
          }
          case 'f': {
            let xp = parts[1].split('/');
            let yp = parts[2].split('/');
            let zp = parts[3].split('/');

            let triangle = new Triangle(
              [
                parseInt(xp[0], 10) - 1,
                parseInt(yp[0], 10) - 1,
                parseInt(zp[0], 10) - 1,
              ],
              [
                parseInt(xp[1], 10) - 1,
                parseInt(yp[1], 10) - 1,
                parseInt(zp[1], 10) - 1,
              ],
              this.material,
              1);
            triangle.materialName = materialName;
            triangles.push(triangle);
            break;
          }
        }
      });

      this.vertexes = vertexes;
      this.textureVertexes = textureVertexes;
      this.triangles = triangles;

      if (this.debug) {
        console.log(this);
      }

      return this;
    }).then((mesh) => {
      if (materialLib) {
        return this.loadMaterialLibrary(materialLib);
      } else {
        return new Map();
      }
    }).then((materials) => {
      this.materials = materials;
      this.triangles.forEach(tri => {
        if (tri.materialName) {
          tri.material = materials.get(tri.materialName) || this.material;
        }
      });
      return this;
    });
  }
}
