export default class Texture {
  constructor(image) {
    this.image = image;
    this.w = image.width;
    this.h = image.height;

    this.colors = [];
  }

  /**
   * https://www.tutorialspoint.com/how-to-get-image-data-url-in-javascript
   */
  getImageData() {
    if (!this.imageData) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = this.w;
      canvas.height = this.h;
      ctx.drawImage(this.image, 0, 0);

      this.imageData = ctx.getImageData(0, 0, this.w, this.h);
    }
    return this.imageData;
  }

  getBuffer32() {
    if (!this.buffer32) {
      let buffer = new ArrayBuffer(this.getImageData().data.length);
      this.buffer32 = new Uint32Array(this.buffer);
    }
    return this.buffer32;
  }

  /**
   * @return RGBA
   */
  getRGBA(u, v) {
    let sw = this.w; //200;
    let sh = this.h; //200;

    let x = Math.round(sw * u);
    let y = Math.round(sh * v);

    let data = this.getImageData().data;
    let base = (this.w * 4) * y + x * 4;

    let r = data[base];
    let g = data[base + 1];
    let b = data[base + 2];
    let a = data[base + 3];

    return (r << 24) | (g << 16) | (b << 8) | a;
  }

  /**
   * @return RGBA
   */
  getColor(u, v) {
    let sw = this.w; //200;
    let sh = this.h; //200;

    let x = Math.round(sw * u);
    let y = Math.round(sh * v);

    let idx = this.w * y + x;
    let color = this.colors[idx];
    if (!color) {
      let data = this.getImageData().data;
      let base = (this.w * 4) * y + x * 4;

      color = [
        data[base],
        data[base + 1],
        data[base + 2],
        data[base + 3],
      ];

      this.colors[idx] = color;
    }
    return color;
  }
}
