"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ThreeScene({ audioData }) {
  const meshRef = useRef(null);

  useFrame(() => {
    if (meshRef.current && audioData) {
      // 1. Update the math
      audioData.update();

      // 2. React to Bass (Scaling)
      // Normalizing: (audioData.bass / 255) gives 0 to 1
      const scale = 1 + (audioData.bass / 255) * 1.5;
      meshRef.current.scale.set(scale, scale, 1);

      // 3. React to Average (Color or Rotation)
      meshRef.current.rotation.z += 0.01 + (audioData.avg / 255) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[1, 64]} />
      <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
    </mesh>
  );
}
