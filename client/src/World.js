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
import grassTexture from './assets/images/textures/grassTexture.jpg'
import NetworkCharacterController from './NetworkCharacterController/NetworkCharacterController';
import ThirdPersonCamera from './ThirdPersonCamera/ThirdPersonCamera';
import { io } from 'socket.io-client';

class World {

  constructor() {
    this.username = '';
    this.setRenderer();
    this.setCamera();
    this.setScene();
    this.setLighting();
    // this.setOrbitControls();
    this.setSkybox();
    this.setPlane();
   // this.setCharacter();

    this.setSocket();
    this.setChat();

    this.previousRenderTime = null;
    this.renderLoop();
  }

  setChat = () => {
    const form = document.getElementById('chatbox__form')
    const self = this;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      self.socket.emit('chat', { message: e.target.children[0].value, username: self.username});
      e.target.children[0].value = '';
      
    }, false)

    const usernameForm = document.getElementById('login__form');
    
    usernameForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const input = document.getElementById('login__input')

      if (input.value.trim().length > 0) {
        self.username = input.value;
        const loginScreen = document.getElementById('login')
        loginScreen.style.display = 'none';
      }
    })


  }

  setSocket() {
    this.players = {}
    this.mainPlayer = null;

    this.socket = io.connect('/');
    this.socket.on('receive starting position', ([ pos, character]) => {
      this.setCharacter(pos, character)
    })

    this.socket.on('pos', (data) => {
      const [ id, pos, state, rotation, character ] = data;
      
      if (!(id in this.players)) {
        const player = new NetworkCharacterController({
          position: pos,
          scene: this.scene,
          character
        })
        this.players[id] = player;
      } else {
        if (this.players[id].target){
          this.players[id].target.position.set(...pos);
          this.players[id].stateMachine.setState(state);
          this.players[id].target.quaternion.set(...rotation);
        }
      }

    })

    this.socket.on('user disconnected', (id) => {
      if (this.players[id]) {
        this.scene.remove(this.players[id].target);
        delete this.players[id]
      }
    })

    this.socket.on('chat', ({ username, message }) => {
      const chatList = document.getElementById('chatbox__chat');
      const newChat = document.createElement('li')
      newChat.innerHTML = `<span class='${this.username === username ? 'username' : 'friend'}'>${username}</span>: ${message}`;
        
      
        const childrenCopy = Array.from(chatList.children).map(c => `${c.innerHTML}`)
        childrenCopy.push(`<span class='${this.username === username ? 'username' : 'friend'}'>${username}</span>: ${message}`)
        chatList.innerHTML = '';
        childrenCopy.slice().reverse().forEach(c => {
          const li = document.createElement('li')
          li.innerHTML = c
          chatList.append(li)
        })




    })

  }

  setCharacter(position, character) {
    this.controls = new CharacterController({
      camera: this.camera,
      scene: this.scene,
      position,
      character,
      world: this
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
    this.renderer.gammaFactor = 2.2;
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
    light.position.set(30, 40, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.00001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 3000.0;
    light.shadow.camera.left = 300;
    light.shadow.camera.right = -300;
    light.shadow.camera.top = 300;
    light.shadow.camera.bottom = -300;
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
    const texture = new THREE.TextureLoader().load(grassTexture)
    texture.anisotropy = 32
texture.repeat.set(100, 100)
texture.wrapT = THREE.RepeatWrapping
texture.wrapS = THREE.RepeatWrapping
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshStandardMaterial({
        map: texture
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

    if (this.controls) {
      this.controls.update(timeElapsedinSeconds);
      if (this.controls.stateMachine.currentState) {
        this.socket.emit('pos', [
          [ ...this.controls.position.toArray() ], 
          this.controls.stateMachine.currentState.name,
          this.controls.rotation.toArray()
        ])
      }
    }

    if (Object.keys(this.players).length > 0) {
      Object.values(this.players).forEach(player => {
        player.update(timeElapsedinSeconds);
      })
    }


    if (this.thirdPersonCamera) {
      
      this.thirdPersonCamera.update(timeElapsedinSeconds);
    }
  }

}

export default World;