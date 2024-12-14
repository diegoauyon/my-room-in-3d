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
        this.model.group.position.x = 3.804
        this.model.group.position.y = 0.335
        this.model.group.position.z = -1.848
        this.model.group.rotation.y = - Math.PI * 0.5


        this.texture = this.resources.items.catTexture;
        this.texture.flipY = false;
        this.texture.encoding = THREE.sRGBEncoding;

        this.material = new THREE.MeshBasicMaterial({
             map: this.texture,
        });

        // this.model.texture = this.resources.items.cat
        // this.model.texture.encoding = THREE.sRGBEncoding

         this.model.geometry = new THREE.PlaneGeometry(4, 1, 1, 1)
         this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = this.material

         this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        //console.log(this.resources.items.cat)
        
        this.model.mesh = this.resources.items.cat.scene.children[0]

        this.model.mesh.traverse((_child) =>
            {
                if(_child instanceof THREE.Mesh)
                {
                    _child.material = this.model.material
                }
            })
    

        const scale = 0.03
        this.model.mesh.scale.y = scale
        this.model.mesh.scale.z = scale
        this.model.mesh.scale.x = scale
        this.model.group.add(this.model.mesh)

        this.scene.add(this.model.group)

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
                    label: 'scaleZ', min: 0.001, max: 10, step: 0.001
                }
            )

            this.debugFolder.addInput(
                this.model.mesh.scale,
                'y',
                {
                    label: 'scaleY', min: 0.001, max:10, step: 0.001
                }
            )
        }
    }


    update()
    {
    }
}