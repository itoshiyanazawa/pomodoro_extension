document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    timeLeft = response.timeLeft;
    isRunning = response.isRunning;
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
  });

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
        }
      };

      brownNoiseNode.connect(audioContext.destination);
    } else {
      if (brownNoiseNode) {
        brownNoiseNode.disconnect();
        brownNoiseNode = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    }
  });

  function startTimer() {
    isRunning = true;
    updateDisplay();
  }

  function stopTimer() {
    isRunning = false;
    updateDisplay();
  }

  function resetTimer() {
    timeLeft = 25 * 60;
    isRunning = false;
    updateDisplay();
  }

  function updateDisplay() {
    document.getElementById('time').textContent = formatTime(timeLeft);
    if (isRunning) {
      document.getElementById('start').style.display = 'none';
      document.getElementById('stop').style.display = 'inline';
      document.getElementById('resume').style.display = 'none';
    } else {
      document.getElementById('start').style.display = timeLeft === 25 * 60 ? 'inline' : 'none';
      document.getElementById('stop').style.display = 'none';
      document.getElementById('resume').style.display = timeLeft < 25 * 60 && timeLeft > 0 ? 'inline' : 'none';
    }
    document.getElementById('reset').style.display = 'inline';
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'updateTime') {
      timeLeft = request.timeLeft;
      document.getElementById('time').textContent = formatTime(timeLeft);
    } else if (request.action === 'timerEnded') {
      resetTimer();
    }
  });

  // Initial button states
  updateDisplay();

  let audioContext;
  let brownNoiseNode;
});
