import * as THREE from 'three';

class Building {
    static create(game) {
        const building = new THREE.Group();
        
        // Create materials
        const materials = {
            platform: new THREE.MeshPhongMaterial({
                color: 0x444444,
                roughness: 0.7
            }),
            pillar: new THREE.MeshPhongMaterial({
                color: 0x222222,
                metalness: 0.8
            }),
            glass: new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.4,
                shininess: 90
            }),
            accent: new THREE.MeshPhongMaterial({
                color: 0xff3333
            })
        };
        
        // Create floating platform structure
        this.createPlatformStructure(building, materials, game);
        
        // Removed stairs call
        
        building.position.set(0, 0, 0);
        game.scene.add(building);
    }
    
    static createPlatformStructure(building, materials, game) {
        // Main platform
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(40, 2, 30),
            materials.platform
        );
        platform.position.set(0, 8, 0);
        platform.userData = { isCollider: true };
        building.add(platform);
        game.collidableObjects.push(platform);
        
        // Support pillars
        const pillarPositions = [
            [-15, 0, 10],
            [15, 0, 10],
            [-15, 0, -10],
            [15, 0, -10]
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, 8, 8),
                materials.pillar
            );
            pillar.position.set(pos[0], 4, pos[2]);
            pillar.userData = { isCollider: true };
            building.add(pillar);
            game.collidableObjects.push(pillar);
            
            // Add base for each pillar
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(3, 3, 1, 8),
                materials.platform
            );
            base.position.set(pos[0], 0.5, pos[2]);
            base.userData = { isCollider: true };
            building.add(base);
            game.collidableObjects.push(base);
        });
        
        // Upper structure - simple glass enclosure
        const walls = [
            // Front
            { size: [38, 6, 0.5], pos: [0, 12, 14.5] },
            // Back
            { size: [38, 6, 0.5], pos: [0, 12, -14.5] },
            // Left
            { size: [0.5, 6, 29], pos: [-19.5, 12, 0] },
            // Right
            { size: [0.5, 6, 29], pos: [19.5, 12, 0] }
        ];
        
        walls.forEach(wall => {
            const glassWall = new THREE.Mesh(
                new THREE.BoxGeometry(...wall.size),
                materials.glass
            );
            glassWall.position.set(...wall.pos);
            building.add(glassWall);
        });
        
        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(40, 0.5, 30),
            materials.platform
        );
        roof.position.set(0, 15.25, 0);
        roof.userData = { isCollider: true };
        building.add(roof);
        game.collidableObjects.push(roof);
        
        // Add simple railings around the roof
        const railings = [
            // Front
            { size: [40, 1, 0.2], pos: [0, 16, 15] },
            // Back
            { size: [40, 1, 0.2], pos: [0, 16, -15] },
            // Left
            { size: [0.2, 1, 30], pos: [-20, 16, 0] },
            // Right
            { size: [0.2, 1, 30], pos: [20, 16, 0] }
        ];
        
        railings.forEach(railing => {
            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(...railing.size),
                materials.pillar
            );
            rail.position.set(...railing.pos);
            rail.userData = { isCollider: true };
            building.add(rail);
            game.collidableObjects.push(rail);
        });
    }
    
    // Removed createStairs method
}

export { Building };