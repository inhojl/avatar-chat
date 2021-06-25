

export default class CharacterControllerInput {

  constructor(world) {
    this.world = world
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
    const input = document.getElementById('chatbox__input')

    const loginInput = document.getElementById('login__input')

    if (this.world.username && input !== document.activeElement) {
      switch (event.keyCode) {
        case 87: return this.keys.forward = true; // w
        case 65: return this.keys.left = true; // a
        case 83: return this.keys.backward = true; // s
        case 68: return this.keys.right = true; // d
        case 32: return this.keys.space = true; // space
        case 16: return this.keys.shift = true; // shift
      }

    }
  }

  onKeyUp(event) {
    const input = document.getElementById('chatbox__input')


    if (this.world.username && input !== document.activeElement) {
      switch (event.keyCode) {
        case 87: return this.keys.forward = false; // w
        case 65: return this.keys.left = false; // a
        case 83: return this.keys.backward = false; // s
        case 68: return this.keys.right = false; // d
        case 32: return this.keys.space = false; // space
        case 16: return this.keys.shift = false; // shift
      }
    }
  }

};

