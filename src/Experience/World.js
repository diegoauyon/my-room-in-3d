import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import Background from './Background.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import ElgatoLight from './ElgatoLight.js'
//import BouncingLogo from './BouncingLogo.js'
import TVScreen from './TVScreen.js'
import Screen from './Screen.js'
import Cat from './Cat.js'
import MonitorScreen from './Monitor.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBackground()
                this.setBaked()
                this.setGoogleLeds()
                this.setLoupedeckButtons()
                this.setCoffeeSteam()
                this.setTopChair()
                this.setElgatoLight()
                //this.setBouncingLogo()
                this.setScreens()
                this.setTVScreen()
                this.setMonitorScreen()
                this.setCat()
            }
        })
    }

    setBackground()
    {
        this.background = new Background()
    }

    setBaked()
    {
        this.baked = new Baked()
    }

    setGoogleLeds()
    {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons()
    {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam()
    {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair()
    {
        this.topChair = new TopChair()
    }

    setElgatoLight()
    {
        this.elgatoLight = new ElgatoLight()
    }

    setBouncingLogo()
    {
        this.bouncingLogo = new BouncingLogo()
    }

    setTVScreen() {
        this.tvScreen = new TVScreen()
    }

    setMonitorScreen() {
        this.monitorScreen = new MonitorScreen()
    }

    setCat() {
        this.cat = new Cat()
    }

    setScreens()
    {
        this.macScreen = new Screen(
            this.resources.items.macScreenModel.scene.children[0],
            '/assets/proposal.webm'
        )
    }

    resize()
    {
    }

    update()
    {
        if(this.googleLeds)
            this.googleLeds.update()

        if(this.loupedeckButtons)
            this.loupedeckButtons.update()

        if(this.coffeeSteam)
            this.coffeeSteam.update()

        if(this.topChair)
            this.topChair.update()

        if(this.bouncingLogo)
            this.bouncingLogo.update()

        if(this.background)
            this.background.update()

        if(this.cat)
            this.cat.update()
    }

    destroy()
    {
    }
}