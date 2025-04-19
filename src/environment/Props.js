import * as THREE from 'three';

class Props {
    static createContainer(game, x, y, z, rotation = 0) {
        const container = new THREE.Group();
        
        // Container dimensions
        const outerWidth = 5;     // Outer width
        const outerHeight = 4;    // Outer height
        const outerDepth = 8;     // Outer depth
        const wallThickness = 0.2; // Wall thickness

        // Calculate inner dimensions
        const innerWidth = outerWidth - (2 * wallThickness);
        const innerHeight = outerHeight - wallThickness; // No bottom wall
        const innerDepth = outerDepth - (5 * wallThickness);

        // Dark blue material with transparency
        const containerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00008B,  // Dark blue
            shininess: 30,
            transparent: true,
            opacity: 0.8
        });

        // Create outer walls
        const walls = [
            // Front wall
            {
                geometry: new THREE.BoxGeometry(wallThickness, outerHeight, outerDepth),
                position: [-outerWidth/2 + wallThickness/2, outerHeight/2, 0]
            },
            // Back wall
            {
                geometry: new THREE.BoxGeometry(wallThickness, outerHeight, outerDepth),
                position: [outerWidth/2 - wallThickness/2, outerHeight/2, 0]
            },
            // Right wall
            {
                geometry: new THREE.BoxGeometry(outerWidth, outerHeight, wallThickness),
                position: [0, outerHeight/2, outerDepth/2 - wallThickness/2]
            },
            // Top wall
            {
                geometry: new THREE.BoxGeometry(outerWidth, wallThickness, outerDepth),
                position: [0, outerHeight - wallThickness/2, 0]
            }
        ];

        // Create and add each wall with collision
        walls.forEach(wall => {
            const mesh = new THREE.Mesh(wall.geometry, containerMaterial);
            mesh.position.set(...wall.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            container.add(mesh);

            // Add collision for the wall
            game.collidableObjects.push(mesh);
        });

        // Create a visual indicator for the entrance (optional frame)
        const frameGeometry = new THREE.BoxGeometry(outerWidth, wallThickness/2, outerDepth);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x4169E1,  // Royal Blue
            shininess: 50
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, wallThickness/4, 0);
        container.add(frame);

        // Position the entire container
        container.position.set(x, y, z);
        container.rotation.y = rotation;

        // Add to scene
        game.scene.add(container);
        
        return container;
    }
}

export { Props };