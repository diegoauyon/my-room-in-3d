import * as THREE from 'three'

import Experience from './Experience.js'

const spaceBetween = 50
const multiplier =100

const amount = 5000
const size = 2
const sizes = [2, 4, 6, 8];

function getRandomSize() {
    
    const randomIndex = Math.floor(Math.random() * sizes.length);
    return sizes[randomIndex];
}

export default class TopChair
{
    constructor()
    {

        this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;
        this.geometry = new THREE.BufferGeometry();
        this.vertices = [];

        this.sprite =new THREE.TextureLoader().load('assets/spark.png' );

        this.material = null

        this.experience = new Experience()
        this.camera = this.experience.camera
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        this.sizes = new Float32Array( amount );
        this.particles = null

        this.setModel()
    }



    setModel()
    {

        for ( let i = 0; i < amount; i ++ ) {

            const x = multiplier * Math.random() - spaceBetween;
            const y = multiplier * Math.random() - spaceBetween;
            const z = multiplier * Math.random() - spaceBetween;

            this.vertices.push( x, y, z );

        }


        this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
        this.geometry.setAttribute( 'size', new THREE.BufferAttribute( this.sizes, 1 ) );
        		
        this.material = new THREE.PointsMaterial( { sizeAttenuation: true, map: this.sprite, alphaTest: 0.1, transparent: true } );
		this.material.color.setHSL( 1.0, 0.3, 0.7 );
		this.particles = new THREE.Points( this.geometry, this.material );


        const attributes = this.particles.geometry.attributes;


        for ( let i = 0; i < attributes.size.array.length; i ++ ) {

            attributes.size.array[ i ] = getRandomSize();
        }
        attributes.size.needsUpdate = true;

        this.scene.add(this.particles)

        // Bakground texture

        //nz_eso0932a-1024x1024-upscaled
        const cubeTexture = new THREE.CubeTextureLoader()
        .setPath( '/background/' )
        .load([
            'px_eso0932a-1024x1024-upscaled.png',
            'nx_eso0932a-1024x1024-upscaled.png',
            'py_eso0932a-1024x1024-upscaled.png',
            'ny_eso0932a-1024x1024-upscaled.png',
            'pz_eso0932a-1024x1024-upscaled.png',
            'nz_eso0932a-1024x1024-upscaled.png',
        ])
        // this.scene.background = cubeTexture
        // this.scene.background.encoding = THREE.sRGBEncoding;
    }

    update()
    {
        const time = Date.now() * 0.00005;

        const h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
        this.material.color.setHSL( h, 0.5, 0.5 );
    }
}