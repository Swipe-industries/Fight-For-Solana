import * as THREE from 'three';

class Player {
    static createPlayer(game) {
        const playerGroup = new THREE.Group();
        
        // Updated materials for realistic human appearance
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
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
        
        // More curved torso using cylinder instead of box
        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.3, 1.2, 12),
            bodyMaterial
        );
        torso.position.y = 0.8;
        playerGroup.add(torso);

        // Add curved hips for more realistic body shape
        const hips = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.35, 0.3, 12),
            bodyMaterial
        );
        hips.position.y = 0.15;
        playerGroup.add(hips);

        // Neck
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.15, 0.15, 12),
            skinMaterial
        );
        neck.position.y = 1.5;
        playerGroup.add(neck);

        // Head with more realistic proportions
        const head = new THREE.Group();
        const skull = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 32, 32),
            skinMaterial
        );
        
        // Face with better features - use sphere instead of box
        const face = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 32, 32, 0, Math.PI, 0, Math.PI),
            skinMaterial
        );
        face.position.z = 0.05;
        face.scale.z = 0.7;
        
        // Add hair with more natural shape
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
        playerGroup.add(head);

        // Updated arm creation with more realistic proportions
        const createArm = (isLeft) => {
            const arm = new THREE.Group();
            
            // Shoulder joint
            const shoulder = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 16, 16),
                skinMaterial
            );
            
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.08, 0.5, 12),
                skinMaterial
            );
            upperArm.position.y = -0.3;
            
            // Elbow joint
            const elbow = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 16, 16),
                skinMaterial
            );
            elbow.position.y = -0.6;
            
            const lowerArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.07, 0.5, 12),
                skinMaterial
            );
            lowerArm.position.y = -0.9;
            
            const hand = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 16, 16),
                skinMaterial
            );
            hand.position.y = -1.2;
            
            // Add sleeve for clothing
            const sleeve = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.1, 0.3, 12),
                bodyMaterial
            );
            sleeve.position.y = -0.15;
            
            arm.add(shoulder);
            arm.add(upperArm);
            arm.add(elbow);
            arm.add(lowerArm);
            arm.add(hand);
            arm.add(sleeve);
            
            arm.position.set(isLeft ? -0.45 : 0.45, 1.4, 0);
            return arm;
        };
        
        playerGroup.add(createArm(true));
        playerGroup.add(createArm(false));

        // Updated legs with more realistic proportions
        const createLeg = (isLeft) => {
            const leg = new THREE.Group();
            
            // Hip joint
            const hip = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 16, 16),
                bodyMaterial
            );
            
            const upperLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.11, 0.7, 12),
                bodyMaterial
            );
            upperLeg.position.y = -0.4;
            
            // Knee joint
            const knee = new THREE.Mesh(
                new THREE.SphereGeometry(0.11, 16, 16),
                bodyMaterial
            );
            knee.position.y = -0.8;
            
            const lowerLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.11, 0.09, 0.7, 12),
                bodyMaterial
            );
            lowerLeg.position.y = -1.2;
            
            // Ankle joint
            const ankle = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 16, 16),
                skinMaterial
            );
            ankle.position.y = -1.6;
            
            const shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.1, 0.3),
                new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 60 })
            );
            shoe.position.y = -1.7;
            shoe.position.z = 0.08;
            
            leg.add(hip);
            leg.add(upperLeg);
            leg.add(knee);
            leg.add(lowerLeg);
            leg.add(ankle);
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
        const frequency = isRunning ? 6 : 4;
        const amplitude = isRunning ? 0.6 : 0.35;
        
        // Use delta time for smoother animation
        const time = Date.now() * 0.005;
        
        legs.forEach((leg, index) => {
            leg.rotation.x = Math.sin(time * frequency + index * Math.PI) * amplitude;
        });

        // Get arms by their position
        const arms = game.player.children.filter(child =>
            child.position.y === 1.4 && (child.position.x === -0.45 || child.position.x === 0.45)
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
            (child.position.y === 1.4 && (child.position.x === -0.45 || child.position.x === 0.45))
        );
        
        limbs.forEach(limb => {
            limb.rotation.x = 0;
            limb.rotation.z = 0;
        });
        
        // Reset torso rotation
        const torso = game.player.children[0];
        torso.rotation.x = 0;
        torso.rotation.z = 0;
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

export { Player };