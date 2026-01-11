"use client";
import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { createAudioAnalyzer } from "./audioNode";
import ThreeScene from "./three";

export default function AudioVisualizer({ file }) {
  const audioRef = useRef(null);
  const [analyzer, setAnalyzer] = useState(null);
  const [url, setUrl] = useState(null); // Initialize as null, not ""

  useEffect(() => {
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setUrl(newUrl);

      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(newUrl);
    }
  }, [file]);

  const handlePlay = () => {
    // Browsers require a user gesture (like clicking play)
    // to start the AudioContext
    if (!analyzer && audioRef.current) {
      const { audioData } = createAudioAnalyzer(audioRef.current);
      setAnalyzer(audioData);
    }
  };

  // 1. Prevent rendering the audio tag if there's no URL
  if (!url) return <div>Please upload or select an MP3 file.</div>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        onPlay={handlePlay}
        controls
        style={{
          position: "absolute",
          zIndex: 10,
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Only show the 3D scene once the analyzer is ready */}
        {analyzer && <ThreeScene audioData={analyzer} />}
      </Canvas>
    </div>
  );
}
