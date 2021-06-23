import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import CharacterFiniteStateMachine from '../CharacterController/FiniteStateMachine/CharacterFiniteStateMachine';
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
      this.target.position.set(...this.params.position);
      this.params.scene.add(this.target);
      this.mixer = new THREE.AnimationMixer(this.target);
      
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

