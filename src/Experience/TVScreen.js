import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import Experience from './Experience.js'


const SCREEN_SIZE = { w: 320, h: 256 };
const IFRAME_PADDING = 0;
const IFRAME_SIZE = {
    w: SCREEN_SIZE.w - IFRAME_PADDING,
    h: SCREEN_SIZE.h - IFRAME_PADDING,
};

export default class TVScreen
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.cssScene = this.experience.cssScene
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time
        this.screenSize = new THREE.Vector2(SCREEN_SIZE.w, SCREEN_SIZE.h);
        this.position = new THREE.Vector3(4.2, 2.717, 1.630);
        this.rotation = new THREE.Euler(0, - Math.PI * 0.5, 0);

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'tvScreen',
                expanded: false
            })
        }

//        this.setModel()
        //this.setAnimation()
        this.createIframe()
    }

    setModel()
    {
        this.model = {}

        this.model.group = new THREE.Group()
        this.model.group.position.x = 4.2
        this.model.group.position.y = 2.717
        this.model.group.position.z = 1.630
        this.scene.add(this.model.group)

        this.model.texture = this.resources.items.threejsJourneyLogoTexture
        this.model.texture.encoding = THREE.sRGBEncoding

        this.model.geometry = new THREE.PlaneGeometry(4, 1, 1, 1)
        this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = new THREE.MeshBasicMaterial({
            transparent: true,
            premultipliedAlpha: true,
            map: this.model.texture
        })

        this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        this.model.mesh.scale.y = 0.359
        this.model.mesh.scale.z = 0.424
        this.model.group.add(this.model.mesh)

        // Debug
        if(this.debug)
        {
            this.debugFolder.addInput(
                this.model.group.position,
                'x',
                {
                    label: 'positionX', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.model.group.position,
                'y',
                {
                    label: 'positionY', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.model.group.position,
                'z',
                {
                    label: 'positionZ', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.model.mesh.scale,
                'z',
                {
                    label: 'scaleZ', min: 0.001, max: 1, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.model.mesh.scale,
                'y',
                {
                    label: 'scaleY', min: 0.001, max: 1, step: 0.001
                }
            )
        }
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

        // Add to CSS scene
        this.cssScene.add(object);

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
        mesh.scale.copy(object.scale);

        // Add to gl scene
        this.scene.add(mesh);
    }

    /**
     * Creates the iframe for the computer screen
     */
    createIframe() {
        // Create container
        const container = document.createElement('div');
        container.style.width = this.screenSize.width + 'px';
        container.style.height = this.screenSize.height + 'px';
        container.style.opacity = '1';
        container.style.background = '#1d2e2f';

        // Create iframe
        const iframe = document.createElement('iframe');

        // Bubble mouse move events to the main application, so we can affect the camera
        iframe.onload = () => {
            if (iframe.contentWindow) {
                window.addEventListener('message', (event) => {
                    var evt = new CustomEvent(event.data.type, {
                        bubbles: true,
                        cancelable: false,
                    });

                    // @ts-ignore
                    evt.inComputer = true;
                    if (event.data.type === 'mousemove') {
                        var clRect = iframe.getBoundingClientRect();
                        const { top, left, width, height } = clRect;
                        const widthRatio = width / IFRAME_SIZE.w;
                        const heightRatio = height / IFRAME_SIZE.h;

                        evt.clientX = Math.round(
                            event.data.clientX * widthRatio + left
                        );
                        evt.clientY = Math.round(
                            event.data.clientY * heightRatio + top
                        );
                    } else if (event.data.type === 'keydown') {
                        evt.key = event.data.key;
                    } else if (event.data.type === 'keyup') {
                        evt.key = event.data.key;
                    }

                    iframe.dispatchEvent(evt);
                });
            }
        };

        // Set iframe attributes
        // PROD
        //iframe.src = 'https://os.henryheffernan.com/';
        iframe.src = 'https://dudeism.com/ordination-form/';
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
        iframe.style.width = this.screenSize.width + 'px';
        iframe.style.height = this.screenSize.height + 'px';
        iframe.style.padding = IFRAME_PADDING + 'px';
        iframe.style.boxSizing = 'border-box';
        iframe.style.opacity = '1';
        iframe.className = 'jitter';
        iframe.id = 'computer-screen';
        iframe.frameBorder = '0';
        iframe.title = 'HeffernanOS';

        // Add iframe to container
        container.appendChild(iframe);

        // Create CSS plane
        this.createCssPlane(container);
    }
    

    setAnimation()
    {
        // this.animations = {}

        // this.animations.z = 0
        // this.animations.y = 0

        // this.animations.limits = {}
        // this.animations.limits.z = { min: -1.076, max: 1.454 }
        // this.animations.limits.y = { min: -1.055, max: 0.947 }

        // this.animations.speed = {}
        // this.animations.speed.z = 0.00061
        // this.animations.speed.y = 0.00037

        if(this.debug)
        {
            this.debugFolder.addInput(
                this.animations.limits.z,
                'min',
                {
                    label: 'limitZMin', min: - 3, max: 0, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.animations.limits.z,
                'max',
                {
                    label: 'limitZMax', min: 0, max: 3, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.animations.limits.y,
                'min',
                {
                    label: 'limitYMin', min: - 3, max: 0, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.animations.limits.y,
                'max',
                {
                    label: 'limitYMax', min: 0, max: 3, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.animations.speed,
                'z',
                {
                    label: 'speedZ', min: 0, max: 0.001, step: 0.00001
                }
            )

            this.debugFolder.addInput(
                this.animations.speed,
                'y',
                {
                    label: 'speedY', min: 0, max: 0.001, step: 0.00001
                }
            )
        }
    }

    update()
    {
        // this.animations.z += this.animations.speed.z * this.time.delta
        // this.animations.y += this.animations.speed.y * this.time.delta

        // if(this.animations.z > this.animations.limits.z.max)
        // {
        //     this.animations.z = this.animations.limits.z.max
        //     this.animations.speed.z *= -1
        // }
        // if(this.animations.z < this.animations.limits.z.min)
        // {
        //     this.animations.z = this.animations.limits.z.min
        //     this.animations.speed.z *= -1
        // }
        // if(this.animations.y > this.animations.limits.y.max)
        // {
        //     this.animations.y = this.animations.limits.y.max
        //     this.animations.speed.y *= -1
        // }
        // if(this.animations.y < this.animations.limits.y.min)
        // {
        //     this.animations.y = this.animations.limits.y.min
        //     this.animations.speed.y *= -1
        // }

        // this.model.mesh.position.z = this.animations.z
        // this.model.mesh.position.y = this.animations.y
    }
}