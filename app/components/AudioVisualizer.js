"use client";

import { useEffect } from "react";
import ThreeJS from "./three";

export default function AudioVisualizer({ file }) {
  useEffect(() => {
    console.log("AUDIO VISUALIZER RECEIVED FILE:", file?.name);
  }, [file]);

  return (
    <main>
      {" "}
      <ThreeJS />{" "}
    </main>
  );
}
