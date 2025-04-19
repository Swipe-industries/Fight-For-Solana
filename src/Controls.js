import * as THREE from 'three';
import { Player } from './Player.js';

class Controls {
    static setupEventListeners(game) {
        // Store handlers as properties of the game object so we can remove them later
        game.keyDownHandler = (event) => {
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
                case 'KeyK':
                    game.respawnPlayer();
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