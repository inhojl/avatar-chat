import * as THREE from 'three';

// Keeps camera fixed to player and follow them around
export default class ThirdPersonCamera {

  constructor(params) {
    this.params = params;
    this.camera = params.camera;

    this.currentPosition = new THREE.Vector3();
    this.currentLookat = new THREE.Vector3();
  }

  update(timeElapsed) {
    const idealOffset = this.calculateIdealOffset();
    const idealLookat = this.calculateIdealLookat();
    // Fill these in;

    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this.currentPosition.lerp(idealOffset, t);
    this.currentLookat.lerp(idealLookat, t);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat);

  }

  calculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this.params.target.rotation);
    idealOffset.add(this.params.target.position);
    return idealOffset;
  }

  calculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this.params.target.rotation);
    idealLookat.add(this.params.target.position);
    return idealLookat;
  }


}