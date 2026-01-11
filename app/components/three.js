"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vUv = uv;
    
    // 1. High frequency noise keeps the 'bumps' small and local
    // Using 4.0 or 5.0 keeps the ripples tight to the surface
    float noise = sin(position.x * 4.0 + uTime) * cos(position.y * 4.0 + uTime) * sin(position.z * 4.0 + uTime);

    // 2. The Limiter: We cap the displacement so it stays close to the shell.
    // uIntensity * 0.3 is much 'safer' than 2.5
    float displacement = noise * (uIntensity * 0.4);
    
    // 3. Move vertices along the normal, but keep the core solid
    vec3 newPosition = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black wireframe
  }
`;

function MorphingSphere({ analyserRef, dataArrayRef }) {
  const meshRef = useRef(null);
  const smoothBass = useRef(0);
  const smoothMid = useRef(0);

  // Defining uniforms as a stable object
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uDetail: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current && analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Grab bass and map it to a tiny range
      const rawBass = dataArrayRef.current[0] / 255.0;

      // Snappy return (0.3) keeps it from looking 'saggy'
      smoothBass.current += (rawBass - smoothBass.current) * 0.3;

      meshRef.current.material.uniforms.uIntensity.value = smoothBass.current;
      meshRef.current.material.uniforms.uTime.value =
        state.clock.elapsedTime * 2.0;

      // This is what keeps it looking like a circle!
      // The whole object pulses, but the shape stays 'locked'
      const pulse = 1.0 + smoothBass.current * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 16, 32]} />
      <shaderMaterial
        key={JSON.stringify(uniforms)} // Helps React track the object
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe={true}
      />
    </mesh>
  );
}

export default function ThreeJS({ analyserRef, dataArrayRef }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#fff" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 75 }}>
        <MorphingSphere analyserRef={analyserRef} dataArrayRef={dataArrayRef} />
      </Canvas>
    </div>
  );
}
