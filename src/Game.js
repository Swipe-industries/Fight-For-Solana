import * as THREE from 'three';
import { Player } from './Player.js';
import { Environment } from './Environment.js';
import { Controls } from './Controls.js';
import { Physics } from './Physics.js';

class Game {
    constructor(container) {
        this.scene = new THREE.Scene();
        // Evening sky color
        this.scene.background = new THREE.Color(0x2c3e50); // Darker blue-gray evening sky
        this.scene.fog = new THREE.Fog(0x2c3e50, 20, 100); // Match fog to sky color
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Better color reproduction
        
        // Make sure to use the container parameter instead of document.getElementById
        container.appendChild(this.renderer.domElement);
        
        // Player properties
        this.playerHeight = 1; 
        this.moveSpeed = 0.25; // Increased normal speed
        this.isSliding = false; // For sliding mechanic
        this.slideDirection = null; // Track slide direction
        this.slideMomentum = 0; // Track slide momentum
        this.health = 100;
        this.ammo = 30;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.velocity = new THREE.Vector3();

        // Mouse look
        this.mouseSensitivity = 0.002;
        this.targetRotation = new THREE.Vector3(0, 0, 0);
        this.cameraPitch = 0; // Track vertical camera angle
        
        // Collision detection properties
        this.collidableObjects = [];
        this.collisionRadius = 0.8; // Character collision radius
        this.raycaster = new THREE.Raycaster();
        
        // Initialize game components
        Player.createPlayer(this);
        Environment.setupLights(this);
        Environment.createMap(this);
        Controls.setupEventListeners(this);
        
        // Set player starting position away from building
        this.player.position.set(20, this.playerHeight, 20);
        
        // Create UI elements
        this.createUI();
        
        // Start game loop
        this.animate();
    }
    
    createUI() {
        // Create controls UI if it doesn't exist
        if (!document.querySelector('.controls-ui')) {
            const controlsUI = document.createElement('div');
            controlsUI.className = 'controls-ui';
            controlsUI.style.position = 'absolute';
            controlsUI.style.top = '20px';
            controlsUI.style.right = '20px';
            controlsUI.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            controlsUI.style.color = 'white';
            controlsUI.style.padding = '10px';
            controlsUI.style.borderRadius = '5px';
            controlsUI.style.fontFamily = 'Arial, sans-serif';
            
            controlsUI.innerHTML = `
                <div>WASD - Move</div>
                <div>Space - Jump</div>
                <div>Shift - Slide</div>
                <div>K - Respawn</div>
            `;
            
            document.body.appendChild(controlsUI);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        Physics.updateMovement(this);
        this.renderer.render(this.scene, this.camera);
    }
    
    respawnPlayer() {
        // Reset player position
        const safeDistance = 15;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts && !validPosition) {
            // Try a new random position
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            
            // Check distance from all collidable objects
            validPosition = true;
            for (const obj of this.collidableObjects) {
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
                this.player.position.set(x, this.playerHeight, z);
                this.velocity.set(0, 0, 0);
                return;
            }
            
            attempts++;
        }

        // If no safe position found, spawn at origin
        this.player.position.set(0, this.playerHeight, 0);
        this.velocity.set(0, 0, 0);
    }
    
    // Add a dispose method for cleanup
    dispose() {
        cancelAnimationFrame(this.animationFrameId);
        Controls.removeEventListeners(this);
        
        // Dispose of Three.js resources
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
    }
}

export { Game };