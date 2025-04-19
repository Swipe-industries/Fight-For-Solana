class Controls {
    static setupEventListeners(game) {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW': game.moveForward = true; break;
                case 'KeyS': game.moveBackward = true; break;
                case 'KeyA': game.moveLeft = true; break;
                case 'KeyD': game.moveRight = true; break;
                case 'ShiftLeft': 
                    // Only start sliding if player is moving and not already sliding
                    if ((game.moveForward || game.moveBackward || game.moveLeft || game.moveRight) 
                        && !game.isSliding && game.canJump) {
                        game.isSliding = true;
                    }
                    break;
                case 'Space':
                    if (game.canJump) {
                        game.velocity.y = 10;
                        game.canJump = false;
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => Controls.onKeyUp(game, event));
        document.addEventListener('mousemove', (event) => Controls.onMouseMove(game, event));
        document.addEventListener('click', () => Player.shoot(game));

        // Lock pointer on click
        game.renderer.domElement.addEventListener('click', () => {
            game.renderer.domElement.requestPointerLock();
        });

        window.addEventListener('resize', () => {
            game.camera.aspect = window.innerWidth / window.innerHeight;
            game.camera.updateProjectionMatrix();
            game.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    static onKeyUp(game, event) {
        switch(event.code) {
            case 'KeyW': game.moveForward = false; break;
            case 'KeyS': game.moveBackward = false; break;
            case 'KeyA': game.moveLeft = false; break;
            case 'KeyD': game.moveRight = false; break;
            // No need to handle ShiftLeft keyup since sliding continues until momentum is gone
        }
    }

    static onMouseMove(game, event) {
        if(document.pointerLockElement === game.renderer.domElement) {
            // Horizontal rotation (left/right)
            game.targetRotation.y -= event.movementX * game.mouseSensitivity;
            game.player.rotation.y = game.targetRotation.y;
            
            // Vertical rotation (up/down) with limits
            game.cameraPitch -= event.movementY * game.mouseSensitivity;
            
            // Limit vertical look angle to prevent over-rotation
            game.cameraPitch = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, game.cameraPitch));
            
            // Apply camera pitch
            game.camera.position.y = game.player.position.y + 1.7; // Eye level
            
            // Update camera direction based on player rotation and camera pitch
            game.camera.rotation.order = "YXZ"; // Important for proper rotation order
            game.camera.rotation.y = game.player.rotation.y;
            game.camera.rotation.x = game.cameraPitch;
        }
    }
}