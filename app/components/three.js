"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function RotatingSphere() {
  const meshRef = useRef(null);

  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry
        args={[
          2, 64, 32, 3.65681384877852, 6.283185307179586, 4.35424741787545,
          4.8946013542929,
        ]}
      />
      <meshBasicMaterial color="0xffff00" wireframe={true} />
    </mesh>
  );
}

export default function ThreeJS() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <RotatingSphere />
      </Canvas>
    </div>
  );
}
