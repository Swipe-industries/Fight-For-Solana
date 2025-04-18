class Game {
    constructor() {
        this.scene = new THREE.Scene();
        // Add sky color
        this.scene.background = new THREE.Color(0x87CEEB); // Light blue sky
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100); // Add distance fog for atmosphere
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Better color reproduction
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Player properties
        this.playerHeight = 2;
        this.moveSpeed = 0.15;
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

        // Create player character
        this.createPlayer();
        
        // Mouse look
        this.mouseSensitivity = 0.002;
        this.targetRotation = new THREE.Vector3();
        
        // Collision detection properties
        this.collidableObjects = [];
        this.collisionRadius = 0.8; // Character collision radius
        this.raycaster = new THREE.Raycaster();
        
        this.setupLights();
        this.createMap();
        this.setupEventListeners();
        this.animate();
    }

    createPlayer() {
        // Create a simple humanoid figure
        const playerGroup = new THREE.Group();
        
        // Body parts with better materials
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xf1c40f });
        
        // Torso
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1.5, 0.5),
            bodyMaterial
        );
        torso.position.y = 1.5;
        playerGroup.add(torso);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            skinMaterial
        );
        head.position.y = 2.7;
        playerGroup.add(head);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        leftArm.position.set(-0.625, 2, 0);
        playerGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        rightArm.position.set(0.625, 2, 0);
        playerGroup.add(rightArm);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
        const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        leftLeg.position.set(-0.3, 0.5, 0);
        playerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        rightLeg.position.set(0.3, 0.5, 0);
        playerGroup.add(rightLeg);

        // Add shadows
        playerGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.player = playerGroup;
        this.scene.add(playerGroup);
    }

    setupLights() {
        // Brighter ambient light for daylight
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main sunlight
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        
        // Larger shadow map for better quality
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        
        // Adjust shadow camera for better coverage
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.bias = -0.001; // Reduce shadow artifacts
        
        this.scene.add(sunLight);

        // Add subtle hemisphere light for more natural lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x87CEEB, 0.6);
        this.scene.add(hemiLight);
    }

    createMap() {
        // Create terrain with different colors and heights
        const terrainGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        const vertices = terrainGeometry.attributes.position.array;
        
        // Generate random terrain heights
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 1] = Math.random() * 2; // Y coordinate
        }
        
        // Update geometry
        terrainGeometry.computeVertexNormals();
        
        // Create gradient material with brighter, more natural colors
        const terrainMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true,
            roughness: 0.8,
            metalness: 0.2
        });

        // Add vertex colors based on height with brighter daylight colors
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 1];
            if (height < 0.5) {
                colors.push(0.4, 0.8, 0.3); // Brighter grass
            } else if (height < 1) {
                colors.push(0.8, 0.6, 0.4); // Lighter dirt
            } else {
                colors.push(0.9, 0.9, 0.9); // Lighter rock
            }
        }

        terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);

        // Add obstacles and decorations
        this.addObstacles();
    }

    addObstacles() {
        // Create various obstacles with brighter, more vibrant colors
        const obstacles = [
            { pos: [10, 1, -10], scale: [3, 2, 3], color: 0xff6b6b },  // Bright red
            { pos: [-8, 1.5, 8], scale: [2, 3, 2], color: 0x4ecdc4 },  // Turquoise
            { pos: [5, 2, 15], scale: [4, 4, 4], color: 0xff9f43 },    // Orange
            { pos: [-15, 1, -5], scale: [2, 2, 2], color: 0xa8e6cf }   // Mint
        ];

        obstacles.forEach(obs => {
            const geometry = new THREE.BoxGeometry(obs.scale[0], obs.scale[1], obs.scale[2]);
            const material = new THREE.MeshPhongMaterial({ 
                color: obs.color,
                shininess: 30,
                specular: 0x444444
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(obs.pos[0], obs.pos[1], obs.pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Add to collidable objects
            this.collidableObjects.push(mesh);
            this.scene.add(mesh);
        });

        // Add invisible walls at the map boundaries
        const wallGeometry = new THREE.BoxGeometry(1, 10, 100);
        const wallMaterial = new THREE.MeshBasicMaterial({ visible: false });
        
        // Left and right walls
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-50, 5, 0);
        this.collidableObjects.push(leftWall);
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(50, 5, 0);
        this.collidableObjects.push(rightWall);
        this.scene.add(rightWall);
        
        // Front and back walls
        const frontBackWallGeometry = new THREE.BoxGeometry(100, 10, 1);
        const frontWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        frontWall.position.set(0, 5, -50);
        this.collidableObjects.push(frontWall);
        this.scene.add(frontWall);
        
        const backWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        backWall.position.set(0, 5, 50);
        this.collidableObjects.push(backWall);
        this.scene.add(backWall);

        this.addDecorations();
    }

    addDecorations() {
        // Simple trees with brighter colors
        for (let i = 0; i < 15; i++) {
            const treeGroup = new THREE.Group();
            
            // Tree trunk with collision
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcd853f,
                shininess: 10
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Collision cylinder for the whole tree
            const collisionGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 8);
            const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.y = 2.5;
            
            // Tree top
            const topGeometry = new THREE.ConeGeometry(1.5, 3, 8);
            const topMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x90EE90,
                shininess: 15
            });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 2.5;
            
            treeGroup.add(trunk);
            treeGroup.add(top);
            treeGroup.add(collisionMesh);
            
            // Random position
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            
            // Check if position is too close to other objects
            let validPosition = false;
            let attempts = 0;
            while (!validPosition && attempts < 10) {
                validPosition = true;
                for (const obj of this.collidableObjects) {
                    const distance = position.distanceTo(obj.position);
                    if (distance < 5) {  // Minimum distance between trees and other objects
                        validPosition = false;
                        position.set(
                            (Math.random() - 0.5) * 80,
                            1,
                            (Math.random() - 0.5) * 80
                        );
                        break;
                    }
                }
                attempts++;
            }
            
            treeGroup.position.copy(position);
            
            treeGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            
            this.collidableObjects.push(collisionMesh);
            this.scene.add(treeGroup);
        }
    }

    checkCollision(position) {
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
            this.raycaster.set(
                new THREE.Vector3(position.x, position.y + 1, position.z),
                direction
            );
            const intersects = this.raycaster.intersectObjects(this.collidableObjects);
            
            if (intersects.length > 0 && intersects[0].distance < this.collisionRadius) {
                return true;
            }
        }
        return false;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('click', () => this.shoot());

        // Lock pointer on click
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
            case 'Space': if(this.canJump) this.velocity.y = 10; this.canJump = false; break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
        }
    }

    onMouseMove(event) {
        if(document.pointerLockElement === this.renderer.domElement) {
            this.targetRotation.y -= event.movementX * this.mouseSensitivity;
            this.player.rotation.y = this.targetRotation.y;
        }
    }

    shoot() {
        if(this.ammo <= 0) return;
        this.ammo--;
        document.getElementById('ammo').textContent = `Ammo: ${this.ammo}`;

        const bulletGeometry = new THREE.SphereGeometry(0.1);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        // Shoot from player position
        bullet.position.copy(this.player.position);
        bullet.position.y += 2;
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.player.quaternion);
        bullet.velocity = direction.multiplyScalar(1);

        this.scene.add(bullet);
        
        setTimeout(() => {
            this.scene.remove(bullet);
        }, 2000);
    }

    updateMovement() {
        const delta = 0.016;
        
        // Apply gravity
        this.velocity.y -= 9.8 * delta;
        
        // Store current position for collision detection
        const currentPosition = this.player.position.clone();
        
        // Update Y position (vertical movement)
        this.player.position.y += this.velocity.y * delta;
        
        // Floor collision
        if(this.player.position.y < this.playerHeight) {
            this.velocity.y = 0;
            this.player.position.y = this.playerHeight;
            this.canJump = true;
        }

        // Movement relative to player rotation
        const direction = new THREE.Vector3();
        
        if(this.moveForward) direction.z -= 1;
        if(this.moveBackward) direction.z += 1;
        if(this.moveLeft) direction.x -= 1;
        if(this.moveRight) direction.x += 1;

        direction.normalize();
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.targetRotation.y);
        
        // Calculate new position
        const newPosition = this.player.position.clone();
        newPosition.x += direction.x * this.moveSpeed;
        newPosition.z += direction.z * this.moveSpeed;
        
        // Check for collisions at new position
        if (!this.checkCollision(newPosition)) {
            this.player.position.copy(newPosition);
        } else {
            // Try to slide along walls
            const xOnlyPosition = this.player.position.clone();
            xOnlyPosition.x += direction.x * this.moveSpeed;
            
            const zOnlyPosition = this.player.position.clone();
            zOnlyPosition.z += direction.z * this.moveSpeed;
            
            // Check X-axis movement
            if (!this.checkCollision(xOnlyPosition)) {
                this.player.position.copy(xOnlyPosition);
            }
            
            // Check Z-axis movement
            if (!this.checkCollision(zOnlyPosition)) {
                this.player.position.copy(zOnlyPosition);
            }
        }

        // Update camera position
        const idealOffset = this.cameraOffset.clone();
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.targetRotation.y);
        
        this.camera.position.copy(this.player.position).add(idealOffset);
        this.camera.lookAt(
            this.player.position.x,
            this.player.position.y + 2,
            this.player.position.z
        );
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateMovement();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new Game(); 