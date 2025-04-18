class Environment {
    static setupLights(game) {
        // Reduce ambient light intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Reduced from 0.6
        game.scene.add(ambientLight);

        // Reduce main sunlight intensity
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8); // Reduced from 1.2
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        
        // Larger shadow map for better quality
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        
        // Adjust shadow camera for better coverage
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.bias = -0.001; // Reduce shadow artifacts
        
        game.scene.add(sunLight);

        // Add subtle hemisphere light for more natural lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x87CEEB, 0.6);
        game.scene.add(hemiLight);
    }

    static createMap(game) {
        // Create ground plane with smaller size
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        
        // Create realistic ground texture
        const textureLoader = new THREE.TextureLoader();
        const groundTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/grasslight-big.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(25, 25);
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

        // Create building
        Environment.createBuilding(game);
        
        // Create boundary walls
        Environment.createBoundary(game);
        
        // Add environmental decorations
        Environment.addDecorations(game);
    }

    static createBuilding(game) {
        const building = new THREE.Group();
        
        // Main building structure
        const wallsMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            shininess: 10
        });
        
        // Ground floor
        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(15, 4, 12),
            wallsMaterial
        );
        walls.position.y = 2;
        building.add(walls);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(11, 4, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 5
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 5;
        roof.rotation.y = Math.PI / 4;
        building.add(roof);
        
        // Basement
        const basement = new THREE.Mesh(
            new THREE.BoxGeometry(15, 4, 12),
            wallsMaterial
        );
        basement.position.y = -2;
        building.add(basement);
        
        // Create doors and windows
        const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.1);
        const doorMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a3520,
            shininess: 30
        });
        
        // Front door
        const frontDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        frontDoor.position.set(0, 1.25, 6);
        building.add(frontDoor);
        
        // Basement entrance
        const basementDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        basementDoor.position.set(0, -1, 6);
        building.add(basementDoor);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            shininess: 90,
            opacity: 0.7,
            transparent: true
        });
        
        // Add windows to each wall
        const windowPositions = [
            [-5, 2, 6], [5, 2, 6],  // Front
            [-5, 2, -6], [5, 2, -6],  // Back
            [7.5, 2, -3], [7.5, 2, 3],  // Right
            [-7.5, 2, -3], [-7.5, 2, 3]  // Left
        ];
        
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(...pos);
            if (Math.abs(pos[0]) === 7.5) {
                window.rotation.y = Math.PI / 2;
            }
            building.add(window);
        });
        
        // Add collision detection
        building.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                if (object !== frontDoor && object !== basementDoor) {
                    game.collidableObjects.push(object);
                }
            }
        });
        
        building.position.set(0, 0, 0);
        game.scene.add(building);
    }

    static createBoundary(game) {
        const wallGeometry = new THREE.BoxGeometry(2, 6, 100);  // Reduced size
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 10
        });
        
        // Create four boundary walls with smaller dimensions
        const walls = [
            { pos: [-50, 3, 0], rot: 0 },    // Reduced from ±100 to ±50
            { pos: [50, 3, 0], rot: 0 },
            { pos: [0, 3, -50], rot: Math.PI / 2 },
            { pos: [0, 3, 50], rot: Math.PI / 2 }
        ];
        
        walls.forEach(wall => {
            const boundaryWall = new THREE.Mesh(wallGeometry, wallMaterial);
            boundaryWall.position.set(...wall.pos);
            boundaryWall.rotation.y = wall.rot;
            boundaryWall.castShadow = true;
            boundaryWall.receiveShadow = true;
            game.collidableObjects.push(boundaryWall);
            game.scene.add(boundaryWall);
        });
    }

    static addObstacles(game) {
        // Create various obstacles with brighter, more vibrant colors
        const obstacles = [
            { pos: [10, 1, -10], scale: [3, 2, 3], color: 0xff6b6b },  // Bright red
            { pos: [-8, 1.5, 8], scale: [2, 3, 2], color: 0x4ecdc4 },  // Turquoise
            { pos: [5, 2, 15], scale: [4, 4, 4], color: 0xff9f43 },    // Orange
            { pos: [-15, 1, -5], scale: [2, 2, 2], color: 0xa8e6cf }   // Mint
        ];

        obstacles.forEach(obs => {
            const geometry = new THREE.BoxGeometry(obs.scale[0], obs.scale[1], obs.scale[2]);
            const material = new THREE.MeshPhongMaterial({ 
                color: obs.color,
                shininess: 30,
                specular: 0x444444
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(obs.pos[0], obs.pos[1], obs.pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Add to collidable objects
            game.collidableObjects.push(mesh);
            game.scene.add(mesh);
        });

        // Add invisible walls at the map boundaries
        const wallGeometry = new THREE.BoxGeometry(1, 10, 100);
        const wallMaterial = new THREE.MeshBasicMaterial({ visible: false });
        
        // Left and right walls
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-50, 5, 0);
        game.collidableObjects.push(leftWall);
        game.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(50, 5, 0);
        game.collidableObjects.push(rightWall);
        game.scene.add(rightWall);
        
        // Front and back walls
        const frontBackWallGeometry = new THREE.BoxGeometry(100, 10, 1);
        const frontWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        frontWall.position.set(0, 5, -50);
        game.collidableObjects.push(frontWall);
        game.scene.add(frontWall);
        
        const backWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        backWall.position.set(0, 5, 50);
        game.collidableObjects.push(backWall);
        game.scene.add(backWall);

        Environment.addDecorations(game);
    }

    static addDecorations(game) {
        // Simple trees with brighter colors
        for (let i = 0; i < 15; i++) {
            const treeGroup = new THREE.Group();
            
            // Tree trunk with collision
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcd853f,
                shininess: 10
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Collision cylinder for the whole tree
            const collisionGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 8);
            const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.y = 2.5;
            
            // Tree top
            const topGeometry = new THREE.ConeGeometry(1.5, 3, 8);
            const topMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x90EE90,
                shininess: 15
            });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 2.5;
            
            treeGroup.add(trunk);
            treeGroup.add(top);
            treeGroup.add(collisionMesh);
            
            // Random position with smaller range
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 40,  // Reduced from 80 to 40
                1,
                (Math.random() - 0.5) * 40
            );
            
            // Check if position is too close to other objects
            let validPosition = false;
            let attempts = 0;
            while (!validPosition && attempts < 10) {
                validPosition = true;
                for (const obj of game.collidableObjects) {
                    const distance = position.distanceTo(obj.position);
                    if (distance < 5) {  // Minimum distance between trees and other objects
                        validPosition = false;
                        position.set(
                            (Math.random() - 0.5) * 80,
                            1,
                            (Math.random() - 0.5) * 80
                        );
                        break;
                    }
                }
                attempts++;
            }
            
            treeGroup.position.copy(position);
            
            treeGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            
            game.collidableObjects.push(collisionMesh);
            game.scene.add(treeGroup);
        }
    }
}