"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Vertex Shader: morph vertices along normal based on multiple frequency bands
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;

  void main() {
    vUv = uv;

    // Base "organic wobble"
    float baseNoise = sin(position.x*3.0 + uTime) * cos(position.y*3.0 + uTime) * sin(position.z*3.0 + uTime);

    // Morphing from audio bands
    float bassDisplacement = baseNoise * (uBass * 1.5); // main push
    float midDisplacement = baseNoise * (uMid * 0.4);    // subtle twist
    float highDisplacement = baseNoise * (uHigh * 0.2);  // jittery spark

    vec3 newPosition = position + normal * (bassDisplacement + midDisplacement + highDisplacement);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment Shader: color shifts with bass + hue rotation
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uBass;

  void main() {
    // Base color: yellow/orange
    vec3 baseColor = vec3(1.0, 0.8, 0.0);

    // Beat flash: add white based on bass
    vec3 beatColor = vec3(1.0, 1.0, 1.0) * uBass * 0.5;

    // Gentle hue rotation over time for psychedelic effect
    float hueShift = sin(uTime*0.3) * 0.2;
    vec3 finalColor = baseColor + beatColor + hueShift;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function BeatingSphere({ analyserRef, dataArrayRef }) {
  const meshRef = useRef(null);
  const smoothBass = useRef(0);
  const smoothMid = useRef(0);
  const smoothHigh = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Split bands
      const bass =
        (dataArrayRef.current[0] + dataArrayRef.current[1]) / 2 / 255.0;
      const mid =
        (dataArrayRef.current[5] + dataArrayRef.current[6]) / 2 / 255.0;
      const high =
        (dataArrayRef.current[15] + dataArrayRef.current[16]) / 2 / 255.0;

      // Smooth values for nicer animation
      smoothBass.current += (bass - smoothBass.current) * 0.2;
      smoothMid.current += (mid - smoothMid.current) * 0.1;
      smoothHigh.current += (high - smoothHigh.current) * 0.05;

      // Feed uniforms
      meshRef.current.material.uniforms.uTime.value =
        clock.getElapsedTime() * 2.0;
      meshRef.current.material.uniforms.uBass.value = smoothBass.current;
      meshRef.current.material.uniforms.uMid.value = smoothMid.current;
      meshRef.current.material.uniforms.uHigh.value = smoothHigh.current;

      // Overall scaling for bass pulse
      const scale = 1.0 + smoothBass.current * 0.2;
      meshRef.current.scale.set(scale, scale, scale);

      // Gentle rotation
      meshRef.current.rotation.y += 0.005 + smoothMid.current * 0.01;
      meshRef.current.rotation.x += 0.002 + smoothHigh.current * 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
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
        <BeatingSphere analyserRef={analyserRef} dataArrayRef={dataArrayRef} />
      </Canvas>
    </div>
  );
}
