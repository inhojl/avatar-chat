import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import CharacterControllerInput from './CharacterControllerInput';
import CharacterFiniteStateMachine from './FiniteStateMachine/CharacterFiniteStateMachine';
import clericFbx from '../assets/fbx/cleric.fbx';
import clericTexture from '../assets/images/textures/clericTexture.png';
import monkFbx from '../assets/fbx/monk.fbx';
import monkTexture from '../assets/images/textures/monkTexture.png';
import rogueFbx from '../assets/fbx/rogue.fbx';
import rogueTexture from '../assets/images/textures/rogueTexture.png';
import warriorFbx from '../assets/fbx/warrior.fbx';
import warriorTexture from '../assets/images/textures/warriorTexture.png';
import wizardFbx from '../assets/fbx/wizard.fbx';
import wizardTexture from '../assets/images/textures/wizardTexture.png';


export default class CharacterController {

  constructor(params) {
    this.params = params;
    this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3();

    this.animations = {};
    this.input = new CharacterControllerInput();
    this.stateMachine = new CharacterFiniteStateMachine(this.animations);

    this.loadModels();
  }

  get rotation() {
    if (!this.target) return new THREE.Quaternion();
    return this.target.quaternion;
  }

  loadModels() {
    const loader = new FBXLoader();
    let fbxPath;
    let texturePath;
    switch(this.params.character) {
      case 'cleric':
        fbxPath = clericFbx;
        texturePath = clericTexture;
        break;
      case 'monk':
        fbxPath = monkFbx;
        texturePath = monkTexture;
        break;
      case 'rogue':
        fbxPath = rogueFbx;
        texturePath = rogueTexture;
        break;
      case 'warrior':
        fbxPath = warriorFbx;
        texturePath = warriorTexture;
        break;
      case 'wizard':
        fbxPath = wizardFbx;
        texturePath = wizardTexture;
        break;
    }


    loader.load(fbxPath, (fbx) => {
      fbx.scale.setScalar(0.05);
      fbx.traverse((c) => {
        c.castShadow = true;
        if (c.geometry && c.geometry.attributes && c.geometry.attributes.uv) {
          c.material.map = new THREE.TextureLoader().load(texturePath);
        }
      })

      this.target = fbx;
      console.log(this.target, this.params)
      this.target.position.set(...this.params.position);
      console.log(fbx.animations)


      this.params.scene.add(this.target);

      this.mixer = new THREE.AnimationMixer(this.target);

      // this.manager = new THREE.LoadingManager();
      // this.manager.onLoad = () => {
      // }
      console.log(this.rotation)


      
      const inputActions = [ 'walk', 'run'];
      switch(this.params.character) {
        case 'cleric':
          inputActions.push('attack_idle');
          break;
        case 'monk':
          inputActions.push('idle_attacking');
          break;
        case 'rogue':
          inputActions.push('attacking_idle');
          break;
        case 'warrior':
          inputActions.push('idle_attacking')
          break;
        case 'wizard':
          inputActions.push('idle_attacking')
          break;
      }
  


      for (const inputAction of inputActions) {
        const clip = fbx.animations.find((animation) => animation.name.toLowerCase().includes(inputAction))

        const action = this.mixer.clipAction(clip);
        if (inputAction.includes('idle')) {
          this.animations['idle'] = {
            clip,
            action
          }
        } else {
          this.animations[inputAction] = {
            clip,
            action
          }
        }
      }
      this.stateMachine.setState('idle');

    })
  }

  update(timeInSeconds) {
    // if target to render doesn't exist
    if (!this.stateMachine.currentState) return;

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
    const Q = new THREE.Quaternion();
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

    forward.multiplyScalar(velocity.z * timeInSeconds * 1.8);
    sideways.multiplyScalar(velocity.x * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this.position.copy(controlObject.position);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }

  }

};

