document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['timeLeft', 'isRunning', 'isBreak', 'brownNoiseEnabled'], (result) => {
    timeLeft = result.timeLeft !== undefined ? result.timeLeft : 25 * 60; // Set to 25 minutes
    isRunning = result.isRunning !== undefined ? result.isRunning : false;
    isBreak = result.isBreak !== undefined ? result.isBreak : false;
    document.getElementById('brown-noise').checked = result.brownNoiseEnabled || false;
    updateDisplay();
    if (isRunning) {
      startTimer();
    }
  });

  document.getElementById('start').addEventListener('click', () => {
    if (!isRunning) {
      chrome.runtime.sendMessage({ action: 'startTimer' });
      startTimer();
      if (document.getElementById('brown-noise').checked) {
        chrome.runtime.sendMessage({ action: 'startNoise' });
        chrome.storage.local.set({ brownNoiseEnabled: true });
      }
    } else {
      chrome.runtime.sendMessage({ action: 'stopTimer' });
      stopTimer();
    }
  });

  document.getElementById('stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopTimer' });
    stopTimer();
  });

  document.getElementById('resume').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startTimer' });
    startTimer();
  });

  document.getElementById('reset').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'resetTimer' });
    resetTimer();
    chrome.runtime.sendMessage({ action: 'stopNoise' });
    chrome.storage.local.set({ brownNoiseEnabled: false });
  });

  document.getElementById('brown-noise').addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.runtime.sendMessage({ action: 'startNoise' });
    } else {
      chrome.runtime.sendMessage({ action: 'stopNoise' });
    }
    chrome.storage.local.set({ brownNoiseEnabled: e.target.checked });
  });
});

function startTimer() {
  isRunning = true;
  updateDisplay();
  saveState();
}

function stopTimer() {
  isRunning = false;
  updateDisplay();
  saveState();
}

function resetTimer() {
  timeLeft = 25 * 60; // Set to 25 minutes
  isRunning = false;
  isBreak = false;
  updateDisplay();
  saveState();
}

function updateDisplay() {
  document.getElementById('time').textContent = formatTime(timeLeft);
  if (isRunning) {
    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'inline';
    document.getElementById('resume').style.display = 'none';
  } else {
    document.getElementById('start').style.display = timeLeft === 25 * 60 ? 'inline' : 'none'; // Set to 25 minutes
    document.getElementById('stop').style.display = 'none';
    document.getElementById('resume').style.display = timeLeft < 25 * 60 && timeLeft > 0 ? 'inline' : 'none'; // Set to 25 minutes
  }
  document.getElementById('reset').style.display = 'inline';
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function saveState() {
  chrome.storage.local.set({ timeLeft, isRunning, isBreak });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updateTime') {
    timeLeft = request.timeLeft;
    document.getElementById('time').textContent = formatTime(timeLeft);
  } else if (request.action === 'timerEnded') {
    isBreak = request.isBreak;
    updateDisplay();
  }
});
