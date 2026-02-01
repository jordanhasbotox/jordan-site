/* =========================================================
   AUDIO ENABLE + FADE-IN LOGIC
   Handles background video audio with:
   - Button-based enable (all devices)
   - Click-anywhere enable (desktop only)
   ========================================================= */

/* Core elements */
const video = document.getElementById('bg-video');
const btn = document.getElementById('enableSound');
const hint = document.getElementById('soundHint');

/* Audio tuning constants */
const MAX_VOLUME = 0.15;
const FADE_STEP = 0.01;
const FADE_RATE = 120;

/* Runtime audio state */
let currentVolume = 0;
let fadeTimer = null;

/* Gradually fade audio in to avoid harsh start */
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

/* Enable audio (must be triggered by a user gesture on iOS) */
async function enableAudio() {
  try {
    /* Unmute and reset volume */
    video.muted = false;
    video.volume = 0;
    currentVolume = 0;

    /* Play video within same user gesture */
    await video.play();

    /* Smooth volume fade-in */
    startFadeIn();
  } catch (e) {
    console.warn('Audio enable failed:', e);
    return; // Keep UI so user can retry
  }

  /* Cleanup UI and listeners once audio is enabled */
  btn?.remove();
  if (hint) hint.style.display = 'none';
  window.removeEventListener('click', desktopClickEnable);
}

/* =========================================================
   SOUND BUTTON HANDLER
   Works on both mobile and desktop.
   ========================================================= */
btn?.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent desktop click-anywhere trigger
  enableAudio();
});

/* =========================================================
   DESKTOP CLICK-ANYWHERE ENABLE
   Only enabled on fine-pointer devices (mouse/trackpad).
   ========================================================= */
const isDesktop = matchMedia('(pointer: fine)').matches;

function desktopClickEnable(e) {
  /* If they clicked the button, its handler already ran */
  if (btn && e.target === btn) return;
  enableAudio();
}

if (isDesktop) {
  window.addEventListener('click', desktopClickEnable);
}

/* =========================================================
   TOAST NOTIFICATION + COPY LOGIC
   Used for Discord / Riot ID copy feedback.
   ========================================================= */

/* Toast element and timer */
const toastEl = document.getElementById('toast');
let toastTimer;

/* Show toast message temporarily */
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2000);
}

/* Cross-browser clipboard copy helper */
async function copyText(text) {
  try {
    /* Modern clipboard API */
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      /* Fallback for older browsers */
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

/* =========================================================
   DISCORD COPY HANDLER
   ========================================================= */
const discordEl = document.getElementById('discordCopy');

discordEl?.addEventListener('click', async () => {
  const discord =
    discordEl.dataset.discord || discordEl.textContent.trim();

  const ok = await copyText(discord);

  showToast(
    ok
      ? 'You copied my Discord — add me <3'
      : 'Couldn’t copy — copy it manually: ' + discord
  );
});

/* =========================================================
   RIOT ID COPY HANDLER
   ========================================================= */
const riotEl = document.getElementById('riotCopy');

riotEl?.addEventListener('click', async () => {
  const riot =
    riotEl.dataset.riot || riotEl.textContent.trim();

  const ok = await copyText(riot);

  showToast(
    ok
      ? 'Now you copied my Riot ID...add me fr'
      : 'Couldn’t copy — copy it manually: ' + riot
  );
});

/* =========================================================
   EMBARK ID COPY HANDLER
   ========================================================= */
const embarkEl = document.getElementById('embarkCopy');

embarkEl?.addEventListener('click', async () => {
  const embark =
    embarkEl.dataset.riot || embarkEl.textContent.trim();

  const ok = await copyText(embark);

  showToast(
    ok
      ? 'Copied embark ID'
      : 'Couldn’t copy — copy it manually: ' + embark
  );
});

/* =========================================================
   LIVE CLOCK (LOCAL TIME)
   Updates every second.
   ========================================================= */
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

/* Initial render + interval update */
updateClock();
setInterval(updateClock, 1000);

