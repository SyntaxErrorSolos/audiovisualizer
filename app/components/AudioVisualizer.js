"use client";

import { useEffect, useRef, useState } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  const [started, setStarted, setPause] = useState(false);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started || !file) return;

    // Create Audio element
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Create AudioContext and Analyser
    const audioCtx = new AudioContext();
    const audioSource = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioCtx.resume().then(() => {
      audio.play();
    });

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        console.log(dataArrayRef.current[0]);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    // Cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [started, file]);

  if (!file) return <div>Please upload a file first</div>;

  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {!started && (
        <button
          className="text-white font-mono"
          onClick={() => setStarted(true)}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Play
        </button>
      )}
      {started && (
        <button
          className="text-white font-mono"
          onClick={() => setPause(true)}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Pause
        </button>
      )}
      <ThreeJS analyserRef={analyserRef} dataArrayRef={dataArrayRef} />
    </main>
  );
}
