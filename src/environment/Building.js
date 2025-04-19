class Building {
    static create(game) {
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
        Building.createInteriors(building);
        
        // Create entrance - wider doorway
        Building.createEntrance(building);
        
        // Add windows
        Building.addWindows(building);
        
        // Add interior staircase between floors
        Building.addInteriorStairs(building);
        
        // Add some interior furniture
        Building.addFurniture(building);
        
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

    static createInteriors(building) {
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
    }

    static createEntrance(building) {
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
    }

    static addWindows(building) {
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
    }

    static addInteriorStairs(building) {
        const stairsMaterial = new THREE.MeshPhongMaterial({
            color: 0x9e9e9e,
            shininess: 5
        });
        
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
    }

    static addFurniture(building) {
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
    }
}

export { Building };