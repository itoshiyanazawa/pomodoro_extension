let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let audioContext;
let brownNoiseNode;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    startTimer();
  } else if (request.action === 'stopTimer') {
    stopTimer();
  } else if (request.action === 'resetTimer') {
    resetTimer();
  } else if (request.action === 'getTimerState') {
    sendResponse({ timeLeft, isRunning });
  } else if (request.action === 'startNoise') {
    startNoise();
  } else if (request.action === 'stopNoise') {
    stopNoise();
  }
});

async function startNoise() {
  if (!audioContext) {
    audioContext = new (AudioContext || webkitAudioContext)();
    await audioContext.audioWorklet.addModule('brown-noise-processor.js');
    brownNoiseNode = new AudioWorkletNode(audioContext, 'brown-noise-processor');
    brownNoiseNode.connect(audioContext.destination);
  }
}

function stopNoise() {
  if (brownNoiseNode) {
    brownNoiseNode.disconnect();
    brownNoiseNode = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

function startTimer() {
  if (!isRunning) {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        chrome.runtime.sendMessage({ action: 'updateTime', timeLeft });
      } else {
        clearInterval(timer);
        isRunning = false;
        chrome.runtime.sendMessage({ action: 'timerEnded' });
      }
    }, 1000);
    isRunning = true;
  }
}

function stopTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 25 * 60;
  isRunning = false;
  stopNoise();
}