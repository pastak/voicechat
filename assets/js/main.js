'use strict';
(() => {

  const VERSION = '20200413-1900';

  const wavTitles = [
    "あ、あ、聞こえてますか？",
    "いいはなし",
    "えー良さそう",
    "じゃあそれで",
    "そんなことある？",
    "なるほど",
    "やっぱそうやんなぁ",
    "ウケる",
    "スゴい",
    "便利",
    "大変そう",
    "微妙やな",
    "最悪"
  ];

  let currentCacheVersion;

  navigator.serviceWorker.register('/serviceworker.js')

  try {
    currentCacheVersion = localStorage.getItem('currentCacheVersion')
    localStorage.setItem('currentCacheVersion', VERSION);
  } catch (e) {}

  if (currentCacheVersion !== VERSION) {
    if (currentCacheVersion) caches.delete('caches at ' + currentCacheVersion);
    caches.open('caches at ' + VERSION)
      .then(cache => {
        cache.addAll([
          ...wavTitles.map(title => `/assets/wav/${encodeURIComponent(title)}.wav`),
          '/',
          '/assets/js/main.js'
        ])
      })
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  const buttonsFragment = document.createDocumentFragment();

  let gain = 1.0;
  let playOnButtonDown = false;

  document.getElementById('gainControl').addEventListener('input', (event) => {
    gain = +event.target.value;
    document.getElementById('gainValue').textContent = gain;
  })

  document.getElementById('playOnButtonDown').addEventListener('change', (event) => {
    playOnButtonDown = event.target.value === 'on';
  })

  wavTitles.forEach((title) => {
    const filePath = `/assets/wav/${encodeURIComponent(title)}.wav`;

    // create button element
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = title;
    buttonsFragment.append(button);

    let currentSrc = null;
    let playing = false;

    const playSound = async () => {
      if (currentSrc) currentSrc.stop(audioContext.currentTime);
      if (!playing) return currentSrc.stop(audioContext.currentTime);
      currentSrc = audioContext.createBufferSource();
      
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();

      audioContext.decodeAudioData(buffer, (decodedData) => {
        if (!currentSrc) return;
        currentSrc.buffer = decodedData;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = gain;

        currentSrc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        currentSrc.onended = () => {
          if (playOnButtonDown) {
            playSound();
          } else {
            playing = false;
            currentSrc = null;
          }
        }
  
        currentSrc.start(0);
      })
    }

    button.addEventListener('mousedown', () => {
      playing = true;
      playSound();
    })
    button.addEventListener('mouseup', () => {
      if (playOnButtonDown) {
        playing = false;
        currentSrc.stop(audioContext.currentTime);
      }
    })
  })

  const setupDOM = () => {
    document.getElementById('mainButtonsContainer').append(buttonsFragment);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupDOM();
  } else {
    document.addEventListener('DOMContentLoaded', () => setupDOM());
  }

})()
