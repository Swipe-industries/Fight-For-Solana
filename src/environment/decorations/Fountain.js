import * as THREE from 'three';

class Fountain {
    static addFountain(game) {
        const fountain = new THREE.Group();
    
        // Larger base pool with decorative rim
        const poolGeometry = new THREE.CylinderGeometry(12, 13, 1.5, 32);
        const stoneMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 50,
            roughness: 0.6
        });
        const pool = new THREE.Mesh(poolGeometry, stoneMaterial);
        pool.position.y = 0.75;
        fountain.add(pool);
    
        // Central structure
        const baseGeometry = new THREE.CylinderGeometry(4, 5, 3, 8);
        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.y = 2.5;
        fountain.add(base);

        // Define basins configuration
        const basins = [
            { radius: 8, height: 0.8, y: 4, spoutRadius: 3 },
            { radius: 6, height: 0.8, y: 6, spoutRadius: 2 },
            { radius: 4, height: 0.8, y: 8, spoutRadius: 1 }
        ];

        // Create basin structures
        basins.forEach((basinData, index) => {
            const basinGeometry = new THREE.CylinderGeometry(
                basinData.radius, basinData.radius + 0.5, basinData.height, 32
            );
            const basin = new THREE.Mesh(basinGeometry, stoneMaterial);
            basin.position.y = basinData.y;
            fountain.add(basin);
        });

        // Create a custom water material with better visibility
        const waterMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x3498db,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
            envMapIntensity: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
    
        // Add water to main pool using a plane
        const poolWater = new THREE.Mesh(
            new THREE.CircleGeometry(11.5, 32),
            waterMaterial.clone()
        );
        poolWater.rotation.x = -Math.PI / 2;
        poolWater.position.y = 0.8;
        fountain.add(poolWater);
    
        // Add water to each basin
        basins.forEach((basinData, index) => {
            // Basin structure remains the same...
    
            // Add water surface to basin
            const basinWater = new THREE.Mesh(
                new THREE.CircleGeometry(basinData.radius - 0.2, 32),
                waterMaterial.clone()
            );
            basinWater.rotation.x = -Math.PI / 2;
            basinWater.position.y = basinData.y + 0.4;
            fountain.add(basinWater);
    
            // Create falling water sheets instead of streams
            const spoutCount = 8;
            for (let i = 0; i < spoutCount; i++) {
                const angle = (i / spoutCount) * Math.PI * 2;
                const x = Math.cos(angle) * basinData.spoutRadius;
                const z = Math.sin(angle) * basinData.spoutRadius;
    
                // Create water sheet
                const height = basinData.y - (basins[index + 1]?.y || 1);
                const waterSheet = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.8, height),
                    new THREE.MeshPhysicalMaterial({
                        color: 0x3498db,
                        metalness: 0.2,
                        roughness: 0.3,
                        transparent: true,
                        opacity: 0.6,
                        side: THREE.DoubleSide
                    })
                );
                waterSheet.position.set(x, basinData.y - height/2, z);
                waterSheet.lookAt(new THREE.Vector3(0, waterSheet.position.y, 0));
                fountain.add(waterSheet);
            }
        });
    
        // Central water jet
        const centralJet = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 4),
            new THREE.MeshPhysicalMaterial({
                color: 0x3498db,
                metalness: 0.2,
                roughness: 0.3,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            })
        );
        centralJet.position.y = 10;
        fountain.add(centralJet);
    
        // Simpler animation that focuses on water surfaces
        fountain.userData.update = (deltaTime) => {
            const time = Date.now() * 0.001;
            fountain.children.forEach(child => {
                if (child.material && child.material.transparent) {
                    // Animate water surfaces
                    if (child.geometry.type === 'CircleGeometry') {
                        child.position.y += Math.sin(time * 2) * 0.0005;
                        child.material.opacity = 0.8 + Math.sin(time * 1.5) * 0.1;
                    }
                    // Animate water sheets
                    else if (child.geometry.type === 'PlaneGeometry') {
                        child.rotation.y = Math.sin(time + child.position.x) * 0.1;
                        child.material.opacity = 0.6 + Math.sin(time * 2 + child.position.z) * 0.2;
                    }
                }
            });
        };
    
        // Updated collision detection
        const fountainCollisionGeometry = new THREE.CylinderGeometry(13, 13, 12, 16);
        const fountainCollision = new THREE.Mesh(
            fountainCollisionGeometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        fountainCollision.position.y = 6;
        fountain.add(fountainCollision);
    
        // Position finding logic for fountain
        let validPosition = false;
        let attempts = 0;
        const position = new THREE.Vector3();
        const minFountainDistance = 20; // Larger distance for fountain
    
        while (!validPosition && attempts < 30) {
            position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            );
    
            validPosition = true;
            
            // Don't place fountain near the building (center)
            if (position.length() < 25) {
                validPosition = false;
                attempts++;
                continue;
            }
    
            // Check distance to all collidable objects
            for (const obj of game.collidableObjects) {
                const distance = position.distanceTo(obj.position);
                if (distance < minFountainDistance) {
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }
    
        // If we couldn't find a valid position, place it at a predetermined location
        if (!validPosition) {
            position.set(40, 0, 40);
            
            // Final check to ensure it doesn't overlap with anything
            let isClear = true;
            for (const obj of game.collidableObjects) {
                if (position.distanceTo(obj.position) < minFountainDistance) {
                    isClear = false;
                    break;
                }
            }
            
            // If still not clear, try the opposite corner
            if (!isClear) {
                position.set(-40, 0, -40);
            }
        }
    
        fountain.position.copy(position);
    
        // Fixed position for fountain
        fountain.position.set(60, 0, 60);
    
        // Add shadows
        fountain.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    
        game.collidableObjects.push(fountainCollision);
        game.scene.add(fountain);
        
        if (game.updateableObjects) {
            game.updateableObjects.push(fountain);
        }
    }
}

export { Fountain };