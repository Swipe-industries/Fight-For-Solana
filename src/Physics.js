class Physics {
    static checkCollision(game, position) {
        // Check for collisions with all collidable objects
        for (const object of game.collidableObjects) {
            // Get object's world position and size
            const objectBox = new THREE.Box3().setFromObject(object);
            
            // Create player bounding box at the new position
            const playerBox = new THREE.Box3();
            playerBox.min.set(
                position.x - game.collisionRadius * 0.9, // Slightly smaller collision box
                position.y - game.playerHeight,
                position.z - game.collisionRadius * 0.9  // Slightly smaller collision box
            );
            playerBox.max.set(
                position.x + game.collisionRadius * 0.9, // Slightly smaller collision box
                position.y + game.playerHeight,
                position.z + game.collisionRadius * 0.9  // Slightly smaller collision box
            );
            
            // Check for intersection
            if (playerBox.intersectsBox(objectBox)) {
                return true;
            }
        }
        return false;
    }

    // Add method to check if player is stuck at start
    static checkPlayerStuck(game) {
        // Count how many directions are blocked
        let blockedDirections = 0;
        const testDistance = game.moveSpeed * 2;
        const directions = [
            new THREE.Vector3(1, 0, 0),   // right
            new THREE.Vector3(-1, 0, 0),  // left
            new THREE.Vector3(0, 0, 1),   // forward
            new THREE.Vector3(0, 0, -1)   // backward
        ];
        
        for (const dir of directions) {
            const testPos = game.player.position.clone().add(dir.multiplyScalar(testDistance));
            if (Physics.checkCollision(game, testPos)) {
                blockedDirections++;
            }
        }
        
        // If player is blocked in 3 or more directions, they're likely stuck
        if (blockedDirections >= 3) {
            // Find a safe position to teleport the player
            const safePos = Physics.findSafePosition(game);
            if (safePos) {
                game.player.position.copy(safePos);
                return true;
            }
        }
        return false;
    }
    
    // Find a safe position for the player
    static findSafePosition(game) {
        // Try a few positions near the player
        const searchRadius = 10;
        const attempts = 10;
        
        for (let i = 0; i < attempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * searchRadius;
            const testPos = new THREE.Vector3(
                game.player.position.x + Math.cos(angle) * distance,
                game.player.position.y,
                game.player.position.z + Math.sin(angle) * distance
            );
            
            if (!Physics.checkCollision(game, testPos)) {
                return testPos;
            }
        }
        
        // If all attempts fail, try a default safe position
        const defaultPos = new THREE.Vector3(0, game.playerHeight, 0);
        return !Physics.checkCollision(game, defaultPos) ? defaultPos : null;
    }

    static updateMovement(game) {
        const delta = 0.016;
        
        // Check if player is stuck at game start (only run this once)
        if (!game.checkedInitialPosition && game.gameTime > 1) {
            game.checkedInitialPosition = true;
            Physics.checkPlayerStuck(game);
        }
        
        // Apply gravity
        game.velocity.y -= 20.0 * delta;
        
        // Rest of the updateMovement method remains unchanged
        // Update player animation - only animate when moving, not sliding
        if ((game.moveForward || game.moveBackward || game.moveLeft || game.moveRight) && !game.isSliding) {
            Player.animateRunning(game, delta, false);
        } else {
            Player.resetLegs(game);
        }

        // Store current position for collision detection
        const currentPosition = game.player.position.clone();
        
        // Update Y position
        game.player.position.y += game.velocity.y * delta * 1.8;
        
        // Floor collision
        if(game.player.position.y < game.playerHeight) {
            game.velocity.y = 0;
            game.player.position.y = game.playerHeight;
            game.canJump = true;
        }

        // Movement relative to player rotation
        const direction = new THREE.Vector3();
        
        if(game.moveForward) direction.z -= 1;
        if(game.moveBackward) direction.z += 1;
        if(game.moveLeft) direction.x -= 1;
        if(game.moveRight) direction.x += 1;

        direction.normalize();
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.targetRotation.y);
        
        // Calculate new position
        const newPosition = game.player.position.clone();
        
        // Handle sliding mechanic
        if (game.isSliding) {
            // Apply sliding momentum
            if (!game.slideDirection) {
                // Start new slide in current direction
                game.slideDirection = direction.clone();
                game.slideMomentum = 0.4; // Initial slide momentum
                
                // Tilt player forward during slide
                game.player.children[0].rotation.x = 0.3;
            }
            
            // Apply slide momentum with decay
            game.slideMomentum *= 0.95; // Gradual slowdown
            
            // Stop sliding if momentum is too low
            if (game.slideMomentum < 0.05) {
                game.isSliding = false;
                game.slideDirection = null;
                game.player.children[0].rotation.x = 0;
            } else {
                // Move in slide direction with momentum
                newPosition.x += game.slideDirection.x * game.slideMomentum;
                newPosition.z += game.slideDirection.z * game.slideMomentum;
            }
        } else {
            // Normal movement with increased speed
            newPosition.x += direction.x * game.moveSpeed;
            newPosition.z += direction.z * game.moveSpeed;
        }
        
        // Check for collisions at new position
        if (!Physics.checkCollision(game, newPosition)) {
            game.player.position.copy(newPosition);
        } else {
            // Try to slide along walls
            const xOnlyPosition = game.player.position.clone();
            xOnlyPosition.x += direction.x * game.moveSpeed;
            
            const zOnlyPosition = game.player.position.clone();
            zOnlyPosition.z += direction.z * game.moveSpeed;
            
            // Check X-axis movement
            if (!Physics.checkCollision(game, xOnlyPosition)) {
                game.player.position.copy(xOnlyPosition);
            }
            
            // Check Z-axis movement
            if (!Physics.checkCollision(game, zOnlyPosition)) {
                game.player.position.copy(zOnlyPosition);
            }
        }

        // After updating player position, update camera position
        game.camera.position.x = game.player.position.x;
        game.camera.position.z = game.player.position.z;
        game.camera.position.y = game.player.position.y + 1.7; // Eye level
        
        // Ensure camera rotation is maintained
        game.camera.rotation.order = "YXZ";
        game.camera.rotation.y = game.player.rotation.y;
        game.camera.rotation.x = game.cameraPitch;
    }
}