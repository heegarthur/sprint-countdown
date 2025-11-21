const textEl = document.getElementById('text-element');
const startBtn = document.getElementById('start-btn');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

function safeLoad(value, fallback) {
  const number = Number(value);
  const isValid = Number.isFinite(number) && number > 0;
  return isValid ? number : fallback;
}



let minGetReady = safeLoad(localStorage.getItem("minGetReady"), 4000);
let maxGetReady = safeLoad(localStorage.getItem("maxGetReady"), 6000);
let minOnYourMarks = safeLoad(localStorage.getItem("minOnYourMarks"), 4000);
let maxOnYourMarks = safeLoad(localStorage.getItem("maxOnYourMarks"), 7000);
let minSet = safeLoad(localStorage.getItem("minSet"), 3000);
let maxSet = safeLoad(localStorage.getItem("maxSet"), 6000);

document.getElementById("t1").value = minGetReady;
document.getElementById("t2").value = maxGetReady;
document.getElementById("t3").value = minOnYourMarks;
document.getElementById("t4").value = maxOnYourMarks;
document.getElementById("t5").value = minSet;
document.getElementById("t6").value = maxSet;

console.log(minGetReady, maxGetReady, minOnYourMarks, maxOnYourMarks, minSet, maxSet);

const texts = ["Athletes, get ready", "On your marks", "Set"];
const sounds = ["athletes_get_ready.mp3", "on_your_marks.mp3", "set.mp3"];

const delaySettings = [
  { min: minGetReady, max: maxGetReady },
  { min: minOnYourMarks, max: maxOnYourMarks },
  { min: minSet, max: maxSet }
];

let timerInterval = null;
let startTime = 0;
let elapsed = 0;
let paused = false;

function randDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function format(ms) {
  const totalSeconds = ms / 1000;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const centis = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);

  return (
    String(hrs).padStart(2, "0") + ":" +
    String(mins).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0") + "." +
    String(centis).padStart(2, "0")
  );
}

function updateTimer() {
  if (!paused) {
    elapsed = Date.now() - startTime;
    timerDisplay.textContent = format(elapsed);
  }
}

let audioCtx;
let startShotBuffer;

async function loadStartShot() {
  if (!audioCtx) audioCtx = new AudioContext();
  const response = await fetch("pistol.mp3");
  const arrayBuffer = await response.arrayBuffer();
  startShotBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

function playsound(url) {
  const audio = new Audio(url);
  audio.play();
}

async function startSequence() {
  startBtn.disabled = true;
  document.getElementById("start-btn").style.cursor = "not-allowed";
  await loadStartShot();

  for (let i = 0; i < texts.length; i++) {

    const minDelay = delaySettings[i].min;
    const maxDelay = delaySettings[i].max;

    if (minDelay === null || maxDelay === null) {
      console.warn(`Skipping step: ${texts[i]} (invalid delay)`);
      continue;
    }

    textEl.textContent = texts[i];
    playsound(sounds[i]);

    await new Promise(r => setTimeout(r, randDelay(minDelay, maxDelay)));
  }

  const source = audioCtx.createBufferSource();
  source.buffer = startShotBuffer;
  source.connect(audioCtx.destination);
  source.start(audioCtx.currentTime);

  textEl.style.display = "none";
  timerContainer.style.display = "block";

  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 50);
}

startBtn.addEventListener("click", startSequence);

pauseBtn.addEventListener("click", () => {
  paused = !paused;

  if (paused) {
    pauseBtn.textContent = "Resume";
  } else {
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
  document.getElementById("start-btn").style.cursor = "pointer";

  pauseBtn.textContent = "Pause";
  document.getElementById("text-element").innerText = "";
});

function saveTimes() {

  function safe(val) {
    let num = Number(val);
    return (typeof num === "number" && !isNaN(num) && num >= 0) ? num : null;
  }

  localStorage.setItem("minGetReady", safe(document.getElementById("t1").value));
  localStorage.setItem("maxGetReady", safe(document.getElementById("t2").value));
  localStorage.setItem("minOnYourMarks", safe(document.getElementById("t3").value));
  localStorage.setItem("maxOnYourMarks", safe(document.getElementById("t4").value));
  localStorage.setItem("minSet", safe(document.getElementById("t5").value));
  localStorage.setItem("maxSet", safe(document.getElementById("t6").value));

  console.log("saved scores");
}
