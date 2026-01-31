// ===== Video audio enable (button + click-anywhere) =====
const video = document.getElementById('bg-video');
const btn   = document.getElementById('enableSound');
const hint  = document.getElementById('soundHint');

const MAX_VOLUME = 0.15;
const FADE_STEP  = 0.01;
const FADE_RATE  = 120;

let currentVolume = 0;
let fadeTimer = null;
let audioEnabled = false;

function startFadeIn() {
  if (fadeTimer) clearInterval(fadeTimer);

  fadeTimer = setInterval(() => {
    if (currentVolume < MAX_VOLUME) {
      currentVolume = Math.min(currentVolume + FADE_STEP, MAX_VOLUME);
      video.volume = currentVolume;
    } else {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }, FADE_RATE);
}

async function enableAudio() {
  if (audioEnabled) return;
  audioEnabled = true;

  // iOS: play() must be in the same user gesture
  try { await video.play(); } catch (e) {}

  video.muted = false;
  video.volume = 0;
  currentVolume = 0;
  startFadeIn();

  // cleanup UI + listeners
  btn?.remove();
  hint?.remove();
  window.removeEventListener('click', enableAudio);
  btn?.removeEventListener('click', enableAudio);
}

// Always show button, always allow click-anywhere
btn?.addEventListener('click', enableAudio);
window.addEventListener('click', enableAudio);
