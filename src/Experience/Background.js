import * as THREE from 'three'

import Experience from './Experience.js'

const spaceBetween = 50
const multiplier =200
const size = 2

export default class TopChair
{
    constructor()
    {

        this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;
        this.geometry = new THREE.BufferGeometry();
        this.vertices = [];

        this.sprite =new THREE.TextureLoader().load('assets/disc.png' );

        this.material = null

        this.experience = new Experience()
        this.camera = this.experience.camera
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        this.setModel()
    }

    setModel()
    {
//        this.sprite.colorSpace = THREE.SRGBColorSpace;


        for ( let i = 0; i < 10000; i ++ ) {

            const x = multiplier * Math.random() - spaceBetween;
            const y = multiplier * Math.random() - spaceBetween;
            const z = multiplier * Math.random() - spaceBetween;

            this.vertices.push( x, y, z );

        }

        this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
        this.material = new THREE.PointsMaterial( { size, sizeAttenuation: true, map: this.sprite, alphaTest: 0.5, transparent: true } );
		this.material.color.setHSL( 1.0, 0.3, 0.7 );

		const particles = new THREE.Points( this.geometry, this.material );

        console.log(particles)
        this.scene.add(particles)
        
        
    }

    update()
    {
        const time = Date.now() * 0.00005;

        //this.camera.position.x += ( 1 - this.camera.position.x ) * 0.05;
        //this.camera.position.y += ( - 1 - this.camera.position.y ) * 0.05;

        //camera.lookAt( scene.position );

        const h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
        this.material.color.setHSL( h, 0.5, 0.5 );
    }
}