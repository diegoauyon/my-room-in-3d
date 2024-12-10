import * as THREE from "three";
import EventEmitter from './EventEmitter';

export default class Mouse extends EventEmitter {
    constructor() {
        super();

        // Setup
        this.x = 0;
        this.y = 0;
        this.rayCoords = new THREE.Vector2();
        this.inComputer = false;
        this.inTVScreen = false;
        this.seenScreen = null;

        // Resize event
        this.on('mousemove', (event) => {
            if (event.clientX && event.clientY) {
                this.x = event.clientX;
                this.y = event.clientY;
                this.rayCoords.x = (this.x / window.innerWidth) * 2 - 1;
                this.rayCoords.y = -(this.y / window.innerHeight) * 2 + 1;
            }

            console.log('[!!||||||||||]', event)

            this.seenScreen = event.seenScreen ? event.seenScreen : null;
            this.inComputer = event.seenScreen === 'monitor' ? true : false;
            this.inTVScreen = event.seenScreen === 'tv' ? true : false;
        });
    }
}
