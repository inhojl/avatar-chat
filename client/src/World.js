import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import leftImg  from './assets/images/skybox/left.bmp';
import rightImg  from './assets/images/skybox/right.bmp';
import upImg  from './assets/images/skybox/up.bmp';
import downImg  from './assets/images/skybox/down.bmp';
import frontImg  from './assets/images/skybox/front.bmp';
import backImg  from './assets/images/skybox/back.bmp';
import CharacterController from './CharacterController/CharacterController';
import ThirdPersonCamera from './ThirdPersonCamera/ThirdPersonCamera';
import { io } from 'socket.io-client';

class World {

  constructor() {
    this.setRenderer();
    this.setCamera();
    this.setScene();
    this.setLighting();
    // this.setOrbitControls();
    this.setSkybox();
    this.setPlane();
    this.setCharacter();

    this.setSocket();

    this.previousRenderTime = null;
    this.renderLoop();
  }

  setSocket() {
    io.connect('/');
  }

  setCharacter() {
    this.controls = new CharacterController({
      camera: this.camera,
      scene: this.scene
    })


    this.thirdPersonCamera = new ThirdPersonCamera({
      camera: this.camera,
      target: this.controls
    });
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
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
    this.camera.position.set(25, 10, 25);

  }

  setScene() {
    this.scene = new THREE.Scene();
  }

  setLighting() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(13, 20, -30);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 50;
    light.shadow.camera.right = -50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    this.scene.add(light);

    light = new THREE.AmbientLight(0x101010, 10);
    this.scene.add(light);
  }

  setOrbitControls() {
    const controls = new OrbitControls(
      this.camera, this.renderer.domElement);
    controls.target.set(0, 10, 0);
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
    texture.encoding = THREE.sRGBEncoding;
    this.scene.background = texture;
  }

  setPlane() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xEFEED6,
      }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
  }


  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderLoop() {
    requestAnimationFrame((time) => {
      if (this.previousRenderTime === null) {
        this.previousRenderTime = time;
      }
      this.renderLoop();

      this.renderer.render(this.scene, this.camera);
      this.step(time - this.previousRenderTime);
      this.previousRenderTime = time;
    });
  }

  step(timeElapsed) {
    const timeElapsedinSeconds = timeElapsed * 0.001;

    if (this.controls) this.controls.update(timeElapsedinSeconds);

    this.thirdPersonCamera.update(timeElapsedinSeconds);
  }

}

export default World;