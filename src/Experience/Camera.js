import * as THREE from 'three'
import Experience from './Experience.js'
import TWEEN from '@tweenjs/tween.js';
import { DeskKeyframe, IdleKeyframe, LoadingKeyframe, MonitorKeyframe, OrbitControlsStart, TVKeyframe } from './CameraKeyframes.js'
import UIEventBus from './Utils/EventBus.js';
import EventEmitter from './Utils/EventEmitter.js';
import BezierEasing from 'bezier-easing';

const IDLE = 'idle'
const MONITOR = 'monitor'
const TV = 'tv'
const DESK = 'desk'

export default class Camera extends EventEmitter
{
    constructor(_options)
    {
        super();
        // Options
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.targetElement = this.experience.targetElement
        this.scene = this.experience.scene

        this.freeCam = false;
        this.position = new THREE.Vector3(0, 0, 0);
        this.focalPoint = new THREE.Vector3(0, 0, 0);
        this.quaternion = undefined

        // Set up
        this.mode = 'default' // default \ debug


        this.keyframes = {
            idle: new IdleKeyframe(),
            monitor: new MonitorKeyframe(),
            tv: new TVKeyframe(),
            desk: new LoadingKeyframe(),
            orbitControlsStart: new OrbitControlsStart(),
        };

        this.setPostLoadTransition();
        this.setInstance()
        this.setMonitorListeners();
        this.setTVListeners()
        this.setModes()
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(20, this.config.width / this.config.height, 0.1, 150)
        this.instance.rotation.reorder('YXZ')
        this.currentKeyframe = IDLE;

        this.scene.add(this.instance)
    }

    transition(
        key,
        duration = 1000,
        easing,
        callback,
    ) {
        if (this.currentKeyframe === key) return;
        console.log('transitioning to', key);

        if (this.targetKeyframe) TWEEN.removeAll();

        this.currentKeyframe = undefined;
        this.targetKeyframe = key;

        const keyframe = this.keyframes[key];

        const posTween = new TWEEN.Tween(this.position)
            .to(keyframe.position, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut)
            .onComplete(() => {
//                console.log('complete');
                this.currentKeyframe = key;
                this.targetKeyframe = undefined;
                if (callback) callback();
            });

        const focTween = new TWEEN.Tween(this.focalPoint)
            .to(keyframe.focalPoint, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut);

        posTween.start();
        focTween.start();
    }

    setPostLoadTransition() {
        this.transition(IDLE, 2500, TWEEN.Easing.Elastic.In);
    }

    setTVListeners() {
        this.on('enterTV', () => {

            console.log('!!!!!!!!!enterTV');
            this.transition(
                TV,
                2000,
                BezierEasing(0.13, 0.99, 0, 1)
            );
            UIEventBus.dispatch('enterTV', {});
        });
        this.on('leftTV', () => {
            this.transition(IDLE);
            UIEventBus.dispatch('leftTV', {});
        });
    }

    setMonitorListeners() {
        this.on('enterMonitor', () => {
            this.transition(
                MONITOR,
                2000,
                BezierEasing(0.13, 0.99, 0, 1)
            );
            UIEventBus.dispatch('enterMonitor', {});
        });
        this.on('leftMonitor', () => {
            this.transition(IDLE);
            UIEventBus.dispatch('leftMonitor', {});
        });
    }


    setModes()
    {
        this.modes = {}

        // Default
        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder('YXZ')

    }


    resize()
    {
        this.instance.aspect = this.config.width / this.config.height
        this.instance.updateProjectionMatrix()

        this.modes.default.instance.aspect = this.config.width / this.config.height
        this.modes.default.instance.updateProjectionMatrix()

    }

    update()
    {
        TWEEN.update();



        for (const key in this.keyframes) {
            const _key = key;
            this.keyframes[_key].update();
        }

        if (this.currentKeyframe) {
            console.log(this.currentKeyframe);
            const keyframe = this.keyframes[this.currentKeyframe];
            this.position.copy(keyframe.position);
            this.focalPoint.copy(keyframe.focalPoint);
            
            if (keyframe?.quaternion) {
                this.quaternion.copy(keyframe.quaternion);
            } else {
                this.quaternion = undefined;
            }

            

        } else {
            //this.instance.position.copy(this.modes[this.mode].instance.position);
            //this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
        }
        this.instance.position.copy(this.position);
        this.instance.lookAt(this.focalPoint);

        if (this.quaternion){
            this.instance.quaternion.copy(this.quaternion)
        }
        

        

        
//        this.instance.lookAt(this.focalPoint);


        //console.log(this.instance.position, this.instance.quaternion);

        // Apply coordinates
        // this.instance.position.copy(this.modes[this.mode].instance.position)
        // this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
//        this.instance.updateMatrixWorld() // To be used in projection
    }

    destroy()
    {
        this.modes.debug.orbitControls.destroy()
    }
}
