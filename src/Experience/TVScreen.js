import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import Experience from "./Experience.js";
import { TabApi } from "tweakpane";

const SCREEN_SIZE = { w: 1280, h: 1024 };
const IFRAME_PADDING = 0;
const IFRAME_SIZE = {
  w: SCREEN_SIZE.w - IFRAME_PADDING,
  h: SCREEN_SIZE.h - IFRAME_PADDING,
};

const scaleX = 0.0033;
const scaleY = 0.0023;

export default class TVScreen {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.cssScene = this.experience.cssScene;
    this.scene = this.experience.scene;
    this.world = this.experience.world;
    this.time = this.experience.time;
    this.mouse = this.experience.mouse;
    this.raycaster = this.experience.raycaster;
    this.camera = this.experience.camera;

    this.screenSize = new THREE.Vector2(SCREEN_SIZE.w, SCREEN_SIZE.h);
    this.position = new THREE.Vector3(4.2, 2.671, 1.834);
    this.rotation = new THREE.Euler(0, -Math.PI * 0.5, 0);
    this.object = null;

    this.mesh = null;

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: "tvScreen",
        expanded: false,
      });
    }

    this.createIframe();
    this.initializeScreenEvents();
  }

  /**
   * Creates a CSS plane and GL plane to properly occlude the CSS plane
   * @param element the element to create the css plane for
   */
  createCssPlane(element) {
    // Create CSS3D object
    const object = new CSS3DObject(element);

    // copy monitor position and rotation
    object.position.copy(this.position);
    object.rotation.copy(this.rotation);
    object.scale.setX(scaleX + 0.0002);
    object.scale.setY(scaleY + 0.0007);
    //object.scale.setZ(0.00424);

    // Add to CSS scene
    this.object = object;
    this.cssScene.add(this.object);

    // Create GL plane
    const material = new THREE.MeshLambertMaterial();
    material.side = THREE.DoubleSide;
    material.opacity = 0;
    material.transparent = true;
    // NoBlending allows the GL plane to occlude the CSS plane
    material.blending = THREE.NoBlending;

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(
      this.screenSize.width,
      this.screenSize.height
    );

    // Create the GL plane mesh
    const mesh = new THREE.Mesh(geometry, material);

    // Copy the position, rotation and scale of the CSS plane to the GL plane
    mesh.position.copy(object.position);
    mesh.rotation.copy(object.rotation);
    mesh.scale.setY(scaleY);
    mesh.scale.setX(scaleX);

    mesh.name = "tv-screen";

    this.mesh = mesh;

    this.array = [];

    // Add to gl scene
    this.scene.add(this.mesh);

    if (this.debug) {
      this.debugFolder.addInput(this.object.position, "x", {
        label: "positionX",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.object.position, "y", {
        label: "positionY",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.object.position, "z", {
        label: "positionZ",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.object.scale, "z", {
        label: "scaleZ",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });

      this.debugFolder.addInput(this.object.scale, "y", {
        label: "scaleY",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });

      this.debugFolder.addInput(this.object.scale, "x", {
        label: "scaleX",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });

      //mesh
      this.debugFolder.addInput(this.mesh.position, "x", {
        label: "positionXMesh",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.mesh.position, "y", {
        label: "positionYMesh",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.mesh.position, "z", {
        label: "positionZMesh",
        min: -5,
        max: 5,
        step: 0.001,
      });

      this.debugFolder.addInput(this.mesh.scale, "z", {
        label: "scaleZMesh",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });

      this.debugFolder.addInput(this.mesh.scale, "y", {
        label: "scaleYMesh",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });

      this.debugFolder.addInput(this.mesh.scale, "x", {
        label: "scaleXMesh",
        min: 0.001,
        max: 1,
        step: 0.0001,
      });
    }
  }

  initializeScreenEvents() {
    document.addEventListener(
      "mousemove",
      (event) => {

        if (this?.mouse?.rayCoords) {
          this.raycaster.setFromCamera(this.mouse.rayCoords, this.camera.instance);

          const intersects = this.raycaster.intersectObjects(
            this.scene.children,
            false
          );

          if (intersects.length > 0 && intersects[0].object.name === "tv-screen") {
            // var target = new THREE.Vector3()
            // this.object.getWorldPosition(target)
            // console.log( intersects[0].object)
            // console.log(target)
            event.inTVScreen = true;
          }
        }
        

        this.inTVScreen = event.inTVScreen;

        if (this.inTVScreen && !this.prevInTV) {
          //console.log("enterTV");
          this.camera.trigger("enterTV");
        }

        if (!this.inTVScreen && this.prevInTV && !this.mouseClickInProgress) {
          this.camera.trigger("leftTV");
        }

        if (!this.inTVScreen && this.mouseClickInProgress && this.prevInTV) {
          this.shouldLeaveTV = true;
        } else {
          this.shouldLeaveTV = false;
        }

        this.experience.mouse.trigger("mousemove", [event]);

        this.prevInTV = this.inTVScreen;
      },
      false
    );
    document.addEventListener(
      "mousedown",
      (event) => {
        this.inTVScreen = event.inTVScreen;
        this.experience.mouse.trigger("mousedown", [event]);

        this.mouseClickInProgress = true;
        this.prevInTV = this.inTVScreen;
      },
      false
    );
    document.addEventListener(
      "mouseup",
      (event) => {
        // @ts-ignore
        this.inTVScreen = event.inTVScreen;
        this.experience.mouse.trigger("mouseup", [event]);

        if (this.shouldLeaveTV) {
          this.camera.trigger("leftMonitor");
          this.shouldLeaveTV = false;
        }

        this.mouseClickInProgress = false;
        this.prevInTV = this.inTVScreen;
      },
      false
    );
  }

  /**
   * Creates the iframe for the computer screen
   */
  createIframe() {
    // Create container
    const container = document.createElement("div");
    container.style.width = this.screenSize.width + "px";
    container.style.height = this.screenSize.height + "px";
    container.style.opacity = "1";
    container.style.background = "black";
    const id = "njCDZWTI-xg";

    // Create iframe
    const iframe = document.createElement("iframe");

    // Bubble mouse move events to the main application, so we can affect the camera
    iframe.onload = () => {
      if (iframe.contentWindow) {
        window.addEventListener("message", (event) => {
          var evt = new CustomEvent(event.data.type, {
            bubbles: true,
            cancelable: false,
          });

          evt.inTVScreen = true;
          if (event.data.type === "mousemove") {
            var clRect = iframe.getBoundingClientRect();
            const { top, left, width, height } = clRect;
            const widthRatio = width / IFRAME_SIZE.w;
            const heightRatio = height / IFRAME_SIZE.h;

            evt.clientX = Math.round(event.data.clientX * widthRatio + left);
            evt.clientY = Math.round(event.data.clientY * heightRatio + top);
          } else if (event.data.type === "keydown") {
            evt.key = event.data.key;
          } else if (event.data.type === "keyup") {
            evt.key = event.data.key;
          }

          iframe.dispatchEvent(evt);
        });
      }
    };

    // Set iframe attributes
    iframe.src =
      "https://docs.google.com/presentation/d/e/2PACX-1vQKfoSVokn2S4x9aXKfQ6UTxArGSSMVa_hgW4URHTaFtKKVgA45_ZA_XOfMTcXBCjh9fAM9G24D-b1e/embed?start=true&loop=true&delayms=2000";
    /**
     * Use dev server is query params are present
     *
     * Warning: This will not work unless the dev server is running on localhost:3000
     * Also running the dev server causes browsers to freak out over unsecure connections
     * in the iframe, so it will flag a ton of issues.
     */
    const urlParams = new URLSearchParams(window.location.search);
    // if (urlParams.has('dev')) {
    //     iframe.src = 'http://localhost:3000/';
    // }
    iframe.style.width = this.screenSize.width + "px";
    iframe.style.height = this.screenSize.height + "px";
    iframe.style.padding = IFRAME_PADDING + "px";
    iframe.style.boxSizing = "border-box";
    iframe.style.opacity = "1";
    iframe.className = "jitter";
    iframe.id = "computer-screen";
    iframe.frameBorder = "0";
    iframe.title = "HeffernanOS";

    // Add iframe to container
    container.appendChild(iframe);

    // Create CSS plane
    this.createCssPlane(container);
  }

  setAnimation() {}

  update() {}
}
