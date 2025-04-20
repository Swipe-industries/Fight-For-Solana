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
        
        // Add access points - stairs to the roof
        this.createStairs(building, materials, 15, 8, 0, 15, 7, game);
        
        building.position.set(0, 0, 0);
        game.scene.add(building);
        
        // Remove tunnel creation from here
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
    
    static createStairs(building, materials, x, y, z, height, steps, game) {
        const stairWidth = 4;
        const stepDepth = 1;
        const stepHeight = height / steps;
        
        for (let i = 0; i < steps; i++) {
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth),
                materials.platform
            );
            
            step.position.set(
                x,
                y + (i + 0.5) * stepHeight,
                z - i * stepDepth
            );
            
            step.userData = { isCollider: true };
            building.add(step);
            game.collidableObjects.push(step);
        }
        
        // Add railings
        const railHeight = 1.2;
        const railThickness = 0.2;
        
        // Left railing
        const leftRail = new THREE.Mesh(
            new THREE.BoxGeometry(railThickness, railHeight + height, railThickness),
            materials.pillar
        );
        leftRail.position.set(
            x - stairWidth/2,
            y + height/2 + railHeight/2,
            z - steps * stepDepth/2
        );
        leftRail.userData = { isCollider: true };
        building.add(leftRail);
        game.collidableObjects.push(leftRail);
        
        // Right railing
        const rightRail = new THREE.Mesh(
            new THREE.BoxGeometry(railThickness, railHeight + height, railThickness),
            materials.pillar
        );
        rightRail.position.set(
            x + stairWidth/2,
            y + height/2 + railHeight/2,
            z - steps * stepDepth/2
        );
        rightRail.userData = { isCollider: true };
        building.add(rightRail);
        game.collidableObjects.push(rightRail);
        
        // Diagonal rails
        const diagLength = Math.sqrt(height*height + (steps*stepDepth)*(steps*stepDepth));
        
        // Left diagonal
        const leftDiag = new THREE.Mesh(
            new THREE.BoxGeometry(railThickness, railThickness, diagLength),
            materials.pillar
        );
        leftDiag.position.set(
            x - stairWidth/2,
            y + height/2 + railHeight,
            z - steps * stepDepth/2
        );
        leftDiag.rotation.x = -Math.atan2(height, steps*stepDepth);
        leftDiag.userData = { isCollider: true };
        building.add(leftDiag);
        game.collidableObjects.push(leftDiag);
        
        // Right diagonal
        const rightDiag = new THREE.Mesh(
            new THREE.BoxGeometry(railThickness, railThickness, diagLength),
            materials.pillar
        );
        rightDiag.position.set(
            x + stairWidth/2,
            y + height/2 + railHeight,
            z - steps * stepDepth/2
        );
        rightDiag.rotation.x = -Math.atan2(height, steps*stepDepth);
        rightDiag.userData = { isCollider: true };
        building.add(rightDiag);
        game.collidableObjects.push(rightDiag);
    }
}

export { Building };