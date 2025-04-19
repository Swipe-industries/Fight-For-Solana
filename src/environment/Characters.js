import * as THREE from 'three';

class Characters {
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

export { Characters };