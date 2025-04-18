class Game {
    constructor() {
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
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Player properties
        this.playerHeight = 1; // Reduced from 2 to 1 for better ground contact
        this.moveSpeed = 0.15;
        this.runSpeed = 0.3;  // New running speed
        this.isRunning = false;
        this.health = 100;
        this.ammo = 30;
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.velocity = new THREE.Vector3();

        // Mouse look
        this.mouseSensitivity = 0.002;
        // Initialize rotation properties
        this.targetRotation = new THREE.Vector3(0, 0, 0);
        
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
        
        // Start game loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        Physics.updateMovement(this);
        this.renderer.render(this.scene, this.camera);
    }
}