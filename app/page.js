"use client";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const file = document.getElementById("input");
    const header_text = document.getElementById("header-text");
    const progress = document.getElementById("progress");
    let barPercentage = 0;

    file.addEventListener("change", function () {
      const musicFile = this.files[0];
      if (musicFile) {
        header_text.innerText = "Processing File...";
        file.hidden = true;
        progress.classList.remove("hidden");
        const interval = setInterval(() => {
          barPercentage += 1;
          progress.value = barPercentage;
          if (progress >= 100) {
            clearInterval(interval);
            console.log("Upload Complete!");
          }
        }, 50);
      }
    });
  });
  return (
    <div
      id="main-div"
      className="flex justify-center flex-col m-auto h-screen text-center"
    >
      <div>
        <h1 className="text-7xl font-mono" id="header-text">
          Add a file:
        </h1>
        <br></br>
        <div>
          <input
            id="input"
            type="file"
            accept=".mp3"
            className="border-black border-2 text-center p-2 cursor-pointer"
          />
          <progress
            value="0"
            max="100"
            id="progress"
            class="
            hidden
         [&::-webkit-progress-bar]:bg-green-200 
         [&::-webkit-progress-value]:bg-green-600 
         [&::-moz-progress-bar]:bg-green-600"
          ></progress>
        </div>
      </div>
    </div>
  );
}
