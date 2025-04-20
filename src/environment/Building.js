import * as THREE from 'three';

class Building {
    static create(game) {
        const building = new THREE.Group();
        
        // Create base material with brick-like texture
        const wallsMaterial = new THREE.MeshPhongMaterial({
            color: 0xe8d1c5, // Beige-pink brick color
            roughness: 0.8,
            metalness: 0.2
        });

        // Create tower section (taller building)
        const towerHeight = 40;
        const numFloors = 10;
        const floorHeight = 4;
        
        const tower = new THREE.Mesh(
            new THREE.BoxGeometry(15, towerHeight, 15),
            wallsMaterial
        );
        tower.position.set(-10, towerHeight/2, 0);
        building.add(tower);

        // Create shorter section
        const shorterBuilding = new THREE.Mesh(
            new THREE.BoxGeometry(20, 16, 15),
            wallsMaterial
        );
        shorterBuilding.position.set(10, 8, 0);
        building.add(shorterBuilding);

        // Add architectural details
        this.addArchitecturalDetails(building);
        
        // Add windows with more realistic pattern
        this.addDetailedWindows(building);
        
        // Add fire escape
        this.addFireEscape(building);

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
                
                if (object.name === "structure") {
                    game.collidableObjects.push(object);
                }
            }
        });

        building.position.set(0, 0, 0);
        game.scene.add(building);
    }

    static addArchitecturalDetails(building) {
        const detailsMaterial = new THREE.MeshPhongMaterial({
            color: 0xd3c0b5,
            shininess: 5
        });

        // Add cornices between floors
        for (let i = 1; i <= 10; i++) {
            const cornice = new THREE.Mesh(
                new THREE.BoxGeometry(15.5, 0.3, 15.5),
                detailsMaterial
            );
            cornice.position.set(-10, i * 4 - 0.15, 0);
            building.add(cornice);
        }

        // Add ground floor detail
        const baseDetail = new THREE.Mesh(
            new THREE.BoxGeometry(36, 1, 16),
            detailsMaterial
        );
        baseDetail.position.set(0, 0.5, 0);
        building.add(baseDetail);
    }

    static addDetailedWindows(building) {
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            shininess: 90,
            opacity: 0.7,
            transparent: true
        });

        // Tower windows
        for (let floor = 0; floor < 10; floor++) {
            for (let column = 0; column < 3; column++) {
                for (let side = 0; side < 4; side++) {
                    const window = new THREE.Mesh(
                        new THREE.BoxGeometry(1.2, 2, 0.1),
                        windowMaterial
                    );
                    
                    const angle = (side * Math.PI) / 2;
                    const radius = 7;
                    const x = -10 + Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;
                    
                    window.position.set(
                        x + (column - 1) * 2,
                        floor * 4 + 2,
                        z
                    );
                    window.rotation.y = angle;
                    building.add(window);
                }
            }
        }

        // Shorter building windows
        const shorterBuildingWindows = [
            // Front row
            [8, 2, 7.5], [10, 2, 7.5], [12, 2, 7.5],
            [8, 6, 7.5], [10, 6, 7.5], [12, 6, 7.5],
            [8, 10, 7.5], [10, 10, 7.5], [12, 10, 7.5],
        ];

        shorterBuildingWindows.forEach(pos => {
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 2, 0.1),
                windowMaterial
            );
            window.position.set(...pos);
            building.add(window);
        });
    }

    static addFireEscape(building) {
        const fireEscapeMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });

        const fireEscape = new THREE.Group();

        // Create platforms and ladders
        for (let floor = 1; floor < 10; floor++) {
            // Platform
            const platform = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.2, 4),
                fireEscapeMaterial
            );
            platform.position.set(-17, floor * 4, 0);
            
            // Railings
            const railing1 = new THREE.Mesh(
                new THREE.BoxGeometry(3, 1, 0.1),
                fireEscapeMaterial
            );
            railing1.position.set(-17, floor * 4 + 0.5, 2);
            
            // Ladder
            const ladder = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 4, 0.2),
                fireEscapeMaterial
            );
            ladder.position.set(-17, floor * 4 - 2, 2);
            
            fireEscape.add(platform, railing1, ladder);
        }

        building.add(fireEscape);
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
        // Create entrance to the building
        const doorWidth = 2.5;
        const doorHeight = 3.5;
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.5);
        const doorMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.7,
            emissive: 0x111111
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, doorHeight/2, 7.5); // Using actual building depth (15/2)
        building.add(door);
        
        // Add entrance light
        const entranceLight = new THREE.PointLight(0xffffaa, 0.8, 10);
        entranceLight.position.set(0, doorHeight, 7.5);
        building.add(entranceLight);
        
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