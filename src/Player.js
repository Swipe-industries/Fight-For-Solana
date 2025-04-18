class Player {
    static createPlayer(game) {
        const playerGroup = new THREE.Group();
        
        // Updated materials for female character
        const suitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8e44ad,  // Purple outfit
            shininess: 30
        });
        const skinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffe0bd,  // Lighter skin tone
            shininess: 20
        });
        const hairMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,  // Brown hair
            shininess: 40
        });
        
        // More detailed torso (female proportions)
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.4, 0.5),
            suitMaterial
        );
        torso.position.y = 0.75;
        playerGroup.add(torso);

        // Head with female features
        const head = new THREE.Group();
        const skull = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 32, 32),
            skinMaterial
        );
        const face = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.55, 0.25),
            skinMaterial
        );
        face.position.z = 0.1;
        
        // Add hair
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            hairMaterial
        );
        hair.rotation.x = Math.PI;
        hair.position.y = 0.1;
        
        head.add(skull);
        head.add(face);
        head.add(hair);
        head.position.y = 1.8;
        playerGroup.add(head);

        // Updated arm creation with slimmer proportions
        const createArm = (isLeft) => {
            const arm = new THREE.Group();
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.1, 0.6),
                suitMaterial
            );
            const lowerArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.09, 0.6),
                suitMaterial
            );
            const hand = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                skinMaterial
            );
            
            upperArm.position.y = -0.3;
            lowerArm.position.y = -0.9;
            hand.position.y = -1.2;
            
            arm.add(upperArm);
            arm.add(lowerArm);
            arm.add(hand);
            
            arm.position.set(isLeft ? -0.5 : 0.5, 1.4, 0);
            return arm;
        };
        
        playerGroup.add(createArm(true));
        playerGroup.add(createArm(false));

        // Updated legs with female proportions
        const createLeg = (isLeft) => {
            const leg = new THREE.Group();
            const upperLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.13, 0.8),
                suitMaterial
            );
            const lowerLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.11, 0.8),
                suitMaterial
            );
            const shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.1, 0.35),
                new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 60 })
            );
            
            upperLeg.position.y = -0.4;
            lowerLeg.position.y = -1.2;
            shoe.position.y = -1.6;
            shoe.position.z = 0.1;
            
            leg.add(upperLeg);
            leg.add(lowerLeg);
            leg.add(shoe);
            
            leg.position.set(isLeft ? -0.3 : 0.3, 0.8, 0);
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
            child.position.y === 0.8 && (child.position.x === -0.3 || child.position.x === 0.3)
        );
        
        // Reduced frequency for more natural movement
        const frequency = isRunning ? 6 : 4;  // Reduced from 12/8 to 6/4
        const amplitude = isRunning ? 0.6 : 0.35;  // Slightly reduced amplitude
        
        // Use delta time for smoother animation
        const time = Date.now() * 0.005;  // Reduced time factor from 0.01 to 0.005
        
        legs.forEach((leg, index) => {
            leg.rotation.x = Math.sin(time * frequency + index * Math.PI) * amplitude;
        });

        // Get arms by their position
        const arms = game.player.children.filter(child =>
            child.position.y === 1.4 && (child.position.x === -0.5 || child.position.x === 0.5)
        );
        
        arms.forEach((arm, index) => {
            // Opposite phase to legs for natural walking motion
            arm.rotation.x = -Math.sin(time * frequency + index * Math.PI) * amplitude;
            // Reduced side swing
            arm.rotation.z = Math.cos(time * frequency + index * Math.PI) * (amplitude * 0.2);
        });

        // Add slight body movement
        const torso = game.player.children[0];
        if (isRunning) {
            // Slight forward lean when running
            torso.rotation.x = 0.1 + Math.sin(time * frequency * 2) * 0.05;
            // Slight side-to-side movement
            torso.rotation.z = Math.sin(time * frequency) * 0.03;
        } else {
            // Less movement when walking
            torso.rotation.x = Math.sin(time * frequency * 2) * 0.03;
            torso.rotation.z = Math.sin(time * frequency) * 0.02;
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