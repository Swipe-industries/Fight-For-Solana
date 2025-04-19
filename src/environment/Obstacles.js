import { Decorations } from './Decorations.js';

class Obstacles {
    static add(game) {
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
            game.collidableObjects.push(mesh);
            game.scene.add(mesh);
        });

        // Add invisible walls at the map boundaries
        const wallGeometry = new THREE.BoxGeometry(1, 10, 100);
        const wallMaterial = new THREE.MeshBasicMaterial({ visible: false });
        
        // Left and right walls
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-50, 5, 0);
        game.collidableObjects.push(leftWall);
        game.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(50, 5, 0);
        game.collidableObjects.push(rightWall);
        game.scene.add(rightWall);
        
        // Front and back walls
        const frontBackWallGeometry = new THREE.BoxGeometry(100, 10, 1);
        const frontWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        frontWall.position.set(0, 5, -50);
        game.collidableObjects.push(frontWall);
        game.scene.add(frontWall);
        
        const backWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        backWall.position.set(0, 5, 50);
        game.collidableObjects.push(backWall);
        game.scene.add(backWall);

        Decorations.add(game);
    }
}

export { Obstacles };