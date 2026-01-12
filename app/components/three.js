"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vUv = uv;
    float noise = sin(position.x * 5.0 + uTime) * cos(position.y * 5.0 + uTime) * sin(position.z * 5.0 + uTime);
    float powerBass = pow(uIntensity, 3.0); 
    float displacement = noise * (powerBass * 0.6);
    
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

function RiggedCamera({ bassRef }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const b = bassRef.current;
    camera.position.x = Math.sin(t * 0.5) * 2.5;
    camera.position.y = Math.cos(t * 0.3) * 1.5;
    camera.fov = 75 + b * 15;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function MorphSphere({ analyserRef, dataArrayRef, bassRef, sphereColor }) {
  const meshRef = useRef(null);
  const smoothBass = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(sphereColor) },
    }),
    []
  );

  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uColor.value.set(sphereColor);
    }
  }, [sphereColor]);

  useFrame((state) => {
    if (meshRef.current && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const rawBass = dataArrayRef.current[2] / 255.0;
      smoothBass.current += (rawBass - smoothBass.current) * 0.15;
      bassRef.current = smoothBass.current;

      meshRef.current.material.uniforms.uTime.value =
        state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uIntensity.value = smoothBass.current;

      const scale = 1.0 + smoothBass.current * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 100, 100]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={true}
      />
    </mesh>
  );
}

export default function ThreeJS({ analyserRef, dataArrayRef, sphereColor }) {
  const bassRef = useRef(0);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#FFFFFF" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 75 }}>
        <RiggedCamera bassRef={bassRef} />
        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4}
        />

        <MorphSphere
          analyserRef={analyserRef}
          dataArrayRef={dataArrayRef}
          bassRef={bassRef}
          sphereColor={sphereColor}
        />
      </Canvas>
    </div>
  );
}
