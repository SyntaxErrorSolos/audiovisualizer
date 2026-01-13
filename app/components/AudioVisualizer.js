"use client";

import { useEffect, useRef, useState } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  const [started, setStarted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sphereColor, setSphereColor] = useState("#000000");
  const [sphereVolume, setSphereVolume] = useState(100);
  const [bloomActive, setBloomActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const chunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const rafRef = useRef(null);

  const audioCtxRef = useRef(null);
  const streamDestRef = useRef(null);

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
    audioCtxRef.current = audioCtx;
    const audioSource = audioCtx.createMediaElementSource(audio);
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    const streamDest = audioCtx.createMediaStreamDestination();
    streamDestRef.current = streamDest;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    source.connect(streamDest);

    const update = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();

    audio.addEventListener("ended", () => {
      if (!isRecording) setStarted(false);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(audioUrl);
      audioCtx.close();
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

  const downloadVisualizer = async () => {
    if (!audioRef.current || !canvasRef.current || !streamDestRef.current)
      return;

    setIsRecording(true);
    chunksRef.current = [];

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    const canvasStream = canvasRef.current.captureStream(60);
    const audioTrack = streamDestRef.current.stream.getAudioTracks()[0];
    canvasStream.addTrack(audioTrack);

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    const supportedType = mimeTypes.find((t) =>
      MediaRecorder.isTypeSupported(t)
    );

    const recorder = new MediaRecorder(canvasStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 25000000,
    });

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: supportedType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.split(".")[0]}_visualizer.webm`;
      link.click();
      setIsRecording(false);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    audioRef.current.play();

    audioRef.current.onended = () => {
      if (recorder.state !== "inactive") {
        recorder.stop();
        setStarted(false);
      }
    };
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
      {isRecording && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "red",
              animation: "pulse 1.5s infinite",
            }}
          />
          <h1 style={{ fontWeight: "900", marginTop: "20px", color: "black" }}>
            RECORDING IN PROGRESS...
          </h1>
          <p style={{ fontWeight: "700" }}>DO NOT MINIMIZE TAB</p>

          <style>{`
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 1; }
        70% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(0.95); opacity: 1; }
      }
    `}</style>
        </div>
      )}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontWeight: "700", fontSize: "0.8rem" }}>
                CAMERA SHAKE
              </p>
              <button
                onClick={() => setShakeEnabled(!shakeEnabled)}
                style={{
                  padding: "8px 20px",
                  border: "2px solid black",
                  cursor: "pointer",
                  background: shakeEnabled ? "black" : "transparent",
                  color: shakeEnabled ? "white" : "black",
                  fontWeight: "900",
                  transition: "0.3s",
                }}
              >
                {shakeEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontWeight: "700", fontSize: "0.8rem" }}>
                FLOOR GRID
              </p>
              <button
                onClick={() => setGridEnabled(!gridEnabled)}
                style={{
                  padding: "8px 20px",
                  border: "2px solid black",
                  cursor: "pointer",
                  background: gridEnabled ? "black" : "transparent",
                  color: gridEnabled ? "white" : "black",
                  fontWeight: "900",
                  transition: "0.3s",
                }}
              >
                {gridEnabled ? "ON" : "OFF"}
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
            <button
              onClick={downloadVisualizer}
              disabled={isRecording}
              style={{
                width: "100%",
                padding: "15px",
                marginTop: "10px",
                border: "2px solid black",
                background: isRecording ? "#eee" : "transparent",
                color: "black",
                fontWeight: "900",
                cursor: isRecording ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {isRecording ? "EXPORTING..." : "DOWNLOAD FULL VIDEO"}
              {isRecording && (
                <span style={{ fontSize: "10px", marginTop: "5px" }}>
                  Do not close tab until finished
                </span>
              )}
            </button>
          </div>
        </>
      )}

      <ThreeJS
        analyserRef={analyserRef}
        dataArrayRef={dataArrayRef}
        sphereColor={sphereColor}
        bloomActive={bloomActive}
        shakeEnabled={shakeEnabled}
        gridEnabled={gridEnabled}
        canvasRef={canvasRef}
      />
    </main>
  );
}
