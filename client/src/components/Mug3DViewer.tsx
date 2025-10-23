import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

interface Mug3DViewerProps {
  designUrl?: string;
  color?: string;
}

function MugModel({ designUrl, color }: Mug3DViewerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture if design URL is provided
  useEffect(() => {
    if (designUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(designUrl, (tex: THREE.Texture) => {
        setTexture(tex);
      });
    }
  }, [designUrl]);

  return (
    <group ref={meshRef}>
      {/* Mug Body - Cilindro */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32, 1]} />
        <meshStandardMaterial
          color={color || "#ffffff"}
          metalness={0.3}
          roughness={0.4}
          map={texture}
        />
      </mesh>

      {/* Mug Bottom */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.1, 32]} />
        <meshStandardMaterial
          color={color || "#ffffff"}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Mug Handle - Torus */}
      <mesh position={[1.2, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.4, 0.15, 16, 100]} />
        <meshStandardMaterial
          color={color || "#ffffff"}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Rim */}
      <mesh position={[0, 1, 0]}>
        <torusGeometry args={[1, 0.08, 32, 100]} />
        <meshStandardMaterial
          color={color || "#ffffff"}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function Mug3DViewer({
  designUrl,
  color = "#ffffff",
}: Mug3DViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={4}
          enableZoom={true}
          enablePan={true}
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.5} />

        {/* Mug Model */}
        <MugModel designUrl={designUrl} color={color} />

        {/* Background */}
        <color attach="background" args={["#f1f5f9"]} />
      </Canvas>
    </div>
  );
}

