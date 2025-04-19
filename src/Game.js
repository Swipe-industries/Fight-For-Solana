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
        
        // Add updateable objects array for animations
        this.updateableObjects = [];
        this.lastTime = performance.now();
        
        // Initialize game components
        Player.createPlayer(this);
        Environment.setupLights(this);
        Environment.createMap(this);
        Controls.setupEventListeners(this);
        
        // Set player starting position away from building
        this.player.position.set(20, this.playerHeight, 20);
        
        // Start game loop
        this.animate();
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update all updateable objects
        this.updateableObjects.forEach(obj => {
            if (obj.userData && obj.userData.update) {
                obj.userData.update(deltaTime);
            }
        });

        // Update physics and render
        Physics.updateMovement(this);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.animate());
    }

    // Add method to cleanup updateable objects
    removeUpdateableObject(object) {
        const index = this.updateableObjects.indexOf(object);
        if (index > -1) {
            this.updateableObjects.splice(index, 1);
        }
    }

    dispose() {
        cancelAnimationFrame(this.animationFrameId);
        Controls.removeEventListeners(this);
        
        // Clear updateable objects
        this.updateableObjects = [];
        
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