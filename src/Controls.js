import * as THREE from 'three';
import { Player } from './Player.js';

class Controls {
    static setupEventListeners(game) {
        game.keyDownHandler = (event) => {
            switch(event.code) {
                case 'KeyW': game.moveForward = true; break;
                case 'KeyS': game.moveBackward = true; break;
                case 'KeyA': game.moveLeft = true; break;
                case 'KeyD': game.moveRight = true; break;
                case 'ShiftLeft': 
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
                case 'KeyK':
                    // Instant death (suicide)
                    game.health = 0;
                    document.getElementById('health').textContent = `Health: ${game.health}`;
                    
                    // Short delay before respawn for effect
                    setTimeout(() => {
                        // Reset player stats
                        game.health = 100;
                        game.ammo = 30;
                        document.getElementById('health').textContent = `Health: ${game.health}`;
                        document.getElementById('ammo').textContent = `Ammo: ${game.ammo}`;
                        
                        // Reset movement states
                        game.moveForward = false;
                        game.moveBackward = false;
                        game.moveLeft = false;
                        game.moveRight = false;
                        game.isSliding = false;
                        game.velocity.set(0, 0, 0);
                        
                        // Find safe spawn position
                        const safeDistance = 15;
                        let validPosition = false;
                        let attempts = 0;
                        const maxAttempts = 30;

                        while (attempts < maxAttempts && !validPosition) {
                            validPosition = true;
                            const x = (Math.random() - 0.5) * 80;
                            const z = (Math.random() - 0.5) * 80;
                            
                            // Check distance from building center
                            if (Math.sqrt(x * x + z * z) < 20) {
                                validPosition = false;
                                attempts++;
                                continue;
                            }
                            
                            // Check distance from all collidable objects
                            for (const obj of game.collidableObjects) {
                                const dx = x - obj.position.x;
                                const dz = z - obj.position.z;
                                const distance = Math.sqrt(dx * dx + dz * dz);
                                
                                if (distance < safeDistance) {
                                    validPosition = false;
                                    break;
                                }
                            }

                            if (validPosition) {
                                game.player.position.set(x, game.playerHeight, z);
                                break;
                            }
                            attempts++;
                        }

                        // If no safe position found, use fallback position
                        if (!validPosition) {
                            game.player.position.set(20, game.playerHeight, 20);
                        }
                    }, 500);
                    break;
            }
        };
        
        game.keyUpHandler = (event) => Controls.onKeyUp(game, event);
        game.mouseMoveHandler = (event) => Controls.onMouseMove(game, event);
        game.clickHandler = () => Player.shoot(game);
        
        // Add event listeners with the stored handlers
        document.addEventListener('keydown', game.keyDownHandler);
        document.addEventListener('keyup', game.keyUpHandler);
        document.addEventListener('mousemove', game.mouseMoveHandler);
        document.addEventListener('click', game.clickHandler);

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
    
    // Updated removeEventListeners method
    static removeEventListeners(game) {
        if (game.keyDownHandler) document.removeEventListener('keydown', game.keyDownHandler);
        if (game.keyUpHandler) document.removeEventListener('keyup', game.keyUpHandler);
        if (game.mouseMoveHandler) document.removeEventListener('mousemove', game.mouseMoveHandler);
        if (game.clickHandler) document.removeEventListener('click', game.clickHandler);
    }
}

// Export the Controls class
export { Controls };