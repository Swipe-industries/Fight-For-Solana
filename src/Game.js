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
        
        // Ensure camera is properly positioned and oriented
        this.camera.position.set(
            this.player.position.x,
            this.player.position.y + 1.7, // Eye level
            this.player.position.z
        );
        this.camera.rotation.order = "YXZ";
        
        // Start game loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        Physics.updateMovement(this);
        this.renderer.render(this.scene, this.camera);
    }
}