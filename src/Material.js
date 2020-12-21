const COLOR = [150, 150, 150];

export default class Material {
  constructor(name, color) {
    this.name = name;
    this.color = color;

    this.ns = null;
    this.ka = null;
    this.kd = null;
    this.ks = null;
    this.ke = null;
    this.ni = null;
    this.d = null;
    this.illum = null;
    this.map_kd = null;
  }

  getColor(lightAmount) {
    let kd = this.kd;
    let color = null;
    if (kd) {
      color = [Math.round(kd[0] * 255), Math.round(kd[1] * 255), Math.round(kd[2] * 255)];
    }

    if (!color) {
      color = this.color || COLOR;
    }

    let shaded = color.map(c => {
      return Math.max(Math.floor(c + (c / 2) * lightAmount), 0);
    });

    return `rgb(
      ${shaded[0]},
      ${shaded[1]},
      ${shaded[2]})`;
  }

  getTexture(lightAmount) {
    return this.textureData;
  }
}
