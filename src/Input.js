export default class PhysicsEngine {
  constructor(dispatch) {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    this.keyMapping = {
      nop: 'nop',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
  }

  handleKeydown(event) {
    let map = this.keyMapping;
    let code = map[event.key] || map[event.code] || map.nop;
    if (!this.keys[code]) {
      this.keys[code] = true;
      //      console.log(`DOWN: ${code}`, this.keys);
    }
  }

  handleKeyup(event) {
    let map = this.keyMapping;
    let code = map[event.key] || map[event.code] || map.nop;
    if (this.keys[code]) {
      this.keys[code] = false;
      //      console.log(`UP: ${code}`, this.keys);
    }
  }
}
