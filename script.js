const textEl = document.getElementById('text-element');
const startBtn = document.getElementById('start-btn');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

function safeLoad(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

let minGetReady = safeLoad(localStorage.getItem("minGetReady"), 4000);
let maxGetReady = safeLoad(localStorage.getItem("maxGetReady"), 6000);
let minOnYourMarks = safeLoad(localStorage.getItem("minOnYourMarks"), 4000);
let maxOnYourMarks = safeLoad(localStorage.getItem("maxOnYourMarks"), 7000);
let minSet = safeLoad(localStorage.getItem("minSet"), 3000);
let maxSet = safeLoad(localStorage.getItem("maxSet"), 6000);

t1.value = minGetReady;
t2.value = maxGetReady;
t3.value = minOnYourMarks;
t4.value = maxOnYourMarks;
t5.value = minSet;
t6.value = maxSet;

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

let audioCtx = null;
let startShotBuffer = null;
let soundBuffers = {};

async function loadAudioFile(url) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(data);
}

function playBuffer(buffer) {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioCtx.destination);
    src.start();
}

async function startSequence() {
    startBtn.disabled = true;
    startBtn.style.cursor = "not-allowed";

    delaySettings[0].min = Number(t1.value);
    delaySettings[0].max = Number(t2.value);
    delaySettings[1].min = Number(t3.value);
    delaySettings[1].max = Number(t4.value);
    delaySettings[2].min = Number(t5.value);
    delaySettings[2].max = Number(t6.value);

    for (let i = 0; i < texts.length; i++) {
        textEl.textContent = texts[i];
        playBuffer(soundBuffers[sounds[i]]);
        const delay = randDelay(delaySettings[i].min, delaySettings[i].max);
        await new Promise(r => setTimeout(r, delay));
    }

    playBuffer(startShotBuffer);

    textEl.style.display = "none";
    timerContainer.style.display = "block";

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 50);
}

startBtn.addEventListener("click", async () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        await audioCtx.resume();
    }

    try {
        const unlock = new Audio();
        unlock.src = "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA";
        await unlock.play();
    } catch(e) {}

    if (!startShotBuffer) {
        startShotBuffer = await loadAudioFile("pistol.mp3");
    }

    for (let i = 0; i < sounds.length; i++) {
        if (!soundBuffers[sounds[i]]) {
            soundBuffers[sounds[i]] = await loadAudioFile(sounds[i]);
        }
    }

    startSequence();
});

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
    startBtn.style.cursor = "pointer";
    pauseBtn.textContent = "Pause";
    textEl.textContent = "";
});

function saveTimes() {
    function safe(val) {
        const num = Number(val);
        return Number.isFinite(num) && num >= 0 ? num : null;
    }
    localStorage.setItem("minGetReady", safe(t1.value));
    localStorage.setItem("maxGetReady", safe(t2.value));
    localStorage.setItem("minOnYourMarks", safe(t3.value));
    localStorage.setItem("maxOnYourMarks", safe(t4.value));
    localStorage.setItem("minSet", safe(t5.value));
    localStorage.setItem("maxSet", safe(t6.value));
}
