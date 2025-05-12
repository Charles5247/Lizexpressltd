import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const LogoModel: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg');
  
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  const springs = useSpring({
    from: { rotation: [0, 0, 0], scale: [0, 0, 0] },
    to: { rotation: [0, Math.PI * 2, 0], scale: [1, 1, 1] },
    loop: true,
    config: { duration: 2000 }
  });

  return (
    <animated.mesh
      ref={mesh}
      rotation={springs.rotation}
      scale={springs.scale}
    >
      <boxGeometry args={[2, 2, 0.2]} />
      <meshStandardMaterial 
        map={texture}
        transparent={true}
        opacity={0.9}
      />
    </animated.mesh>
  );
};

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#4A0E67] z-50 flex items-center justify-center">
      <div className="w-64 h-64">
        <Canvas
          camera={{ position: [0, 0, 5] }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <LogoModel />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={4}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Preloader;