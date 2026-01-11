"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const vertexShader = `
  varying vec2 vUv;
  varying float vDisplacement; // Pass displacement to fragment shader for color
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vUv = uv;
    
    // Smooth high-frequency noise
    float noise = sin(position.x * 4.0 + uTime) * cos(position.y * 4.0 + uTime) * sin(position.z * 4.0 + uTime);
    float displacement = noise * (uIntensity * 0.4);
    vDisplacement = displacement; // Save for color mapping
    
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    // 1. Create a ripple pattern based on the UV coordinates and time
    // This creates moving concentric rings
    float ripple = sin(vUv.y * 20.0 - uTime * 5.0);
    
    // 2. Define two colors (e.g., Yellow and Pink/Red)
    vec3 colorA = vec3(1.0, 1.0, 0.0); // Yellow
    vec3 colorB = vec3(1.0, 0.2, 0.5); // Pinkish Red
    
    // 3. Mix the colors based on the ripple and the audio intensity
    // As uIntensity goes up, the ripples become more visible
    float mixStrength = smoothstep(-1.0, 1.0, ripple) * uIntensity;
    vec3 finalColor = mix(colorA, colorB, mixStrength);

    // 4. Add highlight to the "peaks" of the morphing bumps
    finalColor += vDisplacement * 2.0;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function MorphingSphere({ analyserRef, dataArrayRef }) {
  const meshRef = useRef(null);
  const smoothBass = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const rawBass = dataArrayRef.current[0] / 255.0;
      smoothBass.current += (rawBass - smoothBass.current) * 0.15;

      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      meshRef.current.material.uniforms.uIntensity.value = smoothBass.current;

      // Pulse the scale to keep the 'beat' feel
      const s = 1.0 + smoothBass.current * 0.2;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 128, 128]} />
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
    <div style={{ width: "100vw", height: "100vh", background: "#FFFFFF" }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <MorphingSphere analyserRef={analyserRef} dataArrayRef={dataArrayRef} />
      </Canvas>
    </div>
  );
}
