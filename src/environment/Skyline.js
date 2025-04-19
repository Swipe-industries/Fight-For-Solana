import * as THREE from 'three';

class Skyline {
    static create(game) {
        const skylineGroup = new THREE.Group();
        
        // Position the skyline closer to the fence line
        skylineGroup.position.set(0, -20, 0); // Lower the base to ground level
        
        // Create the Dubai skyline
        this.createDubaiSkyline(skylineGroup);
        
        // Create detailed boundary fences
        this.createBoundaryFences(game, skylineGroup);
        
        game.scene.add(skylineGroup);
    }
    
    static createDubaiSkyline(group) {
        // Bring buildings much closer
        const skylineDistance = 55; // Adjusted to be just behind fence
        
        // Distribute buildings around all sides of the fence
        const buildingCount = 30; // Increased from 24 to 30 for more buildings
        
        for (let i = 0; i < buildingCount; i++) {
            const building = this.createSkyscraper();
            
            // Position buildings in a full 360° circle around the fence
            const angle = (i / buildingCount) * Math.PI * 2; // Full circle
            const distance = skylineDistance + Math.random() * 5; // Less random variation
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            // Ensure buildings are outside fence
            if (Math.abs(x) < 52 && Math.abs(z) < 52) { // 52 is fence radius + buffer
                continue; // Skip buildings too close to fence
            }
            
            building.position.set(x, 0, z);
            building.lookAt(0, 0, 0);
            
            // Make buildings bigger (increased from 0.8 to 1.0-1.2)
            const baseScale = 1.0 + Math.random() * 0.2;
            building.scale.set(baseScale, baseScale, baseScale);
            
            // Vary building heights for more interesting skyline
            const heightScale = 0.8 + Math.random() * 0.8; // Increased minimum height
            building.scale.y *= heightScale;
            
            group.add(building);
        }
        
        // Add several landmark buildings at specific positions
        const landmarks = [
            { pos: [70, 0, 20], scale: 1.8, height: 2.2 },
            { pos: [-60, 0, 40], scale: 1.6, height: 1.9 },
            { pos: [30, 0, -65], scale: 1.7, height: 2.4 },
            { pos: [-40, 0, -60], scale: 1.5, height: 2.1 },
            { pos: [0, 0, -70], scale: 2.0, height: 2.5 }
        ];
        
        landmarks.forEach(landmark => {
            const building = this.createSkyscraper();
            building.position.set(...landmark.pos);
            building.lookAt(0, 0, 0);
            building.scale.set(
                landmark.scale, 
                landmark.scale * landmark.height, 
                landmark.scale
            );
            group.add(building);
        });
        
        // Optimized city glow
        const cityGlow = new THREE.PointLight(0xffaa44, 0.6, skylineDistance * 4);
        cityGlow.position.set(0, 80, -skylineDistance);
        group.add(cityGlow);

        // Simplified ambient night lighting
        const nightAmbient = new THREE.HemisphereLight(0x0000ff, 0x000000, 0.15);
        group.add(nightAmbient);
    }

    static createSkyscraper() {
        const building = new THREE.Group();
        
        // Building dimensions
        const height = 20 + Math.random() * 40;
        const width = 4 + Math.random() * 8;
        const depth = 4 + Math.random() * 8;
        
        // Simplified building types with basic materials
        const buildingTypes = [
            {   // Modern Glass Office Building
                material: new THREE.MeshPhongMaterial({
                    color: 0x88ccff,
                    shininess: 50,
                    transparent: true,
                    opacity: 0.9,
                }),
                windowPattern: 'grid'
            },
            {   // Residential Building
                material: new THREE.MeshPhongMaterial({
                    color: 0xe0c080,
                    shininess: 30
                }),
                windowPattern: 'residential'
            }
        ];
    
        const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        
        // Main structure
        const mainStructure = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            buildingType.material
        );
        mainStructure.position.y = height/2;
        building.add(mainStructure);
    
        // Simplified window material
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
        });
    
        // Add windows based on pattern
        if (buildingType.windowPattern === 'grid') {
            // Office building - fewer, larger windows for better performance
            const windowSize = 0.6;
            const spacing = 1.2;
            
            for (let y = 2; y < height - 2; y += spacing) {
                for (let x = -width/2 + 1; x < width/2 - 1; x += spacing) {
                    // Only add windows to front and back
                    const window = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowSize, windowSize),
                        windowMaterial
                    );
                    window.position.set(x, y, depth/2 + 0.01);
                    building.add(window);
    
                    // Back windows
                    const backWindow = window.clone();
                    backWindow.position.z = -depth/2 - 0.01;
                    backWindow.rotation.y = Math.PI;
                    building.add(backWindow);
                }
            }
        } else {
            // Residential building - larger, spaced out windows
            const windowWidth = 1.0;
            const windowHeight = 1.4;
            const spacing = 2.5;
            
            for (let y = 2; y < height - 2; y += spacing) {
                for (let x = -width/2 + 1.5; x < width/2 - 1; x += spacing) {
                    const window = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowWidth, windowHeight),
                        Math.random() > 0.3 ? windowMaterial : windowMaterial.clone().color.setHex(0x666666)
                    );
                    window.position.set(x, y, depth/2 + 0.01);
                    building.add(window);
    
                    const backWindow = window.clone();
                    backWindow.position.z = -depth/2 - 0.01;
                    backWindow.rotation.y = Math.PI;
                    building.add(backWindow);
                }
            }
        }
    
        // Simplified spire for tall buildings
        if (height > 40 && Math.random() > 0.5) {
            const spire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.3, height * 0.2, 8),
                new THREE.MeshPhongMaterial({ color: 0x888888 })
            );
            spire.position.y = height + (height * 0.2)/2;
            building.add(spire);
        }
        
        return building;
    }
    
    static createBoundaryFences(game, group) {
        // Create detailed boundary fences around the playable area
        const fenceLength = 100; // Match ground size
        const fenceHeight = 3;
        const postSpacing = 4;
        
        // Fence materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.5,
            metalness: 0.8
        });
        
        const chainlinkMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.8,
            metalness: 0.5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create fence on all four sides
        for (let side = 0; side < 4; side++) {
            const fence = new THREE.Group();
            
            // Position and rotate fence based on side
            fence.position.set(
                side % 2 === 0 ? 0 : (side === 1 ? fenceLength/2 : -fenceLength/2),
                0,
                side % 2 === 1 ? 0 : (side === 0 ? fenceLength/2 : -fenceLength/2)
            );
            fence.rotation.y = side % 2 === 0 ? 0 : Math.PI/2;
            
            // Create fence posts
            const postCount = Math.floor(fenceLength / postSpacing) + 1;
            
            for (let i = 0; i < postCount; i++) {
                const post = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, fenceHeight, 0.2),
                    metalMaterial
                );
                
                post.position.set(
                    (i * postSpacing) - fenceLength/2,
                    fenceHeight/2,
                    0
                );
                
                fence.add(post);
                
                // Add collision detection for fence posts
                game.collidableObjects.push(post);
            }
            
            // Create top rail
            const topRail = new THREE.Mesh(
                new THREE.BoxGeometry(fenceLength, 0.1, 0.1),
                metalMaterial
            );
            topRail.position.set(0, fenceHeight, 0);
            fence.add(topRail);
            
            // Create middle rail
            const middleRail = new THREE.Mesh(
                new THREE.BoxGeometry(fenceLength, 0.1, 0.1),
                metalMaterial
            );
            middleRail.position.set(0, fenceHeight/2, 0);
            fence.add(middleRail);
            
            // Create bottom rail
            const bottomRail = new THREE.Mesh(
                new THREE.BoxGeometry(fenceLength, 0.1, 0.1),
                metalMaterial
            );
            bottomRail.position.set(0, 0.1, 0);
            fence.add(bottomRail);
            
            // Create chainlink mesh
            const chainlink = new THREE.Mesh(
                new THREE.PlaneGeometry(fenceLength, fenceHeight),
                chainlinkMaterial
            );
            chainlink.position.set(0, fenceHeight/2, 0);
            fence.add(chainlink);
            
            // Add collision detection for the entire fence
            const fenceCollider = new THREE.Mesh(
                new THREE.BoxGeometry(fenceLength, fenceHeight, 0.2),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0
                })
            );
            fenceCollider.position.set(0, fenceHeight/2, 0);
            fence.add(fenceCollider);
            
            game.collidableObjects.push(fenceCollider);
            
            group.add(fence);
        }
    }
}

export { Skyline };