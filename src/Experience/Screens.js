import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import Experience from "./Experience.js";

const debounce = (fn, delay) => {
  let timeout;

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const TV = "tv";
const MONITOR = "monitor";

const TV_SCREEN_SIZE = { w: 1280, h: 1024 };
const MONITOR_SCREEN_SIZE = { w: 1280, h: 1024 };

const tvScreenX = 0.0033;
const tvScaleY = 0.0023;

const monitorScaleX = 0.001875;
const monitorScaleY = 0.00134;

export default class Screens {
  constructor(chair) {
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.cssScene = this.experience.cssScene;
    this.cssSceneMonitor = this.experience.cssSceneMonitor;
    this.scene = this.experience.scene;
    this.world = this.experience.world;
    this.time = this.experience.time;
    this.mouse = this.experience.mouse;
    this.sizes = this.experience.sizes
    //this.raycaster = this.experience.raycaster;
    this.camera = this.experience.camera;

    this.screenSize = new THREE.Vector2(TV_SCREEN_SIZE.w, TV_SCREEN_SIZE.h);
    this.cameraControls = this.experience.renderer.cameraControls;
    this.clock = this.experience.renderer.clock;

    //botones
    this.btnTv = document.getElementById("button-tv");
    this.btnMonitor = document.getElementById("button-monitor");
    this.btnRoom = document.getElementById("button-cuarto");

    this.screens = {
      tv: {
        css: this.cssScene,
        size: { ...TV_SCREEN_SIZE },
        screenSize: new THREE.Vector2(TV_SCREEN_SIZE.w, TV_SCREEN_SIZE.h),
        position: new THREE.Vector3(4.2, 2.671, 1.834),
        rotation: new THREE.Euler(0, -Math.PI * 0.5, 0),
        objectScale: { x: tvScreenX + 0.0002, y: tvScaleY + 0.0007 },
        meshScale: { x: tvScreenX, y: tvScaleY },
        object: null,
        mesh: null,
        name: TV,
        src: "https://docs.google.com/presentation/d/e/2PACX-1vQKfoSVokn2S4x9aXKfQ6UTxArGSSMVa_hgW4URHTaFtKKVgA45_ZA_XOfMTcXBCjh9fAM9G24D-b1e/embed?start=true&loop=true&delayms=2000",
      },
      monitor: {
        css: this.cssScene,
        size: { ...MONITOR_SCREEN_SIZE },
        screenSize: new THREE.Vector2(
          MONITOR_SCREEN_SIZE.w,
          MONITOR_SCREEN_SIZE.h
        ),
        position: new THREE.Vector3(0.302, 3.417, -4.502),
        rotation: new THREE.Euler(0, 0, 0),
        objectScale: { x: monitorScaleX, y: monitorScaleY },
        meshScale: { x: monitorScaleX, y: monitorScaleY },
        object: null,
        mesh: null,
        name: MONITOR,
        src: "https://os.diegoygaby.com/",
      },
    };

    this.createIframe(TV);
    this.createIframe(MONITOR);

    this.autoRotate = true;
    this.rotateToRight = true;

    this.chair = chair;

    this._centerPosition = new THREE.Vector3();
    this._normal = new THREE.Vector3();
    this._cameraPosition = new THREE.Vector3();
    this.isMobile = this.sizes.width < 1024

    

    this.initializeScreenEvents();
  }


  fitToRect = ( rect, number ) => {

    const rectWidth = rect.geometry.parameters.width;
    const rectHeight = rect.geometry.parameters.height;
  
    //rect.updateMatrixWorld();
    const rectCenterPosition = this._centerPosition.copy( rect.position );
    const rectNormal = this._normal.set( 0, 0, 1 ).applyQuaternion( rect.quaternion );
    const distance = this.cameraControls.getDistanceToFitBox( rectWidth, rectHeight, 0 );
    console.log(distance, rectCenterPosition)
    const cameraPosition = this._cameraPosition.copy( rectNormal ).multiplyScalar(  distance/number ).add( rectCenterPosition );
  
    this.cameraControls.setLookAt(
      cameraPosition.x, cameraPosition.y, cameraPosition.z,
      rectCenterPosition.x, rectCenterPosition.y, rectCenterPosition.z,
      true,
    );
  
  }

  async transitionToTV() {
    this.autoRotate = false;
    //await this.cameraControls.fitToSphere(this.screens.tv.mesh, true);
    const num = this.isMobile ? 300 : 260
    this.fitToRect(this.screens.tv.mesh, num)
  }

  async transitionToMonitor() {
    this.autoRotate = false;
    //await this.cameraControls.fitToBox(this.screens.monitor.mesh, true);
    const num = this.isMobile ? 650 : 500
    this.fitToRect(this.screens.monitor.mesh, num)
    this.chair.model.group.visible = false;
  }

  async resetPosition() {
    this.chair.model.group.visible = true;
    this.autoRotate = true;
    await this.cameraControls.reset(true);
  }

  /**
   * Creates a CSS plane and GL plane to properly occlude the CSS plane
   * @param element the element to create the css plane for
   */
  createCssPlane(element, screenName) {
    const screen = this.screens[screenName];

    // Create CSS3D object
    const object = new CSS3DObject(element);

    // copy monitor position and rotation
    object.position.copy(screen.position);
    object.rotation.copy(screen.rotation);
    object.scale.setX(screen.objectScale.x);
    object.scale.setY(screen.objectScale.y);

    // Add to CSS scene
    this.screens[screenName].object = object;
    screen.css.add(this.screens[screenName].object);

    // Create GL plane
    const material = new THREE.MeshLambertMaterial();
    material.side = THREE.DoubleSide;
    material.opacity = 0;
    material.transparent = true;
    // NoBlending allows the GL plane to occlude the CSS plane
    material.blending = THREE.NoBlending;

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(
      screen.screenSize.width,
      screen.screenSize.height
    );

    // Create the GL plane mesh
    const mesh = new THREE.Mesh(geometry, material);

    // Copy the position, rotation and scale of the CSS plane to the GL plane
    mesh.position.copy(object.position);
    mesh.rotation.copy(object.rotation);
    mesh.scale.setY(screen.meshScale.y);
    mesh.scale.setX(screen.meshScale.x);
    mesh.name = screen.name;

    this.screens[screenName].mesh = mesh;

    // Add to gl scene
    this.scene.add(this.screens[screenName].mesh);
  }

  movement() {
    return debounce((event) => {
      const id = event.target.id;

      if (id === TV) {
        event.seenScreen = TV;
      } else if (id === MONITOR) {
        event.seenScreen = MONITOR;
      } else {
        event.seenScreen = null;
      }

      this.seenScreen = event.seenScreen;
      this.inTVScreen = event.seenScreen === TV;
      this.inComputer = event.seenScreen === MONITOR;

      if (this.inTVScreen && (this.prevSeen !== TV || this.prevSeen === null)) {
        //this.camera.trigger("enterTV");
        console.log("entering tv");
        this.transitionToTV();
      }

      if (
        this.inComputer &&
        (this.prevSeen !== MONITOR || this.prevSeen === null)
      ) {
        //this.camera.trigger("enterMonitor");
        this.transitionToMonitor();
      }

      if (
        !this.inTVScreen &&
        this.prevSeen === TV &&
        !this.mouseClickInProgress
      ) {
        //this.camera.trigger("leftTV");
        this.resetPosition();
      }

      if (
        !this.inComputer &&
        this.prevSeen === MONITOR &&
        !this.mouseClickInProgress
      ) {
        //this.camera.trigger("leftMonitor");
        this.resetPosition();
      }

      if (this.prevSeen === TV && this.mouseClickInProgress) {
        if (!this.inTVScreen) {
          this.shouldLeaveTV = true;
        } else {
          this.shouldLeaveTV = false;
        }
      }

      if (this.prevSeen === MONITOR && this.mouseClickInProgress) {
        if (!this.inComputer) {
          this.shouldLeaveComputer = true;
        } else {
          this.shouldLeaveComputer = false;
        }
      }

      //this.experience.mouse.trigger("mousemove", [event]);

      this.prevSeen = this.seenScreen;
    }, 50);
  }

  downStart = () => {
    return (event) => {
      this.seenScreen = event.seenScreen;
      this.inTVScreen = event.seenScreen === TV;
      this.inComputer = event.seenScreen === MONITOR;

      //this.experience.mouse.trigger("mousedown", [event]);
      this.mouseClickInProgress = true;

      this.prevSeen = this.seenScreen;
    };
  };

  upEnd = () => {
    return (event) => {
      this.seenScreen = event.seenScreen;
      this.inTVScreen = event.seenScreen === TV;
      this.inComputer = event.seenScreen === MONITOR;

      //this.experience.mouse.trigger("mouseup", [event]);

      if (this.shouldLeaveTV) {
        //this.camera.trigger("leftTV");
        this.resetPosition();
        this.shouldLeaveTV = false;
      } else if (this.shouldLeaveComputer) {
        //this.camera.trigger("leftMonitor");
        this.resetPosition();
        this.shouldLeaveComputer = false;
      }

      this.mouseClickInProgress = false;
      this.prevSeen = this.seenScreen;
    };
  };

  initializeScreenEvents() {
    document.addEventListener("mousemove", this.movement(), false);

    document.addEventListener("touchmove", this.movement(), false);

    document.addEventListener("mousedown", this.downStart(), false);

    document.addEventListener("touchstart", this.downStart(), false);

    document.addEventListener("mouseup", this.upEnd(), false);

    document.addEventListener("touchend", this.upEnd(), false);

    this.btnTv.addEventListener("click", () => {
      this.transitionToTV();
    });

    this.btnMonitor.addEventListener("click", () => {
      this.transitionToMonitor();
    });

    this.btnRoom.addEventListener("click", () => {
      this.resetPosition();
    });
  }

  /**
   * Creates the iframe for the computer screen
   */
  createIframe(screenName) {
    const screen = this.screens[screenName];
    // Create container
    const container = document.createElement("div");
    container.style.width = screen.screenSize.width + "px";
    container.style.height = screen.screenSize.height + "px";
    container.style.opacity = "1";
    container.style.background = "black";

    // Create iframe
    const iframe = document.createElement("iframe");

    // Bubble mouse move events to the main application, so we can affect the camera
    // iframe.onload = () => {
    //   if (iframe.contentWindow) {
    //     window.addEventListener("message", (event) => {
    //       var evt = new CustomEvent(event.data.type, {
    //         bubbles: true,
    //         cancelable: false,
    //       });

    //       evt.seenScreen = screen.name;
    //       evt.inTVScreen = event.seenScreen === TV;
    //       evt.inComputer = event.seenScreen === MONITOR;
    //       console.log('--------->>>>', screen.name, evt.seenScreen, evt.inTVScreen, evt.inComputer)
    //       if (event.data.type === "mousemove") {
    //         var clRect = iframe.getBoundingClientRect();

    //         const { top, left, width, height } = clRect;
    //         const widthRatio = width / screen.size.w;
    //         const heightRatio = height / screen.size.h;

    //         evt.clientX = Math.round(event.data.clientX * widthRatio + left);
    //         evt.clientY = Math.round(event.data.clientY * heightRatio + top);
    //       } else if (event.data.type === "keydown") {
    //         evt.key = event.data.key;
    //       } else if (event.data.type === "keyup") {
    //         evt.key = event.data.key;
    //       }

    //       iframe.dispatchEvent(evt);
    //     });
    //   }
    // };

    // Set iframe attributes
    iframe.src = screen.src;
    iframe.style.width = screen.screenSize.width + "px";
    iframe.style.height = screen.screenSize.height + "px";
    iframe.style.padding = "0px";
    iframe.style.boxSizing = "border-box";
    iframe.style.opacity = "1";
    iframe.className = "jitter";
    iframe.id = screen.name;
    iframe.style.border = "0px";
    iframe.title = screen.name;

    // Add iframe to container
    container.appendChild(iframe);

    // Create CSS plane
    this.createCssPlane(container, screenName);
  }

  setAnimation() {}


  //angle -1.6647003920688712 newAngle -1.6648400184091607

  update() {
    if (this.autoRotate) {
      const delta = this.clock.getDelta();

      const angle = this.cameraControls.azimuthAngle
      const diff = (20 * delta * THREE.MathUtils.DEG2RAD)
      let newAngle = angle;

      if (angle <= -1.66) {
        this.rotateToRight = true;
      } else if (angle >= 0.02) {
        this.rotateToRight = false;
      }

      if (newAngle) {
      this.cameraControls.azimuthAngle = this.rotateToRight ? angle + diff : angle - diff;
      }
    }
  }
}
