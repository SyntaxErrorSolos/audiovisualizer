"use client";

import { useEffect, useRef, useState } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  const [started, setStarted] = useState(false);
  const [sphereColor, setSphereColor] = useState("#000000");
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

    const toggle_button = document.getElementById("pause_button");

    if (toggle_button) {
      toggle_button.addEventListener("click", function () {
        if (audio.paused) {
          audio.play();
          toggle_button.innerText = "Pause";
        } else {
          audio.pause();
          toggle_button.innerText = "Resume";
        }
      });
    }

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    audio.addEventListener("ended", () => {
      console.log("Track finished!");
      setStarted(false);
    });

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
          className="text-black"
          onClick={() => setStarted(true)}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "90%",
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
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            zIndex: 10,
          }}
        >
          <label
            htmlFor="sphere_color"
            style={{
              width: "60px",
              height: "30px",
              backgroundColor: sphereColor,
              cursor: "pointer",
              display: "block",
              border: "1px solid #000",
            }}
          />

          <input
            type="color"
            id="sphere_color"
            value={sphereColor}
            style={{
              opacity: 0,
              position: "absolute",
              width: 0,
              height: 0,
            }}
            onChange={(e) => {
              const color = e.target.value;
              setSphereColor(color);
            }}
          />

          <button
            className="text-black"
            id="pause_button"
            style={{
              fontSize: "1.5rem",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            Pause
          </button>
        </div>
      )}

      <ThreeJS
        analyserRef={analyserRef}
        dataArrayRef={dataArrayRef}
        sphereColor={sphereColor}
      />
    </main>
  );
}
