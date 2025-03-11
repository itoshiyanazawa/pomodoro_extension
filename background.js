let timer;
let timeLeft = 25 * 60; // Set to 25 minutes
let isRunning = false;
let isBreak = false;
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
    sendResponse({ timeLeft, isRunning, isBreak });
  } else if (request.action === 'startNoise') {
    startNoise();
  } else if (request.action === 'stopNoise') {
    stopNoise();
  }
});

async function startNoise() {
  if (!audioContext) {
    audioContext = new (AudioContext || webkitAudioContext)();
    await audioContext.audioWorklet.addModule(chrome.runtime.getURL('brown-noise-processor.js'));
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
        if (isBreak) {
          timeLeft = 25 * 60; // Set to 25 minutes
          isBreak = false;
          showNotification("Work time! 25 minutes.");
        } else {
          timeLeft = 5 * 60; // Set to 5 minutes
          isBreak = true;
          showNotification("Break time! 5 minutes.");
        }
        chrome.runtime.sendMessage({ action: 'timerEnded', isBreak });
        startTimer();
      }
    }, 1000);
    isRunning = true;
    saveState();
  }
}

function stopTimer() {
  clearInterval(timer);
  isRunning = false;
  saveState();
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 25 * 60; // Set to 25 minutes
  isRunning = false;
  isBreak = false;
  stopNoise();
  saveState();
}

function saveState() {
  chrome.storage.local.set({ timeLeft, isRunning, isBreak });
}

function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: 'Pomodoro Timer',
    message: message
  });
}