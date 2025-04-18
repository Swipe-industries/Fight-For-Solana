class Player {
    static createPlayer(game) {
        const playerGroup = new THREE.Group();
        
        // Updated materials for suit appearance
        const suitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,  // Dark suit color
            shininess: 30
        });
        const skinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe8beac,  // Natural skin tone
            shininess: 20
        });
        const shirtMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,  // White shirt
            shininess: 40
        });
        
        // More detailed torso (suit jacket)
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1.5, 0.6),
            suitMaterial
        );
        torso.position.y = 0.75;  // Lowered position
        playerGroup.add(torso);

        // Shirt collar
        const collar = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.2, 0.3),
            shirtMaterial
        );
        collar.position.set(0, 1.4, 0.2);
        playerGroup.add(collar);

        // Head with better proportions
        const head = new THREE.Group();
        const skull = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 32, 32),
            skinMaterial
        );
        const face = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.3),
            skinMaterial
        );
        face.position.z = 0.1;
        head.add(skull);
        head.add(face);
        head.position.y = 1.8;  // Adjusted height
        playerGroup.add(head);

        // Updated arm creation with suit sleeves
        const createArm = (isLeft) => {
            const arm = new THREE.Group();
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.12, 0.6),
                suitMaterial
            );
            const lowerArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.11, 0.6),
                suitMaterial
            );
            const hand = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 16, 16),
                skinMaterial
            );
            
            upperArm.position.y = -0.3;
            lowerArm.position.y = -0.9;
            hand.position.y = -1.2;
            
            arm.add(upperArm);
            arm.add(lowerArm);
            arm.add(hand);
            
            arm.position.set(isLeft ? -0.5 : 0.5, 1.4, 0);  // Adjusted position
            return arm;
        };
        
        playerGroup.add(createArm(true));
        playerGroup.add(createArm(false));

        // Updated legs with suit pants
        const createLeg = (isLeft) => {
            const leg = new THREE.Group();
            const upperLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.15, 0.8),
                suitMaterial
            );
            const lowerLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.13, 0.8),
                suitMaterial
            );
            const shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.1, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 60 })  // Black shoes
            );
            
            upperLeg.position.y = -0.4;
            lowerLeg.position.y = -1.2;
            shoe.position.y = -1.6;
            shoe.position.z = 0.1;
            
            leg.add(upperLeg);
            leg.add(lowerLeg);
            leg.add(shoe);
            
            leg.position.set(isLeft ? -0.3 : 0.3, 0.8, 0);  // Adjusted position
            return leg;
        };
        
        playerGroup.add(createLeg(true));
        playerGroup.add(createLeg(false));

        // Add shadows
        playerGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        game.player = playerGroup;
        game.scene.add(playerGroup);
    }

    static animateRunning(game, delta, isRunning) {
        // Get legs by their position
        const legs = game.player.children.filter(child => 
            child.position.y === 0.8 && (child.position.x === -0.2 || child.position.x === 0.2)
        );
        
        const frequency = isRunning ? 12 : 8;
        const amplitude = isRunning ? 0.7 : 0.4;
        
        legs.forEach((leg, index) => {
            leg.rotation.x = Math.sin(Date.now() * 0.01 * frequency + index * Math.PI) * amplitude;
        });

        // Get arms by their position
        const arms = game.player.children.filter(child =>
            child.position.y === 1.5 && (child.position.x === -0.45 || child.position.x === 0.45)
        );
        
        arms.forEach((arm, index) => {
            arm.rotation.x = -Math.sin(Date.now() * 0.01 * frequency + index * Math.PI) * amplitude;
            arm.rotation.z = Math.cos(Date.now() * 0.01 * frequency + index * Math.PI) * (amplitude * 0.3);
        });

        // Add slight body tilt when running
        const torso = game.player.children[0];
        if (isRunning) {
            torso.rotation.x = Math.sin(Date.now() * 0.01 * frequency) * 0.1;
        } else {
            torso.rotation.x = Math.sin(Date.now() * 0.01 * frequency) * 0.05;
        }
    }

    static resetLegs(game) {
        const limbs = game.player.children.filter(child =>
            (child.position.y === 0.8 && (child.position.x === -0.3 || child.position.x === 0.3)) ||
            (child.position.y === 1.4 && (child.position.x === -0.5 || child.position.x === 0.5))
        );
        
        limbs.forEach(limb => {
            limb.rotation.x = 0;
        });
    }

    static shoot(game) {
        if(game.ammo <= 0) return;
        game.ammo--;
        document.getElementById('ammo').textContent = `Ammo: ${game.ammo}`;

        const bulletGeometry = new THREE.SphereGeometry(0.05); // Smaller bullet
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow tracer
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        // Shoot from gun position
        const gunTip = game.player.position.clone();
        gunTip.y += 1.5; // Match gun height
        gunTip.x += Math.sin(game.targetRotation.y) * 0.3;
        gunTip.z += Math.cos(game.targetRotation.y) * 0.3;
        bullet.position.copy(gunTip);
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(game.player.quaternion);
        bullet.velocity = direction.multiplyScalar(2); // Faster bullets

        game.scene.add(bullet);
        
        setTimeout(() => {
            game.scene.remove(bullet);
        }, 1000); // Shorter bullet lifetime
    }
}