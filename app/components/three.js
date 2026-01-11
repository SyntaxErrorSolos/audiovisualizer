"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vUv = uv;
    
    // Create a "morph" effect using sine waves based on position and time
    // You can swap this for Perlin Noise for a more organic look
    float displacement = sin(position.x * 3.0 + uTime) * 0.2 
                       + cos(position.y * 2.0 + uTime) * 0.2 
                       + sin(position.z * 4.0 + uTime) * 0.2;
    
    vec3 progressPos = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(progressPos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // Yellow
  }
`;

function MorphingSphere() {
  const meshRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={true}
      />
    </mesh>
  );
}

export default function ThreeJS({ analyserRef, dataArrayRef }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <MorphingSphere analyserRef={analyserRef} dataArrayRef={dataArrayRef} />
      </Canvas>
    </div>
  );
}
