class Vehicles {
    static createMilitaryTruck(game) {
        const truck = new THREE.Group();

        // Enhanced camo colors
        const camoColors = {
            body: 0x4B5320,      // Army green
            details: 0x534B4F,   // Dark gray
            metal: 0x3B3C36,     // Olive drab
            chrome: 0x8B8B8B,    // Chrome parts
            rubber: 0x1a1a1a,    // Tire color
            glass: 0x2C3539      // Window color
        };

        // Main body (cargo area)
        const bodyGeometry = new THREE.BoxGeometry(6, 2.2, 2.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: camoColors.body,
            shininess: 10
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2;
        truck.add(body);

        // Hood section (more detailed)
        const hoodGroup = new THREE.Group();
        
        // Main hood
        const hoodGeometry = new THREE.BoxGeometry(2.5, 0.8, 2.8);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.set(-3.2, 2.1, 0);
        hoodGroup.add(hood);

        // Hood slope
        const hoodSlopeGeometry = new THREE.BoxGeometry(1, 0.4, 2.8);
        const hoodSlope = new THREE.Mesh(hoodSlopeGeometry, bodyMaterial);
        hoodSlope.position.set(-2.2, 2.5, 0);
        hoodSlope.rotation.z = Math.PI / 8;
        hoodGroup.add(hoodSlope);

        // Grill (more detailed)
        const grillGeometry = new THREE.BoxGeometry(0.2, 1.2, 2.4);
        const grillMaterial = new THREE.MeshPhongMaterial({
            color: camoColors.chrome,
            shininess: 80
        });
        const grill = new THREE.Mesh(grillGeometry, grillMaterial);
        grill.position.set(-4.3, 1.8, 0);
        hoodGroup.add(grill);

        // Headlights
        const headlightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
        const headlightMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 100
        });
        const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlightLeft.rotation.z = Math.PI / 2;
        headlightLeft.position.set(-4.4, 1.8, 1);
        const headlightRight = headlightLeft.clone();
        headlightRight.position.z = -1;
        hoodGroup.add(headlightLeft, headlightRight);

        truck.add(hoodGroup);

        // Cabin (more detailed)
        const cabinGroup = new THREE.Group();
        
        // Main cabin frame
        const cabinGeometry = new THREE.BoxGeometry(2.2, 2, 2.8);
        const cabinMaterial = new THREE.MeshPhongMaterial({
            color: camoColors.body,
            shininess: 15
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(-1.8, 3, 0);
        cabinGroup.add(cabin);

        // Windows (more realistic)
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: camoColors.glass,
            transparent: true,
            opacity: 0.7,
            shininess: 90
        });

        // Windshield (angled)
        const windshieldGeometry = new THREE.PlaneGeometry(2, 1.5);
        const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
        windshield.position.set(-2.7, 3.2, 0);
        windshield.rotation.y = Math.PI / 2;
        windshield.rotation.z = -Math.PI / 8;
        cabinGroup.add(windshield);

        // Side windows
        const sideWindowGeometry = new THREE.PlaneGeometry(1.8, 1.2);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        leftWindow.position.set(-1.8, 3.2, 1.41);
        const rightWindow = leftWindow.clone();
        rightWindow.position.z = -1.41;
        rightWindow.rotation.y = Math.PI;
        cabinGroup.add(leftWindow, rightWindow);

        truck.add(cabinGroup);

        // Enhanced wheel system
        const createWheel = (isDouble = false) => {
            const wheelGroup = new THREE.Group();
            
            // Main tire
            const tireGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 24);
            const tireMaterial = new THREE.MeshPhongMaterial({
                color: camoColors.rubber,
                shininess: 30
            });

            // Hub cap
            const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.41, 16);
            const hubMaterial = new THREE.MeshPhongMaterial({
                color: camoColors.chrome,
                shininess: 80
            });

            if (isDouble) {
                // Double wheel for rear
                const tire1 = new THREE.Mesh(tireGeometry, tireMaterial);
                const tire2 = new THREE.Mesh(tireGeometry, tireMaterial);
                const hub1 = new THREE.Mesh(hubGeometry, hubMaterial);
                const hub2 = new THREE.Mesh(hubGeometry, hubMaterial);
                
                tire1.position.z = 0.25;
                tire2.position.z = -0.25;
                hub1.position.z = 0.25;
                hub2.position.z = -0.25;
                
                wheelGroup.add(tire1, tire2, hub1, hub2);
            } else {
                // Single wheel for front
                const tire = new THREE.Mesh(tireGeometry, tireMaterial);
                const hub = new THREE.Mesh(hubGeometry, hubMaterial);
                wheelGroup.add(tire, hub);
            }

            return wheelGroup;
        };

        // Wheel positions
        const wheelPositions = [
            { pos: [-3.5, 0.6, 1.2], double: false },  // Front right
            { pos: [-3.5, 0.6, -1.2], double: false }, // Front left
            { pos: [1.5, 0.6, 1.2], double: false },   // Back right
            { pos: [1.5, 0.6, -1.2], double: false }   // Back left
        ];

        wheelPositions.forEach(({pos, double}) => {
            const wheel = createWheel(double);
            wheel.position.set(...pos);
            wheel.rotation.x = Math.PI / 2; // Align wheels with the truck axis
            truck.add(wheel);
        });

        
        // Add shadows
        truck.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // Collision detection
        const truckCollisionGeometry = new THREE.BoxGeometry(9, 4, 3.5);
        const truckCollisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        const truckCollision = new THREE.Mesh(truckCollisionGeometry, truckCollisionMaterial);
        truckCollision.position.y = 2;
        truck.add(truckCollision);

        // Position the truck
        truck.position.set(20, 0, -15);
        truck.rotation.y = -Math.PI / 4;

        // Add to collidable objects
        game.collidableObjects.push(truckCollision);
        
        // Add truck to scene
        game.scene.add(truck);
    }
}

export { Vehicles };