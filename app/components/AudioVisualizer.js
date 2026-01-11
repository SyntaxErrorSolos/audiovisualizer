"use client";

import { useEffect } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  useEffect(() => {
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audio.play();
    return () => {
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(audioUrl);
    };
  }, [file]);

  return (
    <main>
      {" "}
      <ThreeJS />{" "}
    </main>
  );
}
