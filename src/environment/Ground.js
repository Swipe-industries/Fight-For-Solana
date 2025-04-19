import { Boundary } from './Boundary.js';

class Ground {
    static create(game) {
        // Create extended ground plane (larger than playable area)
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        
        // Create realistic ground texture
        const textureLoader = new THREE.TextureLoader();
        const groundTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/grasslight-big.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(50, 50);
        groundTexture.encoding = THREE.sRGBEncoding;
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        game.scene.add(ground);
        
        // Create trees in different layers
        Ground.createTreesInArea(game, 0, 40, 15);     // Inner playable area
        Ground.createTreesInArea(game, 50, 70, 30);    // Just outside the fence
        Ground.createTreesInArea(game, 70, 90, 40);    // Middle background
        Ground.createTreesInArea(game, 90, 110, 50);   // Far background
        
        // Create boundary walls
        Boundary.create(game);
    }

    static createTreesInArea(game, minRadius, maxRadius, count) {
        for (let i = 0; i < count; i++) {
            const treeGroup = new THREE.Group();
            
            // Tree trunk
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.5, 3, 12),
                new THREE.MeshPhongMaterial({ 
                    color: 0x8B4513,
                    shininess: 3,
                    flatShading: true
                })
            );
            
            // Only add collision for trees inside playable area
            if (maxRadius <= 40) {
                const collisionMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(1.5, 1.5, 6, 8),
                    new THREE.MeshBasicMaterial({ visible: false })
                );
                collisionMesh.position.y = 3;
                treeGroup.add(collisionMesh);
                game.collidableObjects.push(collisionMesh);
            }
            
            // Create foliage layers
            const createFoliage = (y, scale) => {
                const foliage = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(1.5 * scale, 1),
                    new THREE.MeshPhongMaterial({ 
                        color: new THREE.Color(0x2D4F2D).lerp(
                            new THREE.Color(0x4F7942), 
                            0.3 + Math.random() * 0.4
                        ),
                        shininess: 3,
                        flatShading: true
                    })
                );
                foliage.position.set(
                    (Math.random() - 0.5) * 0.7,
                    y - 0.5,
                    (Math.random() - 0.5) * 0.7
                );
                foliage.scale.set(
                    0.9 + Math.random() * 0.2,
                    1,
                    0.9 + Math.random() * 0.2
                );
                return foliage;
            };
            
            // Add foliage layers
            treeGroup.add(createFoliage(3.5, 1.0));
            treeGroup.add(createFoliage(4.5, 0.85));
            treeGroup.add(createFoliage(5.3, 0.7));
            treeGroup.add(createFoliage(6.0, 0.5));
            
            treeGroup.add(trunk);
            
            // Position the tree
            const angle = Math.random() * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            treeGroup.position.set(
                Math.cos(angle) * radius,
                1.5,
                Math.sin(angle) * radius
            );
            
            // Random rotation and tilt
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            treeGroup.rotation.x = (Math.random() - 0.5) * 0.05;
            treeGroup.rotation.z = (Math.random() - 0.5) * 0.05;
            
            // Add shadows
            treeGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            
            game.scene.add(treeGroup);
        }
    }
}

export { Ground };