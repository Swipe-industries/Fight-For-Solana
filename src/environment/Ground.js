import * as THREE from 'three';
import { Boundary } from './Boundary.js';

class Ground {
    static create(game) {
        // Create extended ground plane (larger than playable area)
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        
        // Create realistic ground texture
        const textureLoader = new THREE.TextureLoader();
        const groundTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/grasslight-big.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(50, 50);
        groundTexture.encoding = THREE.sRGBEncoding;
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        game.scene.add(ground);
        
        // Create boundary walls
        Boundary.create(game);
    }
    
    // Remove the createTreesInArea method and all tree-related code
}

export { Ground };