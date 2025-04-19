class Physics {
    static checkCollision(game, position) {
        // Check for collisions with all collidable objects
        for (const object of game.collidableObjects) {
            // Get object's world position and size
            const objectBox = new THREE.Box3().setFromObject(object);
            
            // Create player bounding box at the new position
            const playerBox = new THREE.Box3();
            playerBox.min.set(
                position.x - game.collisionRadius,
                position.y - game.playerHeight,
                position.z - game.collisionRadius
            );
            playerBox.max.set(
                position.x + game.collisionRadius,
                position.y + game.playerHeight,
                position.z + game.collisionRadius
            );
            
            // Check for intersection
            if (playerBox.intersectsBox(objectBox)) {
                return true;
            }
        }
        return false;
    }

    static updateMovement(game) {
        const delta = 0.016;
        
        // Apply gravity
        game.velocity.y -= 20.0 * delta;
        
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