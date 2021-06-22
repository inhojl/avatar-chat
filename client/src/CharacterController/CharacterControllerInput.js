

export default class CharacterControllerInput {

  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false
    }
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 87: return this.keys.forward = true; // w
      case 65: return this.keys.left = true; // a
      case 83: return this.keys.backward = true; // s
      case 68: return this.keys.right = true; // d
      case 32: return this.keys.space = true; // space
      case 16: return this.keys.shift = true; // shift
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 87: return this.keys.forward = false; // w
      case 65: return this.keys.left = false; // a
      case 83: return this.keys.backward = false; // s
      case 68: return this.keys.right = false; // d
      case 32: return this.keys.space = false; // space
      case 16: return this.keys.shift = false; // shift
    }
  }

};

