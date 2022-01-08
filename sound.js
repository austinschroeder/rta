// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

const width = 1500;
const height = 500;
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

// Enables the use of HSL with Canvas
function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function drawFrequency(frequencyData) {
  // Get the freq data into the freq array
  analyzer.getByteFrequencyData(frequencyData);
  // Figure out the bar width
  const barWidth = (width / bufferLength) * 2.5;

  let x = 0;
  frequencyData.forEach((amount) => {
    // 0 to 255
    const percent = amount / 255;
    const barHeight = height * percent * 0.75;
    // Convert color to HSL
    // https://mothereffinghsl.com/
    const [h, s, l] = [360 / (percent * 360), 0.5, 0.5];
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth + 0.5;
  });

  requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio();
