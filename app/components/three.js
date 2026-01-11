"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// 1. SHADERS (With the Power Curve displacement)
const vertexShader = `
  varying vec2 vUv;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uTreble;

  void main() {
    vUv = uv;
    float noise = sin(position.x * 5.0 + uTime) * cos(position.y * 5.0 + uTime) * sin(position.z * 5.0 + uTime);
    
    // THE SWEET SPOT: Squaring intensity makes drops punchier
    float powerBass = pow(uIntensity, 2.0); 
    float displacement = noise * (powerBass * 0.6);
    
    float glitch = sin(position.y * 100.0 + uTime * 20.0) * uTreble * 0.2;
    vDisplacement = displacement + glitch;
    
    vec3 newPosition = position + normal * (displacement + glitch);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uTreble;

  void main() {
    vec3 inkBlue = vec3(0.05, 0.1, 0.4);
    vec3 electricPurple = vec3(0.5, 0.0, 0.8);
    vec3 contrastBlack = vec3(0.0, 0.0, 0.0);

    vec3 gradientBase = mix(inkBlue, electricPurple, vUv.y);
    float ripple = sin(vUv.y * 25.0 - uTime * 6.0 + vUv.x * 5.0);
    float pulse = smoothstep(0.0, 0.2, ripple) * uIntensity;

    vec3 finalColor = mix(gradientBase, contrastBlack, pulse * 0.5);
    finalColor = mix(finalColor, contrastBlack, uTreble * 0.9);
    finalColor -= vDisplacement * 2.0;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// 2. CAMERA WITH SHAKE
function RiggedCamera({ bassRef, trebleRef }) {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const b = bassRef.current;
    const tr = trebleRef.current;

    // Movement Orbit
    camera.position.x = Math.sin(t * 0.5) * 2.5;
    camera.position.y = Math.cos(t * 0.3) * 1.5;

    // THE SHAKE: Only kicks in if treble hits a certain energy level
    if (tr > 0.2) {
      camera.position.x += (Math.random() - 0.5) * (tr * 0.4);
      camera.position.y += (Math.random() - 0.5) * (tr * 0.4);
    }

    camera.fov = 75 + b * 15;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// 3. SPHERE WITH POWER CURVE
function GlitchSphere({ analyserRef, dataArrayRef, bassRef, trebleRef }) {
  const meshRef = useRef(null);
  const smoothBass = useRef(0);
  const smoothTreble = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uTreble: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Bass (Low end) and Treble (High end)
      const rawBass = dataArrayRef.current[2] / 255.0;
      const rawTreble = dataArrayRef.current[100] / 255.0;

      smoothBass.current += (rawBass - smoothBass.current) * 0.15;
      smoothTreble.current += (rawTreble - smoothTreble.current) * 0.4;

      const glitchActive =
        smoothTreble.current > 0.3 ? smoothTreble.current : 0;

      // Update the shared Refs
      bassRef.current = smoothBass.current;
      trebleRef.current = glitchActive;

      meshRef.current.material.uniforms.uTime.value =
        state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uIntensity.value = smoothBass.current;
      meshRef.current.material.uniforms.uTreble.value = glitchActive;

      const scale = 1.0 + smoothBass.current * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y += 0.005 + glitchActive * 0.1;
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
        transparent={true}
      />
    </mesh>
  );
}

// 4. MAIN EXPORT
export default function ThreeJS({ analyserRef, dataArrayRef }) {
  // Create BOTH refs here
  const bassRef = useRef(0);
  const trebleRef = useRef(0);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#FFFFFF" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 75 }}>
        <RiggedCamera bassRef={bassRef} trebleRef={trebleRef} />
        <GlitchSphere
          analyserRef={analyserRef}
          dataArrayRef={dataArrayRef}
          bassRef={bassRef}
          trebleRef={trebleRef}
        />
      </Canvas>
    </div>
  );
}
