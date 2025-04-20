import * as THREE from 'three';
import { PalmTree } from './decorations/PalmTree.js';
import { Fountain } from './decorations/Fountain.js';

class Decorations {
    static add(game) {
        // Add trees in different layers (previously in Ground.js)
        this.createTreesInArea(game, 0, 40, 15);     // Inner playable area
        this.createTreesInArea(game, 50, 70, 30);    // Just outside the fence
        this.createTreesInArea(game, 70, 90, 40);    // Middle background
        this.createTreesInArea(game, 90, 110, 50);   // Far background
        
        // Add fountain after trees are placed
        Fountain.addFountain(game);
    }

    // Method to create trees in specific areas
    static createTreesInArea(game, minRadius, maxRadius, count) {
        for (let i = 0; i < count; i++) {
            // Create a simple coconut palm tree
            const { treeGroup, collisionMesh } = PalmTree.createSimplePalmTree(game);
            
            // Position trees in a ring pattern
            const angle = Math.random() * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            treeGroup.position.set(x, 0, z);
            
            // Add random rotation for variety
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            
            // Scale trees based on distance (further trees are smaller for performance)
            const distanceScale = 0.8 + (radius / 100);
            treeGroup.scale.set(distanceScale, distanceScale, distanceScale);
            
            // Only add collision for trees in the playable area
            if (radius < 50) {
                game.collidableObjects.push(collisionMesh);
            }
            
            game.scene.add(treeGroup);
        }
    }
}

export { Decorations };