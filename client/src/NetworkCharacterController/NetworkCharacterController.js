import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import CharacterFiniteStateMachine from '../CharacterController/FiniteStateMachine/CharacterFiniteStateMachine';
import clericFbx from '../assets/fbx/cleric.fbx';
import clericTexture from '../assets/images/textures/clericTexture.png';

export default class NetworkCharacterController {

  constructor(params) {
    this.params = params;
    this.position = new THREE.Vector3();

    this.animations = {};
    this.stateMachine = new CharacterFiniteStateMachine(this.animations);
    this.loadModels();
  }

  get rotation() {
    if (!this.target) return new THREE.Quaternion();
    return this.target.quaternion;
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
      this.target.position.set(...this.params.position);
      this.params.scene.add(this.target);

      this.mixer = new THREE.AnimationMixer(this.target);
      
      const inputActions = [ 'walk', 'run', 'idle' ];
      for (const inputAction of inputActions) {
        const clip = fbx.animations.find((animation) => animation.name.toLowerCase().includes(inputAction))
        const action = this.mixer.clipAction(clip);
        this.animations[inputAction] = {
          clip,
          action
        }
      }
      this.stateMachine.setState('idle');

    })
  }

  update(timeInSeconds) {
    // if target to render doesn't exist
    if (!this.stateMachine.currentState) return;

    if (this.target) {
      this.position.copy(this.target.position)
    }
    // this.stateMachine.setState(data.action)
    // this.target.position.set(data.position)

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }
  }

};

