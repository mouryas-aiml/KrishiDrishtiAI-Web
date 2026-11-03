import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

function CropRows(): JSX.Element {
  const rows = Array.from({ length: 7 }, (_, row) => row);
  const plants = Array.from({ length: 10 }, (_, plant) => plant);

  return (
    <group rotation-x={-0.18}>
      {rows.map((row) =>
        plants.map((plant) => (
          <mesh key={`${row}-${plant}`} position={[(plant - 4.5) * 0.42, 0.12, (row - 3) * 0.48]}>
            <coneGeometry args={[0.09, 0.34 + ((row + plant) % 3) * 0.06, 5]} />
            <meshStandardMaterial color={(row + plant) % 7 === 0 ? "#d9ac51" : "#62b879"} roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Field(): JSX.Element {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.025;
  });

  return (
    <group ref={group}>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[5.2, 4.1]} />
        <meshStandardMaterial color="#315d3b" roughness={1} />
      </mesh>
      <CropRows />
      <mesh position={[-2.15, 0.08, -1.45]} castShadow>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color="#4c8f55" />
      </mesh>
    </group>
  );
}

export default function FarmScene(): JSX.Element {
  return (
    <div className="farm-scene" aria-label="Interactive demonstration crop field">
      <Canvas camera={{ position: [4.5, 3.8, 5.2], fov: 36 }} dpr={[1, 1.5]} shadows>
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 5, 2]} intensity={2.2} castShadow />
        <Field />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={8} autoRotate={false} />
      </Canvas>
      <span className="farm-scene-label">Interactive demonstration field</span>
    </div>
  );
}
