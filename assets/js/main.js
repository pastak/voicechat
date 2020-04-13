'use strict';
(() => {

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

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  const buttonsFragment = document.createDocumentFragment();

  let gain = 1.0;
  let playOnce = false;

  document.getElementById('gainControl').addEventListener('input', (event) => {
    gain = +event.target.value;
    document.getElementById('gainValue').textContent = gain;
  })

  document.getElementById('playOnce').addEventListener('change', (event) => {
    playOnce = event.target.value === 'on';
  })

  wavTitles.forEach((title) => {
    const filePath = `/assets/wav/${encodeURIComponent(title)}.wav`;

    // preloading
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'fetch';
    preload.type = 'audio/x-wav';
    preload.crossOrigin = true;
    preload.href = filePath;
    document.head.appendChild(preload);

    // create button element
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = title;
    buttonsFragment.append(button);

    let currentSrc = null;
    let playing = false;

    const playSound = async () => {
      if (currentSrc) currentSrc.stop();
      if (!playing) return currentSrc.stop();
      currentSrc = audioContext.createBufferSource();
      
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();

      audioContext.decodeAudioData(buffer, (decodedData) => {
        currentSrc.buffer = decodedData;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = gain;

        currentSrc.connect(gainNode);
        gainNode.connect(audioContext.destination);
      })

      currentSrc.onended = () => {
        if (!playOnce) playSound();
      }

      currentSrc.start(0);
    }

    button.addEventListener('mousedown', () => {
      playing = true;
      playSound();
    })
    button.addEventListener('mouseup', () => {
      playing = false;
      currentSrc.stop();
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
