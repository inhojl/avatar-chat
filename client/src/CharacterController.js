import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import clericFbx from './assets/fbx/cleric.fbx';
import clericTexture from './assets/images/textures/clericTexture.png';

// loads fbx file along with animation
class CharacterController {

  constructor(params) {
    this.params = params;
    this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.animations = {};
    this.input = new CharacterControllerInput();
    this.stateMachine = new CharacterFiniteStateMachine(this.animations);

    this.loadModels();
  }

  loadModels() {
    const loader = new FBXLoader();
    loader.load(clericFbx, (fbx) => {
      fbx.scale.setScalar(0.05);
      fbx.traverse((c) => {
        c.castShadow = true;
        if (c.geometry && c.geometry.attributes && c.geometry.attributes.uv) {
          c.material.map = new THREE.TextureLoader().load(clericTexture);
        }
      })

      this.target = fbx;
      this.params.scene.add(this.target);

      this.mixer = new THREE.AnimationMixer(this.target);

      this.manager = new THREE.LoadingManager();
      this.manager.onLoad = () => {
        this.stateMachine.setState('idle');
      }

      const inputActions = [ 'walk', 'run', 'idle' ];
      for (const inputAction of inputActions) {
        const clip = fbx.animations.find((animation) => animation.name.toLowerCase().includes(inputAction))
        const action = this.mixer.clipAction(clip);
        this.animations[action] = {
          clip,
          action
        }
      }

    })
  }

  update(timeInSeconds) {
    // if target to render doesn't exist
    if (!this.target) return;
    this.stateMachine.update(timeInSeconds, this.input);

    const velocity = this.velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this.decceleration.x,
      velocity.y * this.decceleration.y,
      velocity.z * this.decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z)
    );

    velocity.add(frameDecceleration);

    const controlObject = this.target;
    const Q = new THREE.Quarternion();
    const A = new THREE.Vector3();
    const R = controlObject.quaternion.clone();
    
    const acceleration = this.acceleration.clone();
    if (this.input.keys.shift) {
      acceleration.multiplyScalar(2.0);
    }

    if (this.input.keys.forward) velocity.z += acceleration.z * timeInSeconds;
    if (this.input.keys.backward) velocity.z -= acceleration.z * timeInSeconds;
    if (this.input.keys.left) {
      A.set(0,1,0);
      Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }
    if (this.input.keys.right) {
      A.set(0,1,0);
      Q.setFromAxisAngle(A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }

    controlObject.quaternion.copy(R);
    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    forward.multiplyScalar(velocity.z * timeInSeconds);
    sideways.multiplyScalar(velocity.x * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }

  }

};

class CharacterControllerInput {

  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false
    }
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
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



class FiniteStateMachine {
  constructor() {
    this.states = {};
    this.currentState = null;
  }

  addState(name, type) {
    this.states[name] = type;
  } 

  setState(name) {
    const prevState = this.currentState;

    // exit out of prev state if different
    if (prevState) {
      if (prevState.name === name) return;
      prevState.exit();
    }

    const state = new this.states[name](this);

    this.currentState = state;
    state.enter(prevState);
  }

  update(timeElapsed, input) {
    if (this.currentState) {
      this.currentState.update(timeElapsed, input);
    }
  }

}

class CharacterFiniteStateMachine extends FiniteStateMachine {
  constructor(animations) {
    super();
    this.animations = animations;
    this.addState('idle', IdleState);
    this.addState('walk', WalkState);
    this.addState('run', RunState);
  }
}

class IdleState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'idle'
  }

  enter(prevState) {
    const idleAction = this.parent.animations['idle'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
    }
    idleAction.play();
  }

  exit() {}

  update(_, input) {
    if (input.keys.forward || input.keys.backward) {
      this.parent.setState('walk');
    }
  }

}

class WalkState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'walk';
  }

  enter(prevState) {
    const currentAction = this.parent.animations['walk'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      currentAction.enabled = true;

      if (prevState.name === 'run') {
        const ratio = currentAction.getClip().duration / prevAction.getClip().duration;
        currentAction.time = prevAction.time * ratio;
      } else {
        currentAction.time = 0.0;
        currentAction.setEffectiveTimeScale(1.0);
        currentAction.setEffectiveWeight(1.0);
      }
      currentAction.crossFadeFrom(prevAction, 0.5, true);
    }
    currentAction.play();
  }

  exit() {}

  update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (input.keys.shift) {
        this.parent.setState('run');
      }
      return
    }
    this.parent.setState('idle');
  }
}

class RunState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'run';
  }

  enter(prevState) {
    const currentAction = this.parent.animations['run'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      currentAction.enabled = true;

      if (prevState.name === 'walk') {
        // ratio allows for smooth transition from walk to run
        const ratio = currentAction.getClip().duration / prevAction.getClip().duration;
        currentAction.time = prevAction.time * ratio;
      } else {
        currentAction.time = 0.0;
        currentAction.setEffectiveTimeScale(1.0);
        currentAction.setEffectiveWeight(1.0);
      }

      currentAction.crossFadeFrom(prevAction, 0.5, true);
    }
    currentAction.play()
  }

  exit() {}

  update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (!input.keys.shift) {
        this.parent.setState('walk');
      }
      return
    }
    this.parent.setState('idle');
  }
}