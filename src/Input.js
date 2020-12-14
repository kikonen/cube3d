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
      ArrowUp: 'incY',
      ArrowDown: 'decY',
      ArrowLeft: 'decX',
      ArrowRight: 'incX',
      KeyX: 'decZ',
      KeyC: 'incZ',
      KeyQ: 'rotateXMinus',
      KeyE: 'rotateXPlus',
      KeyW: 'forward',
      KeyS: 'backward',
      KeyA: 'rotateYMinus',
      KeyD: 'rotateYPlus',
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
