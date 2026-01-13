"use client";

import { useState, useRef, useEffect } from "react";

export default function HomePage({ onComplete }) {
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const [headerText, setHeaderText] = useState("Select an MP3 to begin");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startProcessing = (file) => {
    if (file && file.type === "audio/mpeg") {
      setHeaderText("Optimizing Frequencies...");
      setIsUploading(true);

      let barPercentage = 0;
      const interval = setInterval(() => {
        barPercentage += 2;
        if (progressRef.current) progressRef.current.value = barPercentage;

        if (barPercentage >= 100) {
          clearInterval(interval);
          onComplete(file);
        }
      }, 30);
    } else {
      alert("Please upload an MP3 file.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black p-6 select-none">
      <div className="max-w-4xl text-center mb-12">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none mb-6">
          AUDIO
          <br />
          VISUALIZER
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-wide uppercase opacity-60">
          Transform sound into geometry
        </p>
      </div>

      <div className="w-full max-w-xl">
        {!isUploading ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              startProcessing(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current.click()}
            className={`
              group relative flex flex-col items-center justify-center 
              border-2 border-dashed border-black p-12 transition-all duration-300
              cursor-pointer hover:bg-black hover:text-white
              ${isDragging ? "bg-black text-white scale-105" : "bg-transparent"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3"
              onChange={(e) => startProcessing(e.target.files[0])}
              className="hidden"
            />

            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest">
              {isDragging ? "Drop it" : "Add File"}
            </h3>
            <p className="text-sm font-light opacity-70 group-hover:opacity-100">
              Drag & Drop or Click to Browse
            </p>

            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-current" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-current" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-current" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-current" />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
            <h3 className="text-xl font-black italic uppercase mb-4 tracking-tighter">
              {headerText}
            </h3>

            <div className="w-full bg-gray-100 h-1 overflow-hidden relative">
              <progress
                ref={progressRef}
                value="0"
                max="100"
                className="absolute top-0 left-0 w-full h-full appearance-none [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-black transition-all"
              />
            </div>

            <p className="mt-4 text-xs font-bold opacity-40 uppercase tracking-[0.2em]">
              Loading Assets...
            </p>
          </div>
        )}
      </div>

      <footer className="absolute bottom-10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">
        Built with ❤️ by SyntaxErrorSolos
      </footer>
    </div>
  );
}
