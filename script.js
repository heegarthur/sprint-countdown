const textEl = document.getElementById('text-element');
const startBtn = document.getElementById('start-btn');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

function getNumberOr(def, v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const defaults = {
  minGetReady: 4000,
  maxGetReady: 6000,
  minOnYourMarks: 4000,
  maxOnYourMarks: 7000,
  minSet: 3000,
  maxSet: 6000
};

const minGetReady = getNumberOr(defaults.minGetReady, localStorage.getItem("minGetReady"));
const maxGetReady = getNumberOr(defaults.maxGetReady, localStorage.getItem("maxGetReady"));
const minOnYourMarks = getNumberOr(defaults.minOnYourMarks, localStorage.getItem("minOnYourMarks"));
const maxOnYourMarks = getNumberOr(defaults.maxOnYourMarks, localStorage.getItem("maxOnYourMarks"));
const minSet = getNumberOr(defaults.minSet, localStorage.getItem("minSet"));
const maxSet = getNumberOr(defaults.maxSet, localStorage.getItem("maxSet"));

document.getElementById("t1").value = minGetReady;
document.getElementById("t2").value = maxGetReady;
document.getElementById("t3").value = minOnYourMarks;
document.getElementById("t4").value = maxOnYourMarks;
document.getElementById("t5").value = minSet;
document.getElementById("t6").value = maxSet;

const texts = ["Athletes, get ready", "On your marks", "Set"];
const files = ["athletes_get_ready.mp3", "on_your_marks.mp3", "set.mp3"];
const pistolFile = "pistol.mp3";

let timerInterval = null;
let startTime = 0;
let elapsed = 0;
let paused = false;

function randDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function format(ms) {
  const total = ms / 1000;
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

function updateTimer() {
  if (!paused) {
    elapsed = Date.now() - startTime;
    timerDisplay.textContent = format(elapsed);
  }
}

function playAudioElement(a) {
  const p = a.play();
  if (p && p.catch) return p.catch(() => { });
  return Promise.resolve();
}

async function runSequence(audioEls) {
  startBtn.disabled = true;
  startBtn.style.cursor = "not-allowed";

  const ds = [
    { min: getNumberOr(defaults.minGetReady, document.getElementById("t1").value), max: getNumberOr(defaults.maxGetReady, document.getElementById("t2").value) },
    { min: getNumberOr(defaults.minOnYourMarks, document.getElementById("t3").value), max: getNumberOr(defaults.maxOnYourMarks, document.getElementById("t4").value) },
    { min: getNumberOr(defaults.minSet, document.getElementById("t5").value), max: getNumberOr(defaults.maxSet, document.getElementById("t6").value) }
  ];

  for (let i = 0; i < texts.length; i++) {
    textEl.textContent = texts[i];
    await playAudioElement(audioEls[i]);
    const delay = randDelay(ds[i].min, ds[i].max);
    await new Promise(r => setTimeout(r, delay));
  }

  textEl.textContent = ""; 

  await new Promise((resolve, reject) => {
    const pistol = audioEls[3];

    function onPlaying() {
      pistol.removeEventListener("playing", onPlaying);

      textEl.style.display = "none";
      timerContainer.style.display = "block";
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 50);

      resolve();
    }

    pistol.addEventListener("playing", onPlaying);
    pistol.play().catch(e => {
      pistol.removeEventListener("playing", onPlaying);
      textEl.style.display = "none";
      timerContainer.style.display = "block";
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 50);
      resolve();
    });
  });
}


startBtn.addEventListener("click", async () => {
  const a0 = new Audio(files[0]);
  const a1 = new Audio(files[1]);
  const a2 = new Audio(files[2]);
  const pistol = new Audio(pistolFile);

  a0.preload = "auto";
  a1.preload = "auto";
  a2.preload = "auto";
  pistol.preload = "auto";

  a0.load();
  a1.load();
  a2.load();
  pistol.load();

  try { await a0.play().catch(() => { }); a0.pause(); a0.currentTime = 0; } catch (e) { }
  try { await a1.play().catch(() => { }); a1.pause(); a1.currentTime = 0; } catch (e) { }
  try { await a2.play().catch(() => { }); a2.pause(); a2.currentTime = 0; } catch (e) { }
  try { await pistol.play().catch(() => { }); pistol.pause(); pistol.currentTime = 0; } catch (e) { }

  await runSequence([a0, a1, a2, pistol]);
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  if (paused) pauseBtn.textContent = "Resume";
  else {
    startTime = Date.now() - elapsed;
    pauseBtn.textContent = "Pause";
  }
});

stopBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  elapsed = 0;
  paused = false;
  timerDisplay.textContent = "00:00:00.00";
  timerContainer.style.display = "none";
  textEl.style.display = "block";
  startBtn.disabled = false;
  startBtn.style.cursor = "pointer";
  pauseBtn.textContent = "Pause";
  textEl.textContent = "";
});

function saveTimes() {
  function s(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : "";
  }
  localStorage.setItem("minGetReady", s(document.getElementById("t1").value));
  localStorage.setItem("maxGetReady", s(document.getElementById("t2").value));
  localStorage.setItem("minOnYourMarks", s(document.getElementById("t3").value));
  localStorage.setItem("maxOnYourMarks", s(document.getElementById("t4").value));
  localStorage.setItem("minSet", s(document.getElementById("t5").value));
  localStorage.setItem("maxSet", s(document.getElementById("t6").value));
}
