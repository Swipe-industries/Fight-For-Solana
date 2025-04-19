import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import game component dynamically to avoid SSR issues with Three.js
const GameComponent = dynamic(() => import('../components/GameComponent'), {
    ssr: false
});

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {isClient && <GameComponent />}
        </div>
    );
}