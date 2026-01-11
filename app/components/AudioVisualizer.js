"use client";

import { useEffect } from "react";

export default function AudioVisualizer({ file }) {
  useEffect(() => {
    console.log("AUDIO VISUALIZER RECEIVED FILE:", file?.name);
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-5xl">Success!</h2>
      <p className="text-black text-2xl">File Loaded: {file?.name}</p>
    </div>
  );
}
