import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Game } from '../src/Game.js';
import { Player } from '../src/Player.js';

export default function GameComponent() {
    const containerRef = useRef();
    
    useEffect(() => {
        if (!containerRef.current) return;
        
        // Create HUD elements
        const hudContainer = document.createElement('div');
        hudContainer.id = 'hud';
        hudContainer.style.position = 'absolute';
        hudContainer.style.top = '20px';
        hudContainer.style.left = '20px';
        hudContainer.style.color = 'white';
        hudContainer.style.fontFamily = 'Arial, sans-serif';
        hudContainer.style.fontSize = '18px';
        hudContainer.style.zIndex = '10';
        
        const healthDiv = document.createElement('div');
        healthDiv.id = 'health';
        healthDiv.textContent = 'Health: 100';
        
        const ammoDiv = document.createElement('div');
        ammoDiv.id = 'ammo';
        ammoDiv.textContent = 'Ammo: 30';
        
        hudContainer.appendChild(healthDiv);
        hudContainer.appendChild(ammoDiv);
        document.body.appendChild(hudContainer);
        
        // Create instructions
        const instructions = document.createElement('div');
        instructions.id = 'instructions';
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.right = '20px';
        instructions.style.color = 'white';
        instructions.style.fontFamily = 'Arial, sans-serif';
        instructions.style.fontSize = '14px';
        instructions.style.textAlign = 'right';
        instructions.style.zIndex = '10';
        
        instructions.innerHTML = `
            <p>WASD - Move</p>
            <p>Space - Jump</p>
            <p>Mouse - Right Click - Aim</p>
            <p>Mouse - Left Click - Shoot</p>
            <p>Shift - Slide</p>
            <p>K - Respawn</p>
        `;
        
        document.body.appendChild(instructions);
        
        // Initialize game
        const game = new Game(containerRef.current);
        
        // Clean up
        return () => {
            game.dispose();
            if (hudContainer) hudContainer.remove();
            if (instructions) instructions.remove();
        };
    }, []);
    
    return <div id="game-container" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
}