"use strict";
let spinAudio = null;
function tickSound() {
  try {
    if (!spinAudio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      spinAudio = new Audio();
    }
    if (spinAudio.state === "suspended") spinAudio.resume();
    const osc = spinAudio.createOscillator(),
      gain = spinAudio.createGain();
    osc.connect(gain);
    gain.connect(spinAudio.destination);
    osc.frequency.value = 550;
    gain.gain.setValueAtTime(0.025, spinAudio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      spinAudio.currentTime + 0.025,
    );
    osc.start();
    osc.stop(spinAudio.currentTime + 0.03);
  } catch {
    /* Audio is optional. */
  }
}
function playSpinSound(duration) {
  tickSound();
  let elapsed = 0,
    interval = 55;
  const tick = () => {
    elapsed += interval;
    if (elapsed >= duration - 150) return;
    tickSound();
    interval = 55 + Math.pow(elapsed / duration, 3) * 430;
    setTimeout(tick, interval);
  };
  setTimeout(tick, interval);
}
