import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import Navigation from './Navigation.js'
import Mouse from './Utils/Mouse.js'

import assets from './assets.js'

export default class Experience
{
    static instance

    constructor(_options = {})
    {
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement
        this.cssElement = _options.cssElement
        this.cssElementMonitor = _options?.cssElementMonitor

        if(!this.targetElement)
        {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setMouse()
        this.setStats()
        this.setDebug()
        this.setScene()
        this.setCSSScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()
        //this.setNavigation()
        //this.setRaycaster()
        
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    setConfig()
    {
        this.config = {}
    
        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)
        
        // Debug
        // this.config.debug = window.location.hash === '#debug'
        this.config.debug = window.location.hash === '#debug'
    }

    setRaycaster() {
        this.raycaster = new THREE.Raycaster();
    }

    setStats()
    {
        if(this.config.debug)
        {
            this.stats = new Stats(true)
        }
    }

    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new Pane()
            this.debug.containerElem_.style.width = '320px'
        }
    }
    
    setScene()
    {
        this.scene = new THREE.Scene()
    }

    setCSSScene()
    {
        this.cssScene = new THREE.Scene();
        this.cssSceneMonitor = new THREE.Scene();
    }

    setCamera()
    {
        this.camera = new Camera()
    }

    setRenderer()
    {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })

        this.targetElement.appendChild(this.renderer.instance.domElement)

        if (this?.cssElement && this?.renderer?.cssInstance) {
            this.cssElement.appendChild(this.renderer.cssInstance.domElement);
        }

        if (this?.cssElementMonitor && this?.renderer?.cssInstanceMonitor) {
            this.cssElementMonitor?.appendChild(this.renderer.cssInstanceMonitor.domElement);
        }
    }

    setResources()
    {
        this.resources = new Resources(assets)
    }

    setWorld()
    {
        this.world = new World()
    }

    setNavigation()
    {
        this.navigation = new Navigation()
    }

    setMouse()
    {
        this.mouse = new Mouse()
    }

    update()
    {
        if(this.stats)
            this.stats.update()
        
        this.camera.update()
        
        if(this.renderer)
            this.renderer.update()

        if(this.world)
            this.world.update()

        if(this.navigation)
            this.navigation.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)

        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if(this.camera)
            this.camera.resize()

        if(this.renderer)
            this.renderer.resize()

        if(this.world)
            this.world.resize()
    }

    destroy()
    {
        
    }
}
