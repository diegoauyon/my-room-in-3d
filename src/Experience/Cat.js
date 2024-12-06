import * as THREE from 'three'

import Experience from './Experience.js'

export default class Cat
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'cat',
                expanded: false
            })
        }

        this.setModel()
    }

    setModel()
    {
        
        this.model = {}

        this.model.group = new THREE.Group()
        this.model.group.position.x = 4.2
        this.model.group.position.y = 2.717
        this.model.group.position.z = 1.630
        this.scene.add(this.model.group)

        // this.model.texture = this.resources.items.cat
        // this.model.texture.encoding = THREE.sRGBEncoding

        // this.model.geometry = new THREE.PlaneGeometry(4, 1, 1, 1)
        // this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = new THREE.MeshBasicMaterial({
            transparent: true,
            premultipliedAlpha: true,
            map: this.model.texture
        })

        // this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        console.log(this.resources.items.cat)
        
        this.model.mesh = this.resources.items.cat.scene.children[0]
        this.model.mesh.scale.y = 100.359
        this.model.mesh.scale.z = 100.424
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


    update()
    {
       
    }
}