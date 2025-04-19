import * as THREE from 'three';

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

    static createDestroyedTank(game) {
        const tank = new THREE.Group();

        // Enhanced tank colors
        const tankColors = {
            body: 0xC2B280,        // Desert tan color
            tracks: 0x1a1a1a,      // Dark track color
            damage: 0x2C2C2C,      // Burnt metal
            rust: 0x8B4513,        // Rust color
            details: 0x4A4A4A      // Dark details
        };

        // Main hull with better proportions
        const hullGeometry = new THREE.BoxGeometry(6, 1.8, 3.5);
        const hullMaterial = new THREE.MeshPhongMaterial({
            color: tankColors.body,
            roughness: 0.7,
            metalness: 0.3
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        tank.add(hull);

        // Add hull details (side armor plates)
        const sideArmorGeometry = new THREE.BoxGeometry(5.5, 0.4, 0.3);
        const sideArmor1 = new THREE.Mesh(sideArmorGeometry, hullMaterial);
        sideArmor1.position.set(0, 1.2, 1.8);
        const sideArmor2 = sideArmor1.clone();
        sideArmor2.position.z = -1.8;
        tank.add(sideArmor1, sideArmor2);

        // Improved turret with angled surfaces
        const turretGroup = new THREE.Group();
        
        // Main turret body
        const turretGeometry = new THREE.BoxGeometry(3, 1.2, 2.8);
        const turret = new THREE.Mesh(turretGeometry, hullMaterial);
        turret.position.y = 2.4;
        turret.rotation.z = Math.PI / 12; // Slight damage tilt
        
        // Turret front slope
        const turretSlopeGeometry = new THREE.BoxGeometry(1, 1.2, 2.8);
        const turretSlope = new THREE.Mesh(turretSlopeGeometry, hullMaterial);
        turretSlope.position.set(1.5, 0, 0);
        turretSlope.rotation.z = Math.PI / 6;
        turret.add(turretSlope);
        
        // Turret details
        const hatchGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
        const hatch = new THREE.Mesh(hatchGeometry, hullMaterial);
        hatch.position.set(-0.5, 0.7, 0);
        turret.add(hatch);

        turretGroup.add(turret);
        tank.add(turretGroup);

        // Enhanced main gun
        const gunGroup = new THREE.Group();
        
        // Main barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 16);
        const barrelMaterial = new THREE.MeshPhongMaterial({
            color: tankColors.damage,
            roughness: 0.6
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        
        // Muzzle brake
        const muzzleGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 16);
        const muzzle = new THREE.Mesh(muzzleGeometry, barrelMaterial);
        muzzle.position.x = 2;
        muzzle.rotation.z = Math.PI / 2;
        
        gunGroup.add(barrel, muzzle);
        gunGroup.position.set(2, 2.8, 0);
        gunGroup.rotation.y = Math.PI / 12; // Damage angle
        tank.add(gunGroup);

        // Enhanced tracks system
        const createTrack = (isLeft) => {
            const trackGroup = new THREE.Group();
            
            // Main track belt
            const trackGeometry = new THREE.BoxGeometry(6.5, 0.8, 0.6);
            const trackMaterial = new THREE.MeshPhongMaterial({
                color: tankColors.tracks,
                roughness: 0.9
            });
            const track = new THREE.Mesh(trackGeometry, trackMaterial);
            
            // Track wheels
            for(let i = 0; i < 5; i++) {
                const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
                const wheel = new THREE.Mesh(wheelGeometry, trackMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(-2.5 + i * 1.3, 0, 0);
                trackGroup.add(wheel);
            }
            
            track.position.z = isLeft ? 1.7 : -1.7;
            track.position.y = 0.4;
            trackGroup.add(track);
            return trackGroup;
        };

        tank.add(createTrack(true));
        tank.add(createTrack(false));

        // Enhanced battle damage effects
        const addDamageDetail = () => {
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const material = new THREE.MeshPhongMaterial({
                color: tankColors.damage,
                roughness: 1
            });
            const damage = new THREE.Mesh(geometry, material);
            damage.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            return damage;
        };

        // Add random damage details
        for(let i = 0; i < 3; i++) {
            const damage = addDamageDetail();
            damage.position.set(
                (Math.random() - 0.5) * 4,
                1 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            tank.add(damage);
        }

        // Add shadows
        tank.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // Collision detection
        const tankCollisionGeometry = new THREE.BoxGeometry(6, 3, 3.5);
        const tankCollisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        const tankCollision = new THREE.Mesh(tankCollisionGeometry, tankCollisionMaterial);
        tankCollision.position.y = 1.5;
        tank.add(tankCollision);

        // Position the tank opposite to the truck
        tank.position.set(-20, 0, 15); // Opposite corner from the truck
        tank.rotation.y = Math.PI / 6; // Slight angle

        // Add to collidable objects
        game.collidableObjects.push(tankCollision);
        
        // Add tank to scene
        game.scene.add(tank);
    }
}

export { Vehicles };