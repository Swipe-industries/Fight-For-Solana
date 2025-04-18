class Controls {
    static setupEventListeners(game) {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW': game.moveForward = true; break;
                case 'KeyS': game.moveBackward = true; break;
                case 'KeyA': game.moveLeft = true; break;
                case 'KeyD': game.moveRight = true; break;
                case 'ShiftLeft': game.isRunning = true; break;
                // In the keydown event handler
                case 'Space':
                    if (game.canJump) {
                        game.velocity.y = 10; // Reduced from 12 to 10
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
            case 'ShiftLeft': game.isRunning = false; break;
        }
    }

    static onMouseMove(game, event) {
        if(document.pointerLockElement === game.renderer.domElement) {
            // Horizontal rotation (left/right)
            game.targetRotation.y -= event.movementX * game.mouseSensitivity;
            game.player.rotation.y = game.targetRotation.y;
            
            // Vertical rotation (up/down) with limits
            game.targetRotation.x -= event.movementY * game.mouseSensitivity;
            
            // Limit vertical look angle to prevent over-rotation
            game.targetRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, game.targetRotation.x));
            
            // Apply camera pitch
            game.camera.rotation.x = game.targetRotation.x;
        }
    }
}