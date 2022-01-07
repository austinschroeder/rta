// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

const width = 1500;
const height = 1500;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d')
canvas.width = width;
canvas.height = height;
let analyzer;

async function getAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(strea);
  source.connect(analyzer);
  // Amount of data to be collected
  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
  analyzer.fftSize = 2 ** 10;
}