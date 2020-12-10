export default class PhysicsEngine {
  constructor(dispatch) {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      forward: false,
      backward: false,
      turnLeft: false,
      turnRight: false,
      rotateXMinus: false,
      rotateXPlus: false,
      rotateYMinus: false,
      rotateYPlus: false,
      rotateZMinus: false,
      rotateZPlus: false,
    };

    this.keyMapping = {
      nop: 'nop',
      ArrowUp: 'rotateXMinus',
      ArrowDown: 'rotateXPlus',
      ArrowLeft: 'rotateYMinus',
      ArrowRight: 'rotateYPlus',
      KeyQ: 'rotateZMinus',
      KeyE: 'rotateZPlus',
      KeyW: 'forward',
      KeyS: 'backward',
      KeyA: 'left',
      KeyD: 'right',
      KeyX: 'up',
      KeyC: 'down',
    };
  }

  handleKeydown(event) {
    let map = this.keyMapping;
    let code = map[event.code] || map[event.key] || map.nop;
    if (!this.keys[code]) {
      this.keys[code] = true;
      //      console.log(`DOWN: ${code}`, this.keys);
    }
  }

  handleKeyup(event) {
    let map = this.keyMapping;
    let code = map[event.code] || map[event.key] || map.nop;
    if (this.keys[code]) {
      this.keys[code] = false;
      //      console.log(`UP: ${code}`, this.keys);
    }
  }
}
