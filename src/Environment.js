// Import THREE
import * as THREE from 'three';

// Import all environment components
import { Lighting } from './environment/Lighting.js';
import { Ground } from './environment/Ground.js';
import { Building } from './environment/Building.js';
import { Boundary } from './environment/Boundary.js';
import { Obstacles } from './environment/Obstacles.js';
import { Decorations } from './environment/Decorations.js';
import { Characters } from './environment/Characters.js';
import { Vehicles } from './environment/Vehicles.js';
import { Props } from './environment/Props.js';

class Environment {
    static setupLights(game) {
        Lighting.setup(game);
    }

    static createMap(game) {
        // Create ground
        Environment.createGround(game);
        
        // Create building
        Environment.createBuilding(game);
        
        // Add obstacles
        Environment.addObstacles(game);
        
        // Add NPC player
        Environment.addNPC(game);

        // Add military truck
        Environment.createMilitaryTruck(game);

        // Add a container near the boundary (moved further away from player start)
        Environment.createContainer(game, 45, 0, 45, Math.PI / 4); // Positioned in far corner, rotated 45 degrees
    }

    static createGround(game) {
        Ground.create(game);
    }

    static createBuilding(game) {
        Building.create(game);
    }

    static createBoundary(game) {
        Boundary.create(game);
    }

    static addObstacles(game) {
        Obstacles.add(game);
    }

    static addDecorations(game) {
        Decorations.add(game);
    }

    static addNPC(game) {
        Characters.addNPC(game);
    }

    static createMilitaryTruck(game) {
        Vehicles.createMilitaryTruck(game);
    }

    static createContainer(game, x, y, z, rotation = 0) {
        return Props.createContainer(game, x, y, z, rotation);
    }
}

// Add this at the end of your Environment.js file
export { Environment };