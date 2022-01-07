// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

const width = 1500;
const height = 1500;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;
let analyzer;
let bufferLength;

function handleError(err) {
  console.log('You must give access to your mic in order to proceed');
}

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(handleError);
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyzer);
  // Amount of data to be collected
  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
  analyzer.fftSize = 2 ** 8;
  // Collect data from audio input
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
  bufferLength = analyzer.frequencyBinCount; // How many pieces of data
  const timeData = new Uint8Array(bufferLength);
  const frequencyData = new Uint8Array(bufferLength);
  drawTimeData(timeData);
  drawFrequency(frequencyData);
}

function drawTimeData(timeData) {
  // Inject time data into timData array
  analyzer.getByteTimeDomainData(timeData);
  console.log(timeData);
  // Visualize
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffc600';
  ctx.beginPath();
  const sliceWidth = width / bufferLength;
  console.log(sliceWidth);
  let x = 0;
  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * height) / 2;
    // Draw the lines
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });

  ctx.stroke();

  // Call itself as soon as possible
  requestAnimationFrame(() => drawTimeData(timeData));
}

getAudio();
