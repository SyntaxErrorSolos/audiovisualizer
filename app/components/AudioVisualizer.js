"use client";

import { useEffect, useRef, useState } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  const [started, setStarted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sphereColor, setSphereColor] = useState("#000000");
  const [sphereVolume, setSphereVolume] = useState(100);
  const [bloomActive, setBloomActive] = useState(false);

  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  const handleChange = (e) => {
    const value = Number(e.target.value);
    setSphereVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = Math.pow(value / 100, 2);
    }
  };

  useEffect(() => {
    if (!started || !file) return;

    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audio.volume = Math.pow(sphereVolume / 100, 2);
    audioRef.current = audio;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioSource = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioCtx.resume().then(() => audio.play());

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();

    audio.addEventListener("ended", () => setStarted(false));

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(audioUrl);
    };
  }, [started, file]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    const btn = document.getElementById("pause_button");
    if (audioRef.current.paused) {
      audioRef.current.play();
      if (btn) btn.innerText = "PAUSE";
    } else {
      audioRef.current.pause();
      if (btn) btn.innerText = "PLAY";
    }
  };

  if (!file)
    return (
      <div style={{ padding: "2rem", color: "black" }}>
        Please upload a file first.
      </div>
    );

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {!started ? (
        <button
          onClick={() => setStarted(true)}
          style={{
            position: "absolute",
            top: "80%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1.5rem 3rem",
            fontSize: "2rem",
            fontWeight: "900",
            cursor: "pointer",
            zIndex: 10,
            background: "black",
            color: "white",
            border: "none",
          }}
        >
          START VISUALIZER
        </button>
      ) : (
        <>
          {/* Settings Icon */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              zIndex: 100,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <img
              src="/settings.svg"
              alt="Settings"
              style={{
                width: "40px",
                height: "40px",
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.5s ease",
              }}
            />
          </button>

          {/* Slide-out Panel */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: isOpen ? 0 : "-400px",
              width: "350px",
              height: "100%",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(15px)",
              borderLeft: "2px solid #000",
              padding: "100px 40px",
              transition: "right 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
              zIndex: 90,
            }}
          >
            <h2
              style={{
                fontWeight: "900",
                fontSize: "2rem",
                letterSpacing: "-1px",
              }}
            >
              SETTINGS
            </h2>

            <div>
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  marginBottom: "10px",
                }}
              >
                VOLUME
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={sphereVolume}
                onChange={handleChange}
                style={{ width: "100%", accentColor: "black" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontWeight: "700", fontSize: "0.8rem" }}>
                SPHERE COLOR
              </p>
              <label
                htmlFor="sphere_color"
                style={{
                  width: "50px",
                  height: "30px",
                  backgroundColor: sphereColor,
                  border: "2px solid black",
                  cursor: "pointer",
                }}
              />
              <input
                id="sphere_color"
                type="color"
                value={sphereColor}
                onChange={(e) => setSphereColor(e.target.value)}
                style={{ display: "none" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontWeight: "700", fontSize: "0.8rem" }}>
                BLOOM EFFECT
              </p>
              <button
                onClick={() => setBloomActive(!bloomActive)}
                style={{
                  padding: "8px 20px",
                  border: "2px solid black",
                  cursor: "pointer",
                  background: bloomActive ? "black" : "transparent",
                  color: bloomActive ? "white" : "black",
                  fontWeight: "900",
                  transition: "0.3s",
                }}
              >
                {bloomActive ? "ON" : "OFF"}
              </button>
            </div>

            <button
              id="pause_button"
              onClick={togglePlayback}
              style={{
                marginTop: "auto",
                padding: "20px",
                background: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "1.2rem",
              }}
            >
              PAUSE
            </button>
          </div>
        </>
      )}

      <ThreeJS
        analyserRef={analyserRef}
        dataArrayRef={dataArrayRef}
        sphereColor={sphereColor}
        bloomActive={bloomActive}
      />
    </main>
  );
}
