class Environment {
    static setupLights(game) {
        // Evening ambient light - warmer and dimmer
        const ambientLight = new THREE.AmbientLight(0xffd6aa, 0.3); // Warmer color, reduced intensity
        game.scene.add(ambientLight);

        // Evening sunlight - orange-red tint, lower angle
        const sunLight = new THREE.DirectionalLight(0xff7e30, 0.6); // Orange-red sunset color
        sunLight.position.set(50, 30, 50); // Lower sun position
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
        const hemiLight = new THREE.HemisphereLight(0xff9966, 0x334455, 0.5); // Sunset sky to darker ground
        game.scene.add(hemiLight);
    }

    static createMap(game) {
        // Create ground
        Environment.createGround(game);
        
        // Create building
        Environment.createBuilding(game);
        
        // Add obstacles
        Environment.addObstacles(game);
        
        // Add NPC player
        Environment.addNPC(game);
    }

    static createGround(game) {
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
        
        // Create boundary walls
        Environment.createBoundary(game);
    }

    static createBuilding(game) {
        const building = new THREE.Group();
        
        // Main building structure - larger with 2 floors
        const wallsMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            shininess: 10
        });
        
        // Ground floor
        const groundFloor = new THREE.Mesh(
            new THREE.BoxGeometry(20, 4, 15),
            wallsMaterial
        );
        groundFloor.position.y = 2;
        building.add(groundFloor);
        
        // Second floor
        const secondFloor = new THREE.Mesh(
            new THREE.BoxGeometry(20, 4, 15),
            wallsMaterial
        );
        secondFloor.position.y = 6;
        building.add(secondFloor);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(14, 5, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 5
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 10.5;
        roof.rotation.y = Math.PI / 4;
        building.add(roof);
        
        // Create hollow interior by removing inner part
        const hollowInterior = (floor, y) => {
            const interiorGeometry = new THREE.BoxGeometry(18, 3.5, 13);
            const interiorMaterial = new THREE.MeshPhongMaterial({
                color: 0xeeeeee,
                side: THREE.BackSide
            });
            const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
            interior.position.y = y;
            building.add(interior);
            
            // Add floor
            const floorGeometry = new THREE.BoxGeometry(18, 0.5, 13);
            const floorMaterial = new THREE.MeshPhongMaterial({
                color: floor === 1 ? 0x8a5a44 : 0x9e8875, // Wood floor colors
                shininess: 30
            });
            const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
            floorMesh.position.y = y - 1.75;
            building.add(floorMesh);
            
            // Add ceiling
            if (floor === 1) {
                const ceilingGeometry = new THREE.BoxGeometry(18, 0.5, 13);
                const ceilingMaterial = new THREE.MeshPhongMaterial({
                    color: 0xdddddd,
                    shininess: 10
                });
                const ceilingMesh = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
                ceilingMesh.position.y = y + 1.75;
                building.add(ceilingMesh);
            }
        };
        
        // Create interiors for both floors
        hollowInterior(1, 2);
        hollowInterior(2, 6);
        
        // Create entrance - wider doorway
        const entranceGeometry = new THREE.BoxGeometry(3, 3, 1);
        const entranceMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.0
        });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(0, 1.5, 7.5);
        building.add(entrance);
        
        // Add door frame
        const doorFrameMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037,
            shininess: 30
        });
        
        const doorFrame = new THREE.Group();
        
        // Top of frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 0.3, 0.3),
            doorFrameMaterial
        );
        topFrame.position.y = 3;
        doorFrame.add(topFrame);
        
        // Sides of frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 3, 0.3),
            doorFrameMaterial
        );
        leftFrame.position.x = -1.6;
        leftFrame.position.y = 1.5;
        doorFrame.add(leftFrame);
        
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 3, 0.3),
            doorFrameMaterial
        );
        rightFrame.position.x = 1.6;
        rightFrame.position.y = 1.5;
        doorFrame.add(rightFrame);
        
        doorFrame.position.z = 7.5;
        building.add(doorFrame);
        
        // Add stairs to entrance
        const stairsMaterial = new THREE.MeshPhongMaterial({
            color: 0x9e9e9e,
            shininess: 5
        });
        
        const stairs = new THREE.Group();
        
        const stair1 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.5, 1),
            stairsMaterial
        );
        stair1.position.z = 8.5;
        stairs.add(stair1);
        
        const stair2 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.5, 1),
            stairsMaterial
        );
        stair2.position.z = 9.5;
        stair2.position.y = -0.5;
        stairs.add(stair2);
        
        building.add(stairs);
        
        // Add windows
        const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            shininess: 90,
            opacity: 0.7,
            transparent: true
        });
        
        // Ground floor windows
        const groundWindowPositions = [
            [-8, 2, 7.5], [-5, 2, 7.5], [5, 2, 7.5], [8, 2, 7.5],  // Front
            [-8, 2, -7.5], [-5, 2, -7.5], [5, 2, -7.5], [8, 2, -7.5],  // Back
            [10, 2, -5], [10, 2, 0], [10, 2, 5],  // Right
            [-10, 2, -5], [-10, 2, 0], [-10, 2, 5]  // Left
        ];
        
        // Second floor windows
        const secondWindowPositions = [
            [-8, 6, 7.5], [-5, 6, 7.5], [5, 6, 7.5], [8, 6, 7.5],  // Front
            [-8, 6, -7.5], [-5, 6, -7.5], [5, 6, -7.5], [8, 6, -7.5],  // Back
            [10, 6, -5], [10, 6, 0], [10, 6, 5],  // Right
            [-10, 6, -5], [-10, 6, 0], [-10, 6, 5]  // Left
        ];
        
        // Add all windows
        [...groundWindowPositions, ...secondWindowPositions].forEach(pos => {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(...pos);
            if (Math.abs(pos[0]) === 10) {
                window.rotation.y = Math.PI / 2;
            }
            building.add(window);
        });
        
        // Add interior staircase between floors
        const interiorStairs = new THREE.Group();
        
        for (let i = 0; i < 8; i++) {
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.25, 1),
                stairsMaterial
            );
            step.position.set(-7, 2.5 + i * 0.5, 0 - i * 0.5);
            interiorStairs.add(step);
        }
        
        building.add(interiorStairs);
        
        // Add some interior furniture
        const addFurniture = () => {
            // Ground floor furniture
            
            // Table
            const tableMaterial = new THREE.MeshPhongMaterial({
                color: 0x5d4037,
                shininess: 30
            });
            
            const tableTop = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.2, 2),
                tableMaterial
            );
            tableTop.position.set(5, 1, 0);
            
            const tableLeg1 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                tableMaterial
            );
            tableLeg1.position.set(4, 0.5, -0.8);
            
            const tableLeg2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                tableMaterial
            );
            tableLeg2.position.set(6, 0.5, -0.8);
            
            const tableLeg3 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                tableMaterial
            );
            tableLeg3.position.set(4, 0.5, 0.8);
            
            const tableLeg4 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                tableMaterial
            );
            tableLeg4.position.set(6, 0.5, 0.8);
            
            building.add(tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4);
            
            // Second floor furniture
            // Bed
            const bedFrame = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.5, 5),
                new THREE.MeshPhongMaterial({ color: 0x795548 })
            );
            bedFrame.position.set(-5, 4.5, -3);
            
            const mattress = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.4, 4.8),
                new THREE.MeshPhongMaterial({ color: 0xf5f5f5 })
            );
            mattress.position.set(-5, 4.95, -3);
            
            const pillow = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.3, 1),
                new THREE.MeshPhongMaterial({ color: 0xffffff })
            );
            pillow.position.set(-5, 5.3, -5);
            
            building.add(bedFrame, mattress, pillow);
        };
        
        addFurniture();
        
        // Add collision detection - only for exterior walls and floors
        building.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                
                // Only add collision for exterior walls and floors
                if (object === groundFloor || object === secondFloor || 
                    object === roof || object.name === "floor") {
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
        // More realistic trees with improved foliage and trunk
        for (let i = 0; i < 15; i++) {
            const treeGroup = new THREE.Group();
            
            // Tree trunk with bark-like texture
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 12);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8B4513,
                shininess: 3,
                flatShading: true
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Collision cylinder for the whole tree
            const collisionGeometry = new THREE.CylinderGeometry(1.5, 1.5, 6, 8);
            const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.y = 3;
            
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
            
            treeGroup.add(trunk);
            treeGroup.add(collisionMesh);
            
            // Random position with better distribution
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 80,
                1.5,
                (Math.random() - 0.5) * 80
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
                    if (distance < 10) {  // Increased minimum distance
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
    }

    static addNPC(game) {
        // Create an NPC player using the same player creation method
        const npcPlayer = new THREE.Group();
        
        // Clone the player creation code but with different colors
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,  // Blue outfit
            shininess: 30
        });
        const skinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf1c40f,  // Darker skin tone
            shininess: 20
        });
        const hairMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,  // Black hair
            shininess: 40
        });
        
        // Torso
        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.3, 1.2, 12),
            bodyMaterial
        );
        torso.position.y = 0.8;
        npcPlayer.add(torso);

        // Hips
        const hips = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.35, 0.3, 12),
            bodyMaterial
        );
        hips.position.y = 0.15;
        npcPlayer.add(hips);

        // Neck
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.15, 0.15, 12),
            skinMaterial
        );
        neck.position.y = 1.5;
        npcPlayer.add(neck);

        // Head
        const head = new THREE.Group();
        const skull = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 32, 32),
            skinMaterial
        );
        
        const face = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 32, 32, 0, Math.PI, 0, Math.PI),
            skinMaterial
        );
        face.position.z = 0.05;
        face.scale.z = 0.7;
        
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            hairMaterial
        );
        hair.rotation.x = Math.PI;
        hair.position.y = 0.1;
        hair.position.z = -0.05;
        
        head.add(skull);
        head.add(face);
        head.add(hair);
        head.position.y = 1.8;
        npcPlayer.add(head);

        // Create simplified limbs for NPC
        const createLimb = (isArm, isLeft) => {
            const limb = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    isArm ? 0.1 : 0.13, 
                    isArm ? 0.07 : 0.09, 
                    isArm ? 1.0 : 1.4, 
                    12
                ),
                isArm ? skinMaterial : bodyMaterial
            );
            
            limb.position.set(
                isLeft ? (isArm ? -0.45 : -0.3) : (isArm ? 0.45 : 0.3),
                isArm ? 1.0 : 0.4,
                0
            );
            
            return limb;
        };
        
        // Add arms and legs
        npcPlayer.add(createLimb(true, true));   // Left arm
        npcPlayer.add(createLimb(true, false));  // Right arm
        npcPlayer.add(createLimb(false, true));  // Left leg
        npcPlayer.add(createLimb(false, false)); // Right leg
        
        // Position the NPC somewhere on the map
        npcPlayer.position.set(-15, 1, 15);
        
        // Add random rotation
        npcPlayer.rotation.y = Math.random() * Math.PI * 2;
        
        // Add shadows
        npcPlayer.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Add to scene
        game.scene.add(npcPlayer);
        
        // Store reference for potential animation
        game.npc = npcPlayer;
        
        // Set up simple idle animation
        const animateNPC = () => {
            // Simple bobbing motion
            const time = Date.now() * 0.001;
            npcPlayer.position.y = 1 + Math.sin(time) * 0.1;
            
            // Slow rotation
            npcPlayer.rotation.y += 0.005;
            
            requestAnimationFrame(animateNPC);
        };
        
        animateNPC();
    }
}