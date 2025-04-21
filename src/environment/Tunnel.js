import * as THREE from 'three';

class Tunnel {
    static create(game) {
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
            })
        };
        
        // Create a tunnel between wall and center building
        // Positioned at x: -25 (towards wall but with gap), z: -30 (between wall and center)
        this.createTunnel(materials, game, -25, 0, -30);
    }
    
    static createTunnel(materials, game, x, y, z) {
        // Create a tunnel as a standalone structure
        const tunnelGroup = new THREE.Group();
        const tunnelWidth = 12; // Wider tunnel
        const tunnelHeight = 8;
        const tunnelLength = 30; // Shortened length to avoid wall contact
        
        // Tunnel floor - visual only, no collision
        const tunnelFloor = new THREE.Mesh(
            new THREE.BoxGeometry(tunnelWidth + 2, 0.5, tunnelLength),
            materials.platform
        );
        tunnelFloor.position.set(0, 0.25, 0);
        // No collision detection for the floor
        tunnelGroup.add(tunnelFloor);
        
        // Tunnel ceiling
        const tunnelCeiling = new THREE.Mesh(
            new THREE.BoxGeometry(tunnelWidth, 0.5, tunnelLength),
            materials.platform
        );
        tunnelCeiling.position.set(0, tunnelHeight, 0);
        tunnelCeiling.userData = { isCollider: true };
        tunnelGroup.add(tunnelCeiling);
        game.collidableObjects.push(tunnelCeiling);
        
        // Tunnel left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, tunnelHeight, tunnelLength),
            materials.platform
        );
        leftWall.position.set(-tunnelWidth/2, tunnelHeight/2, 0);
        leftWall.userData = { isCollider: true };
        tunnelGroup.add(leftWall);
        game.collidableObjects.push(leftWall);
        
        // Tunnel right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, tunnelHeight, tunnelLength),
            materials.platform
        );
        rightWall.position.set(tunnelWidth/2, tunnelHeight/2, 0);
        rightWall.userData = { isCollider: true };
        tunnelGroup.add(rightWall);
        game.collidableObjects.push(rightWall);
        
        // Add some lighting inside the tunnel
        const tunnelLights = [
            { pos: [0, tunnelHeight - 0.6, -tunnelLength/4] },
            { pos: [0, tunnelHeight - 0.6, 0] },
            { pos: [0, tunnelHeight - 0.6, tunnelLength/4] }
        ];
        
        tunnelLights.forEach(light => {
            const lightFixture = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.2, 2),
                new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5
                })
            );
            lightFixture.position.set(...light.pos);
            tunnelGroup.add(lightFixture);
        });
        
        // Add guide markers on the floor for better navigation (visual only)
        const markerCount = 8;
        const markerSpacing = tunnelLength / markerCount;
        
        for (let i = 0; i < markerCount; i++) {
            const marker = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.1, 0.5),
                new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0x888888
                })
            );
            marker.position.set(0, 0.51, -tunnelLength/2 + i * markerSpacing);
            tunnelGroup.add(marker);
        }
        
        // Add entrance signs
        const signMaterial = new THREE.MeshPhongMaterial({
            color: 0xff3333,
            emissive: 0x331111,
            emissiveIntensity: 0.5
        });
        
        const entranceSign1 = new THREE.Mesh(
            new THREE.BoxGeometry(tunnelWidth + 4, 1, 0.5),
            signMaterial
        );
        entranceSign1.position.set(0, tunnelHeight + 1, -tunnelLength/2 - 0.5);
        tunnelGroup.add(entranceSign1);
        
        const entranceSign2 = new THREE.Mesh(
            new THREE.BoxGeometry(tunnelWidth + 4, 1, 0.5),
            signMaterial
        );
        entranceSign2.position.set(0, tunnelHeight + 1, tunnelLength/2 + 0.5);
        tunnelGroup.add(entranceSign2);
        
        // Position the entire tunnel group
        tunnelGroup.position.set(x, y, z);
        game.scene.add(tunnelGroup);
    }
}

export { Tunnel };