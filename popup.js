let timer;
let timeLeft = 25 * 60; // Initial time in seconds
let isRunning = false;

document.getElementById('start').addEventListener('click', () => {
  if (!isRunning) {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      } else {
        clearInterval(timer);
        isRunning = false;
        document.getElementById('start').textContent = 'Start';
        document.getElementById('stop').style.display = 'none';
        document.getElementById('resume').style.display = 'none';
        document.getElementById('reset').style.display = 'inline';
      }
    }, 1000);
    isRunning = true;
    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'inline';
    document.getElementById('reset').style.display = 'inline';
  }
});

document.getElementById('stop').addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  document.getElementById('start').style.display = 'none';
  document.getElementById('stop').style.display = 'none';
  document.getElementById('resume').style.display = 'inline';
  document.getElementById('reset').style.display = 'inline';
});

document.getElementById('resume').addEventListener('click', () => {
  if (!isRunning) {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      } else {
        clearInterval(timer);
        isRunning = false;
        document.getElementById('start').textContent = 'Start';
        document.getElementById('stop').style.display = 'none';
        document.getElementById('resume').style.display = 'none';
        document.getElementById('reset').style.display = 'inline';
      }
    }, 1000);
    isRunning = true;
    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'inline';
    document.getElementById('resume').style.display = 'none';
    document.getElementById('reset').style.display = 'inline';
  }
});

document.getElementById('reset').addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
  timeLeft = 25 * 60;
  isRunning = false;
  document.getElementById('time').textContent = '25:00';
  document.getElementById('start').textContent = 'Start';
  document.getElementById('start').style.display = 'inline';
  document.getElementById('stop').style.display = 'none';
  document.getElementById('resume').style.display = 'none';
  document.getElementById('reset').style.display = 'inline';
});

// Initial button states
document.getElementById('stop').style.display = 'none';
document.getElementById('resume').style.display = 'none';
document.getElementById('reset').style.display = 'inline';

let audioContext;
let brownNoiseNode;

document.getElementById('brown-noise').addEventListener('change', (e) => {
  if (e.target.checked) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 4096;

    brownNoiseNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0.0;

    brownNoiseNode.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain adjustment
      }
    };

    brownNoiseNode.connect(audioContext.destination);
  } else if (audioContext && brownNoiseNode) {
    brownNoiseNode.disconnect();
    audioContext.close();
    audioContext = null;
    brownNoiseNode = null;
  }
});
