import * as THREE from 'three';

class Decorations {
    static add(game) {
        const minTreeDistance = 15; // Minimum distance between trees
        const attempts = 20; // Maximum placement attempts per tree
        const trees = [];
        
        // More realistic trees with improved foliage and trunk
        for (let i = 0; i < 8; i++) {  // Reduced from 15 to 8 trees
            // When creating trees
            const treeGroup = new THREE.Group();
            treeGroup.userData.isTree = true; // Add this line to identify trees
            
            // Tree trunk with bark-like texture
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 12);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8B4513,
                shininess: 3,
                flatShading: true
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Reduced collision cylinder for trees
            const collisionGeometry = new THREE.CylinderGeometry(0.8, 0.8, 6, 8); // Reduced from 1.5 to 0.8
            const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.y = 3;
            collisionMesh.userData.isTree = true;  // Add this line
            
            // Multiple layers of foliage with more natural shapes
            const createFoliage = (y, scale) => {
                // Use icosahedron for more natural looking foliage
                const foliageGeometry = new THREE.IcosahedronGeometry(1.5 * scale, 1);
                // Vary the green colors slightly for each tree
                const baseColor = new THREE.Color(0x2D4F2D).lerp(
                    new THREE.Color(0x4F7942), 
                    0.3 + Math.random() * 0.4
                );
                
                const foliageMaterial = new THREE.MeshPhongMaterial({ 
                    color: baseColor,
                    shininess: 3,
                    flatShading: true
                });
                
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = y;
                // Add some random offset for natural look
                foliage.position.x = (Math.random() - 0.5) * 0.7;
                foliage.position.z = (Math.random() - 0.5) * 0.7;
                // Add random scaling for more variety
                foliage.scale.x = 0.9 + Math.random() * 0.2;
                foliage.scale.z = 0.9 + Math.random() * 0.2;
                return foliage;
            };
            
            // Add multiple layers of foliage with more variation
            treeGroup.add(createFoliage(3.5, 1.0));
            treeGroup.add(createFoliage(4.5, 0.85));
            treeGroup.add(createFoliage(5.3, 0.7));
            treeGroup.add(createFoliage(6.0, 0.5));
            
            // Adjust foliage positions to slightly overlap with the trunk for a more realistic look
            treeGroup.children.forEach(child => {
                if (child instanceof THREE.Mesh && child.geometry.type === 'IcosahedronGeometry') {
                    child.position.y -= 0.5; // Slightly lower foliage to overlap with the trunk
                }
            });
            
            treeGroup.add(trunk);
            treeGroup.add(collisionMesh);
            
            // Random position with restricted distribution
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 40,  // Reduced from 80 to 40
                1.5,
                (Math.random() - 0.5) * 40   // Reduced from 80 to 40
            );
            
            // Check if position is too close to other objects
            let validPosition = false;
            let attempts = 0;
            while (!validPosition && attempts < 10) {
                validPosition = true;
                // Don't place trees near the building
                if (position.length() < 20) {
                    validPosition = false;
                    position.set(
                        (Math.random() - 0.5) * 80,
                        1.5,
                        (Math.random() - 0.5) * 80
                    );
                    continue;
                }
                
                for (const obj of game.collidableObjects) {
                    const distance = position.distanceTo(obj.position);
                    if (distance < minTreeDistance) {  // Use minTreeDistance for checking
                        validPosition = false;
                        position.set(
                            (Math.random() - 0.5) * 80,
                            1.5,
                            (Math.random() - 0.5) * 80
                        );
                        break;
                    }
                }
                attempts++;
            }
            
            treeGroup.position.copy(position);
            
            // Add random rotation and slight tilt for variety
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            treeGroup.rotation.x = (Math.random() - 0.5) * 0.05;
            treeGroup.rotation.z = (Math.random() - 0.5) * 0.05;
            
            treeGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            
            game.collidableObjects.push(collisionMesh);
            game.scene.add(treeGroup);
        }
        
        // Add fountain after trees are placed
        this.addFountain(game);
    }

    static addFountain(game) {
        const fountain = new THREE.Group();

        // Base pool
        const poolGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
        const stoneMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 30,
            roughness: 0.8
        });
        const pool = new THREE.Mesh(poolGeometry, stoneMaterial);
        pool.position.y = 0.25;
        fountain.add(pool);

        // Central pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.8, 1, 2, 16);
        const pillar = new THREE.Mesh(pillarGeometry, stoneMaterial);
        pillar.position.y = 1.5;
        fountain.add(pillar);

        // Upper basin
        const basinGeometry = new THREE.CylinderGeometry(2, 1.5, 0.4, 32);
        const basin = new THREE.Mesh(basinGeometry, stoneMaterial);
        basin.position.y = 2.5;
        fountain.add(basin);

        // Water spout
        const spoutGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 16);
        const spout = new THREE.Mesh(spoutGeometry, stoneMaterial);
        spout.position.y = 2.8;
        fountain.add(spout);

        // Animated water particles
        const createWaterParticles = () => {
            const particles = new THREE.Group();
            const waterMaterial = new THREE.MeshPhongMaterial({
                color: 0x3498db,
                transparent: true,
                opacity: 0.6,
                shininess: 90
            });

            for (let i = 0; i < 40; i++) {
                const dropGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const drop = new THREE.Mesh(dropGeometry, waterMaterial);
                
                // Random starting position within the spout
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 0.1;
                drop.position.set(
                    Math.cos(angle) * radius,
                    2.8,
                    Math.sin(angle) * radius
                );
                
                // Store animation parameters
                drop.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.3 + 0.2,
                    (Math.random() - 0.5) * 0.2
                );
                drop.userData.lifetime = 0;
                drop.userData.maxLifetime = 1 + Math.random();
                
                particles.add(drop);
            }
            return particles;
        };

        // Modify the water animation system
        const waterParticles = createWaterParticles();
        fountain.add(waterParticles);

        // Instead of using requestAnimationFrame, create an update method
        fountain.userData.update = (deltaTime) => {
            waterParticles.children.forEach(drop => {
                drop.userData.lifetime += deltaTime;

                if (drop.userData.lifetime >= drop.userData.maxLifetime) {
                    // Reset particle
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 0.1;
                    drop.position.set(
                        Math.cos(angle) * radius,
                        2.8,
                        Math.sin(angle) * radius
                    );
                    drop.userData.lifetime = 0;
                    drop.userData.velocity.set(
                        (Math.random() - 0.5) * 0.2,
                        Math.random() * 0.3 + 0.2,
                        (Math.random() - 0.5) * 0.2
                    );
                } else {
                    // Update position
                    drop.position.add(drop.userData.velocity.clone().multiplyScalar(deltaTime * 60));
                    drop.userData.velocity.y -= 0.015 * deltaTime * 60; // Gravity
                }
            });
        };

        // Remove the separate animation loop
        // animateWater(); // Remove this line

        // Collision detection
        const fountainCollisionGeometry = new THREE.CylinderGeometry(4.2, 4.2, 3, 16);
        const fountainCollisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const fountainCollision = new THREE.Mesh(fountainCollisionGeometry, fountainCollisionMaterial);
        fountainCollision.position.y = 1.5;
        fountain.add(fountainCollision);

        // Find valid position for fountain
        let validPosition = false;
        const position = new THREE.Vector3();
        while (!validPosition) {
            position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            );

            validPosition = true;
            
            // Check distance from building center
            if (position.length() < 25) {
                validPosition = false;
                continue;
            }

            // Check distance from other objects
            for (const obj of game.collidableObjects) {
                const distance = position.distanceTo(obj.position);
                if (distance < 15) {
                    validPosition = false;
                    break;
                }
            }
        }

        fountain.position.copy(position);

        // Add shadows
        fountain.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // Add to collidable objects
        game.collidableObjects.push(fountainCollision);
        
        // Add fountain to scene
        game.scene.add(fountain);
        
        // Add fountain to game's updateable objects if the system exists
        if (game.updateableObjects) {
            game.updateableObjects.push(fountain);
        }
    }
}

export { Decorations };