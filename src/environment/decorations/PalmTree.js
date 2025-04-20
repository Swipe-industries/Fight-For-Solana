import * as THREE from 'three';

class PalmTree {
    // Create a very simple tree
    static createSimplePalmTree(game) {
        const treeGroup = new THREE.Group();
        treeGroup.userData.isTree = true;
        
        // Simple trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9,
            flatShading: true
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Simple foliage (cone shape)
        const foliageGeometry = new THREE.ConeGeometry(2, 5, 6);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.8,
            flatShading: true
        });
        
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 5.5;
        foliage.castShadow = true;
        
        // Collision cylinder
        const collisionGeometry = new THREE.CylinderGeometry(1, 1, 8, 8);
        const collisionMesh = new THREE.Mesh(
            collisionGeometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        collisionMesh.position.y = 4;
        collisionMesh.userData.isTree = true;
        
        treeGroup.add(trunk);
        treeGroup.add(foliage);
        treeGroup.add(collisionMesh);
        
        // Very simple animation - just a slight sway
        treeGroup.userData.update = (deltaTime) => {
            const time = Date.now() * 0.001;
            foliage.rotation.x = Math.sin(time * 0.5) * 0.02;
            foliage.rotation.z = Math.sin(time * 0.7) * 0.02;
        };
        
        if (game.updateableObjects) {
            game.updateableObjects.push(treeGroup);
        }
        
        return { treeGroup, collisionMesh };
    }
}

export { PalmTree };