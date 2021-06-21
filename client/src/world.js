import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import leftImg  from './assets/images/left.bmp';
import rightImg  from './assets/images/right.bmp';
import upImg  from './assets/images/up.bmp';
import downImg  from './assets/images/down.bmp';
import frontImg  from './assets/images/front.bmp';
import backImg  from './assets/images/back.bmp';

class World {

  constructor() {
    this.setRenderer();
    this.setCamera();
    this.setScene();
    this.setLighting();
    this.setOrbitControls();
    this.setSkybox();
    this.setPlane();
    this.setBoxes();
    this.render();
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.onWindowResize();
    }, false);
  }

  setCamera() {
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75, 20, 0);
  }

  setScene() {
    this.scene = new THREE.Scene();
  }

  setLighting() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene.add(light);

    light = new THREE.AmbientLight(0x101010);
    this.scene.add(light);
  }

  setOrbitControls() {
    const controls = new OrbitControls(
      this.camera, this.renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.update();
  }

  setSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      leftImg, // +X
      rightImg, // -X
      upImg, // +Y
      downImg, // -Y
      frontImg, // +Z
      backImg // -Z
    ]);
    this.scene.background = texture;
  }

  setPlane() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
      }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
  }

  setBoxes() {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
      }));
    box.position.set(0, 1, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene.add(box);

    for (let x = -8; x < 8; x++) {
      for (let y = -8; y < 8; y++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({
            color: 0x808080,
          }));
        box.position.set(Math.random() + x * 5, Math.random() * 4.0 + 2.0, Math.random() + y * 5);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.camera);
      this.render();
    });
  }

}

export default World;