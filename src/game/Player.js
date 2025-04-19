class Player {
    respawn() {
        const safeDistance = 15; // Minimum safe distance from trees
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 30;

        while (!attempts < maxAttempts && !validPosition) {
            // Try a new random position
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            
            // Check distance from all collidable objects
            validPosition = true;
            for (const obj of this.game.collidableObjects) {
                if (obj.userData && obj.userData.isTree) {
                    const dx = x - obj.position.x;
                    const dz = z - obj.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < safeDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }

            if (validPosition) {
                this.mesh.position.set(x, 1, z);
                this.velocity.set(0, 0, 0);
                return;
            }
            
            attempts++;
        }

        // If no safe position found, spawn at origin
        this.mesh.position.set(0, 1, 0);
        this.velocity.set(0, 0, 0);
    }
}