import * as THREE from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import Experience from "./Experience.js";

import CameraControls from "camera-controls";
CameraControls.install({ THREE: THREE });

export default class Renderer {
  constructor(_options = {}) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.debug = this.experience.debug;
    this.stats = this.experience.stats;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.cssScene = this.experience.cssScene;
    this.cssSceneMonitor = this.experience.cssSceneMonitor;

    this.usePostprocess = false;

    this.setInstance();

    this.clock = new THREE.Clock();
    //this.setPostProcess()
  }

  setInstance() {
    this.clearColor = "#010101";

    // Renderer
    this.instance = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.instance.domElement.style.position = "absolute";
    this.instance.domElement.style.zIndex = "1px";
    this.instance.domElement.style.top = 0;
    this.instance.domElement.style.left = 0;
    this.instance.domElement.style.width = "100%";
    this.instance.domElement.style.height = "100%";

    // this.instance.setClearColor(0x414141, 1)
    this.instance.setClearColor(this.clearColor, 1);
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // this.instance.physicallyCorrectLights = true
    // this.instance.gammaOutPut = true
    this.instance.outputEncoding = THREE.sRGBEncoding;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    // this.instance.shadowMap.enabled = false
    // this.instance.toneMapping = THREE.ReinhardToneMapping
    // this.instance.toneMappingExposure = 1.3

    // Set CSS Scene
    this.cssInstance = new CSS3DRenderer();
    this.cssInstance.setSize(this.sizes.width, this.sizes.height);
    this.cssInstance.domElement.style.position = "absolute";
    this.cssInstance.domElement.style.top = "0px";

    // Set second CSS Scene

    this.cssInstanceMonitor = new CSS3DRenderer();
    this.cssInstanceMonitor.setSize(this.sizes.width, this.sizes.height);
    this.cssInstanceMonitor.domElement.style.position = "absolute";
    this.cssInstanceMonitor.domElement.style.top = "0px";

    this.context = this.instance.getContext();

    // Add stats panel
    if (this.stats) {
      this.stats.setRenderPanel(this.context);
    }

    this.keyState = {
      shiftRight: false,
      shiftLeft: false,
      controlRight: false,
      controlLeft: false,
    };

    this.setControls();
  }

  updateConfig() {
    if (this.keyState.shiftRight || this.keyState.shiftLeft) {
      this.cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
    } else if (this.keyState.controlRight || this.keyState.controlLeft) {
      this.cameraControls.mouseButtons.left = CameraControls.ACTION.DOLLY;
    } else {
      this.cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    }
  }

  setControls() {
    CameraControls.install({ THREE: THREE });

    // {x: -61.87596863537802, y: 43.22383287186495, z: 63.91545209908646}
    //quaternion Quaternion {_x: -0.2078427068088845, _y: -0.3656292305098309, _z: -0.08412402066421035, _w: 0.9033492260307929, _onChangeCallback: ƒ}
    //rotation Euler {_x: -0.45228898035018705, _y: -0.7691863679129037, _z: 0, _order: 'YXZ', _

    /*
        //console.log(this.camera.instance.position, this.camera.instance.rotation, this.camera.instance.quaternion);
        Vector3 {x: -25.894612483982634, y: 5.775425100339495, z: 13.61198744050343} Euler {_x: -0.10853706937048445, _y: -1.0652513337923462, _z: 0, _order: 'YXZ', _onChangeCallback: ƒ} Quaternion {_x: -0.04672813592851346, _y: -0.5070494735635801, _z: -0.027543876837476975, _w: 0.8602084907278611, _onChangeCal

        */

    this.camera.instance.position.set(
      -14.894612483982634,
      9.775425100339495,
      6.61198744050343
    );
    this.camera.instance.rotation.set(
      -0.1332513337923462,
      0.00253706937048445,
      -2.734,
      "YXZ"
    );
    this.camera.instance.quaternion.set(
      -0.06672813592851346,
      -0.4170494735635801,
      -0.027543876837476975,
      0.6002084907278611
    );

    this.cameraControls = new CameraControls(
      this.camera.instance,
      this.instance.domElement
    );
    this.cameraControls.restThreshold = 0.01;

    this.cameraControls.setTarget(
      0.2096813147435687,
      2.302947307136894,
      -0.9105915068961434
    );

    document.addEventListener("keydown", (event) => {
      if (event.code === "ShiftRight") this.keyState.shiftRight = true;
      if (event.code === "ShiftLeft") this.keyState.shiftLeft = true;
      if (event.code === "ControlRight") this.keyState.controlRight = true;
      if (event.code === "ControlLeft") this.keyState.controlLeft = true;
      this.updateConfig();
    });

    document.addEventListener("keyup", (event) => {
      if (event.code === "ShiftRight") this.keyState.shiftRight = false;
      if (event.code === "ShiftLeft") this.keyState.shiftLeft = false;
      if (event.code === "ControlRight") this.keyState.controlRight = false;
      if (event.code === "ControlLeft") this.keyState.controlLeft = false;
      this.updateConfig();
    });
  }

  setPostProcess() {
    this.postProcess = {};

    /**
     * Render pass
     */
    this.postProcess.renderPass = new RenderPass(
      this.scene,
      this.camera.instance
    );

    /**
     * Effect composer
     */
    const RenderTargetClass =
      this.config.pixelRatio >= 2
        ? THREE.WebGLRenderTarget
        : THREE.WebGLMultisampleRenderTarget;
    // const RenderTargetClass = THREE.WebGLRenderTarget
    this.renderTarget = new RenderTargetClass(
      this.config.width,
      this.config.height,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding,
      }
    );
    this.postProcess.composer = new EffectComposer(
      this.instance,
      this.renderTarget
    );
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

    this.postProcess.composer.addPass(this.postProcess.renderPass);
  }

  resize() {
    // Instance
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    this.cssInstance.setSize(this.config.width, this.config.height);
    this.cssInstanceMonitor.setSize(this.config.width, this.config.height);

    // Post process
    // this.postProcess.composer.setSize(this.config.width, this.config.height)
    // this.postProcess.composer.setPixelRatio(this.config.pixelRatio)
  }

  update() {
    const delta = this.clock.getDelta();
    const updated = this.cameraControls.update(delta);
    if (this.stats) {
      this.stats.beforeRender();
    }

    // if(this.usePostprocess)
    // {
    //     this.postProcess.composer.render()
    // }

    this.instance.render(this.scene, this.camera.instance);

    if (this.cssInstance && this.cssScene) {
      this.cssInstance.render(this.cssScene, this.camera.instance);
    }

    if (this.cssInstanceMonitor && this.cssSceneMonitor) {
      this.cssInstanceMonitor.render(
        this.cssSceneMonitor,
        this.camera.instance
      );
    }

    if (this.stats) {
      this.stats.afterRender();
    }
  }

  destroy() {
    this.instance.renderLists.dispose();
    this.instance.dispose();
    this.cssInstance.renderLists.dispose();
    this.cssInstance.dispose();

    if (this.cssInstanceMonitor && this.cssSceneMonitor) {
      this.cssInstanceMonitor.renderLists.dispose();
      this.cssInstanceMonitor.dispose();
    }

    this.renderTarget.dispose();
    this.postProcess.composer.renderTarget1.dispose();
    this.postProcess.composer.renderTarget2.dispose();
  }
}
