class Physics {
    static checkCollision(game, position) {
        // Check collisions in all directions
        const directions = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(1, 0, 1).normalize(),
            new THREE.Vector3(-1, 0, 1).normalize(),
            new THREE.Vector3(1, 0, -1).normalize(),
            new THREE.Vector3(-1, 0, -1).normalize()
        ];

        for (const direction of directions) {
            game.raycaster.set(
                new THREE.Vector3(position.x, position.y + 1, position.z),
                direction
            );
            const intersects = game.raycaster.intersectObjects(game.collidableObjects);
            
            if (intersects.length > 0 && intersects[0].distance < game.collisionRadius) {
                return true;
            }
        }
        return false;
    }

    static updateMovement(game) {
        const delta = 0.016;
        
        // Apply gravity
        game.velocity.y -= 9.8 * delta;
        
        // Update player animation
        if (game.moveForward || game.moveBackward || game.moveLeft || game.moveRight) {
            Player.animateRunning(game, delta, game.isRunning);
        } else {
            Player.resetLegs(game);
        }

        // Store current position for collision detection
        const currentPosition = game.player.position.clone();
        
        // Update Y position (vertical movement)
        game.player.position.y += game.velocity.y * delta;
        
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
        // Use running speed when shift is pressed
        const currentSpeed = game.isRunning ? game.runSpeed : game.moveSpeed;
        newPosition.x += direction.x * currentSpeed;
        newPosition.z += direction.z * currentSpeed;
        
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

        // Update camera position
        const idealOffset = game.cameraOffset.clone();
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.targetRotation.y);
        
        game.camera.position.copy(game.player.position).add(idealOffset);
        game.camera.lookAt(
            game.player.position.x,
            game.player.position.y + 2,
            game.player.position.z
        );
    }
}