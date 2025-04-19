import * as THREE from 'three';

class Boundary {
    static create(game) {
        // Create fence sections around the boundary
        const fenceSpacing = 4; // Distance between fence sections
        const mapSize = 100; // Total map size
        const sections = Math.floor(mapSize / fenceSpacing);
    
        // Create fences for all four sides
        for (let i = 0; i < sections; i++) {
            const position = (i * fenceSpacing) - (mapSize / 2);
    
            // North wall
            game.scene.add(Boundary.createFenceSection(game, position, -mapSize/2, 0));
            
            // South wall
            game.scene.add(Boundary.createFenceSection(game, position, mapSize/2, Math.PI));
            
            // East wall
            game.scene.add(Boundary.createFenceSection(game, mapSize/2, position, Math.PI * 1.5));
            
            // West wall
            game.scene.add(Boundary.createFenceSection(game, -mapSize/2, position, Math.PI * 0.5));
        }
    }

    static createFenceSection(game, x, z, rotation) {
        const fenceGroup = new THREE.Group();
        const postMaterial = new THREE.MeshPhongMaterial({
            color: 0x2c3e50,  // Dark steel color
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Main vertical posts
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        const mainPost = new THREE.Mesh(postGeometry, postMaterial);
        mainPost.position.y = 3;
        fenceGroup.add(mainPost);

        // Horizontal bars (2 bars)
        const barGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
        const positions = [2, 4]; // Heights for the horizontal bars
        
        positions.forEach(height => {
            const bar = new THREE.Mesh(barGeometry, postMaterial);
            bar.rotation.z = Math.PI / 2;
            bar.position.set(2, height, 0);
            fenceGroup.add(bar);
        });

        // Vertical spears between posts (decorative elements)
        for (let i = 0; i < 5; i++) {
            // Main vertical bar
            const spearBar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 4, 8),
                postMaterial
            );
            spearBar.position.set(0.8 + (i * 0.8), 4, 0);
            fenceGroup.add(spearBar);

            // Spear tip
            const spearTip = new THREE.Mesh(
                new THREE.ConeGeometry(0.06, 0.3, 8),
                postMaterial
            );
            spearTip.position.set(0.8 + (i * 0.8), 6.15, 0);
            fenceGroup.add(spearTip);
        }

        // Add collision box for the fence section
        const collisionGeometry = new THREE.BoxGeometry(4, 6, 0.3);
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        collisionMesh.position.set(2, 3, 0);
        fenceGroup.add(collisionMesh);
        game.collidableObjects.push(collisionMesh);

        // Position and rotate the fence section
        fenceGroup.position.set(x, 0, z);
        fenceGroup.rotation.y = rotation;
        
        // Add shadows
        fenceGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return fenceGroup;
    }
}

export { Boundary };