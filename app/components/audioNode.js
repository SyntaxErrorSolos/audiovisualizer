export const createAudioAnalyzer = (audioElement) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  // This object will be updated constantly
  const audioData = {
    bass: 0,
    avg: 0,
    update: () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate Bass (first 10 bins)
      let bassSum = 0;
      for (let i = 0; i < 10; i++) bassSum += dataArray[i];
      audioData.bass = bassSum / 10;

      // Calculate Average
      let totalSum = 0;
      for (let i = 0; i < dataArray.length; i++) totalSum += dataArray[i];
      audioData.avg = totalSum / dataArray.length;
    },
  };

  return { audioData, audioContext };
};
