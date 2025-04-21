import * as THREE from 'three';

class Boundary {
    static create(game) {
        // Create wall sections around the boundary
        const wallSpacing = 4; // Distance between wall sections
        const mapSize = 100; // Total map size
        const sections = Math.floor(mapSize / wallSpacing);
    
        // Create walls for all four sides
        for (let i = 0; i < sections; i++) {
            const position = (i * wallSpacing) - (mapSize / 2);
    
            // North wall
            game.scene.add(Boundary.createWallSection(game, position, -mapSize/2, 0));
            
            // South wall
            game.scene.add(Boundary.createWallSection(game, position, mapSize/2, Math.PI));
            
            // East wall
            game.scene.add(Boundary.createWallSection(game, mapSize/2, position, Math.PI * 1.5));
            
            // West wall
            game.scene.add(Boundary.createWallSection(game, -mapSize/2, position, Math.PI * 0.5));
        }
    }

    static createWallSection(game, x, z, rotation) {
        const wallGroup = new THREE.Group();
        
        // Create white wall material with slight texture
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,  // Pure white
            roughness: 0.2,   // Smooth surface
            metalness: 0.0,   // Non-metallic
            shininess: 30     // Slight shine
        });
        
        // Main wall section - adjusted height
        const wallHeight = 8; // Reduced height from 12 to 8
        const wallWidth = 4;   // Width of each section
        const wallThickness = 0.5;
        
        const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness);
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.y = wallHeight / 2;
        wallGroup.add(wall);

        // Add decorative top
        const topGeometry = new THREE.BoxGeometry(wallWidth + 0.4, 0.5, wallThickness + 0.4);
        const topPiece = new THREE.Mesh(topGeometry, wallMaterial);
        topPiece.position.set(0, wallHeight, 0);
        wallGroup.add(topPiece);

        // Add subtle vertical grooves for texture
        const grooveSpacing = 1;
        for (let i = 1; i < wallWidth; i += grooveSpacing) {
            const grooveGeometry = new THREE.BoxGeometry(0.05, wallHeight, 0.1);
            const groove = new THREE.Mesh(grooveGeometry, wallMaterial);
            groove.position.set(i - wallWidth/2, wallHeight/2, wallThickness/2 + 0.01);
            wallGroup.add(groove);
        }

        // Add collision box for the wall section
        const collisionGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness);
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        collisionMesh.position.set(0, wallHeight/2, 0);
        wallGroup.add(collisionMesh);
        game.collidableObjects.push(collisionMesh);

        // Position and rotate the wall section
        wallGroup.position.set(x, 0, z);
        wallGroup.rotation.y = rotation;
        
        // Add shadows
        wallGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return wallGroup;
    }
}

export { Boundary };