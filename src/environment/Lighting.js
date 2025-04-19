class Lighting {
    static setup(game) {
        // Evening ambient light - warmer and dimmer
        const ambientLight = new THREE.AmbientLight(0xffd6aa, 0.3); // Warmer color, reduced intensity
        game.scene.add(ambientLight);

        // Evening sunlight - orange-red tint, lower angle
        const sunLight = new THREE.DirectionalLight(0xff7e30, 0.6); // Orange-red sunset color
        sunLight.position.set(50, 30, 50); // Lower sun position
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
        
        game.scene.add(sunLight);

        // Add subtle hemisphere light for more natural lighting
        const hemiLight = new THREE.HemisphereLight(0xff9966, 0x334455, 0.5); // Sunset sky to darker ground
        game.scene.add(hemiLight);
    }
}

export { Lighting };