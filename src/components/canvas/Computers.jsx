import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';
import CanvasLoader from '../Loader';

const Computers = ({ isMobile }) => {
  const computer = useGLTF('./desktop_pc/scene.gltf'); // Use Sketchfab for 3D models
  return (
    <mesh>
      <hemisphereLight intensity={50} groundColor="black" />
      <pointLight intensity={40} />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.7 : 5}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  )
}

const ComputersCanvas = () => {
  const [isMobile, setMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 500px)');
    setMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => {
      setMobile(event.matches);
      mediaQuery.addEventListener('change', handleMediaQueryChange);

      return () => {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);

      }
    }
  })
  return (
    <Canvas frameloop="demand" shadows camera={{ position: [20, 10, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}>
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate={true}
          autoRotateSpeed={6}
        />
        <Computers isMobile={isMobile} />
      </Suspense>
      <Preload all />
    </Canvas>
  )
}

export default ComputersCanvas