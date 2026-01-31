// ===== Video audio enable (button on all, click-anywhere on desktop only) =====
const video = document.getElementById('bg-video');
const btn = document.getElementById('enableSound');
const hint = document.getElementById('soundHint');

const MAX_VOLUME = 0.15;
const FADE_STEP  = 0.01;
const FADE_RATE  = 120;

let currentVolume = 0;
let fadeTimer = null;

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
  // Must be triggered by a user gesture on iOS
  try {
    video.muted = false;   // unmute first
    video.volume = 0;
    currentVolume = 0;

    await video.play();    // then play (in same gesture)
    startFadeIn();
  } catch (e) {
    console.warn('Audio enable failed:', e);
    return; // keep button so user can retry
  }

  // cleanup UI + listeners
  btn?.remove();
  if (hint) hint.style.display = 'none';
  window.removeEventListener('click', desktopClickEnable);
}

// Button works everywhere (mobile + desktop)
btn?.addEventListener('click', (e) => {
  e.stopPropagation(); // don’t let desktop click-anywhere also fire
  enableAudio();
});

// Desktop-only click anywhere
const isDesktop = matchMedia('(pointer: fine)').matches;

function desktopClickEnable(e) {
  // If they clicked the button, the button handler already does it
  if (btn && e.target === btn) return;
  enableAudio();
}

if (isDesktop) {
  window.addEventListener('click', desktopClickEnable);
}


// ===== Toast + copy logic =====
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const discordEl = document.getElementById('discordCopy');
discordEl?.addEventListener('click', async () => {
  const discord = discordEl.dataset.discord || discordEl.textContent.trim();
  const ok = await copyText(discord);
  showToast(ok ? "You copied my Discord — add me <3" : "Couldn’t copy — copy it manually: " + discord);
});

const riotEl = document.getElementById('riotCopy');
riotEl?.addEventListener('click', async () => {
  const riot = riotEl.dataset.riot || riotEl.textContent.trim();
  const ok = await copyText(riot);
  showToast(ok ? "Now you copied my Riot ID...add me fr" : "Couldn’t copy — copy it manually: " + riot);
});


// ===== Live clock (local time) =====
const clockEl = document.getElementById('clock');

function updateClock() {
  if (!clockEl) return;

  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  clockEl.textContent = time;
}

updateClock();
setInterval(updateClock, 1000);
