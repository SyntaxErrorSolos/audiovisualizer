"use client";

import { useState, useRef, useEffect } from "react";

export default function HomePage({ onComplete }) {
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  const [headerText, setHeaderText] = useState("Add a file:");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleFileChange = (event) => {
    const musicFile = event.target.files[0];

    if (musicFile) {
      setHeaderText("Processing File...");
      setIsUploading(true);

      let barPercentage = 0;
      const interval = setInterval(() => {
        barPercentage += 1;

        if (progressRef.current) {
          progressRef.current.value = barPercentage;
        }

        if (barPercentage >= 100) {
          clearInterval(interval);
          if (onCompleteRef.current) {
            onCompleteRef.current(musicFile);
          }
          if (typeof onComplete === "function") {
            onComplete(musicFile);
          }
        }
      }, 50);
    }
  };

  return (
    <div className="flex justify-center flex-col m-auto h-screen text-center">
      <h1 className="text-9xl font-extrabold">Audio Visualizer</h1>
      <h2 className="font-light text-3xl">
        Visualize your beat drops and frequency changes
        <br />
        You may also download your visualizer!
      </h2>
      <br></br>
      <div className="mt-4">
        <h3 className="text-2xl font-extralight">{headerText}</h3>

        {!isUploading && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3"
            onChange={handleFileChange}
            className="border-black border-2 p-2 cursor-pointer"
          />
        )}

        {isUploading && (
          <progress
            ref={progressRef}
            value="0"
            max="100"
            className="w-64 h-4 [&::-webkit-progress-value]:bg-green-600"
          ></progress>
        )}
      </div>
    </div>
  );
}
