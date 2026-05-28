const routines = {
  desk: {
    name: "Desk Reset",
    summary: "A short seated reset for desk stiffness, breath, and posture.",
    seconds: 300,
    moves: [
      {
        title: "Arrive Tall",
        text: "Sit near the front of the chair, feet grounded, hands resting lightly on your thighs."
      },
      {
        title: "Open the Chest",
        text: "Float the hands outward as you inhale, then soften them back to center as you exhale."
      },
      {
        title: "Cloud Hands",
        text: "Sweep one hand across the body while the other lowers, moving slowly from the waist."
      },
      {
        title: "Seated Wave",
        text: "Roll through the spine gently: crown rises, shoulders settle, belly softens."
      },
      {
        title: "Gather and Rest",
        text: "Circle the hands inward, pause at the lower belly, and let the breath become quiet."
      }
    ]
  },
  calm: {
    name: "Calm Flow",
    summary: "A steady ten-minute practice for breath, shoulders, and relaxed attention.",
    seconds: 600,
    moves: [
      {
        title: "Root the Feet",
        text: "Feel both feet make even contact with the floor while the crown of the head lifts."
      },
      {
        title: "Lift and Settle",
        text: "Inhale as the hands rise to rib height, exhale as the shoulders soften down."
      },
      {
        title: "Parting Clouds",
        text: "Let one hand float up and the other float down, then trade places with no rush."
      },
      {
        title: "Turn the Moon",
        text: "Rotate gently through the ribs, keeping the hips steady and the jaw relaxed."
      },
      {
        title: "Pouring Tea",
        text: "Tip the palms forward and back as if pouring from one cup into another."
      },
      {
        title: "Quiet Hands",
        text: "Rest both hands on the thighs and follow three easy breaths from start to finish."
      }
    ]
  },
  long: {
    name: "Full Chair Form",
    summary: "A fuller seated sequence for mobility, balance awareness, and a slower exhale.",
    seconds: 1200,
    moves: [
      {
        title: "Posture Check",
        text: "Sit with steady feet, soft knees, long spine, and relaxed shoulders."
      },
      {
        title: "Opening Breath",
        text: "Raise the hands on the inhale and lower them on the exhale, matching breath to motion."
      },
      {
        title: "Brush Knee",
        text: "One hand brushes diagonally across the thigh while the other floats forward."
      },
      {
        title: "Cloud Hands",
        text: "Move side to side from the waist, letting the hands pass like soft clouds."
      },
      {
        title: "Crane Spreads Wings",
        text: "Lift one hand high and one low, then return both to center with easy breath."
      },
      {
        title: "Gather Energy",
        text: "Circle the arms outward and inward, keeping elbows heavy and wrists soft."
      },
      {
        title: "Seated Push",
        text: "Press both palms forward gently, then draw them back toward the ribs."
      },
      {
        title: "Closing Stillness",
        text: "Rest the hands, soften the eyes, and let the final breaths settle."
      }
    ]
  }
};

const state = {
  routineKey: "desk",
  moveIndex: 0,
  elapsed: 0,
  playing: false,
  lastTick: null,
  breathExpanded: false
};

const sessionTime = document.querySelector("#sessionTime");
const routineName = document.querySelector("#routineName");
const routineSummary = document.querySelector("#routineSummary");
const stepCount = document.querySelector("#stepCount");
const moveTitle = document.querySelector("#moveTitle");
const moveDescription = document.querySelector("#moveDescription");
const moveProgress = document.querySelector("#moveProgress");
const moveList = document.querySelector("#moveList");
const playBtn = document.querySelector("#playBtn");
const previousBtn = document.querySelector("#previousBtn");
const nextBtn = document.querySelector("#nextBtn");
const breathOrb = document.querySelector("#breathOrb");
const breathCue = document.querySelector("#breathCue");
const tabs = Array.from(document.querySelectorAll(".tab"));

function currentRoutine() {
  return routines[state.routineKey];
}

function secondsPerMove() {
  const routine = currentRoutine();
  return routine.seconds / routine.moves.length;
}

function formatTime(seconds) {
  const remaining = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function renderMoveList() {
  const routine = currentRoutine();
  moveList.innerHTML = "";

  routine.moves.forEach((move, index) => {
    const item = document.createElement("li");
    item.className = `move-list-item${index === state.moveIndex ? " is-current" : ""}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = move.title;
    button.addEventListener("click", () => jumpToMove(index));
    item.appendChild(button);
    moveList.appendChild(item);
  });
}

function render() {
  const routine = currentRoutine();
  const move = routine.moves[state.moveIndex];
  const perMove = secondsPerMove();
  const moveElapsed = state.elapsed - state.moveIndex * perMove;
  const sessionRemaining = routine.seconds - state.elapsed;
  const progress = Math.min(100, Math.max(0, (moveElapsed / perMove) * 100));

  sessionTime.textContent = formatTime(sessionRemaining);
  routineName.textContent = routine.name;
  routineSummary.textContent = routine.summary;
  stepCount.textContent = `Step ${state.moveIndex + 1} of ${routine.moves.length}`;
  moveTitle.textContent = move.title;
  moveDescription.textContent = move.text;
  moveProgress.style.width = `${progress}%`;
  playBtn.textContent = state.playing
    ? "Pause"
    : state.elapsed >= routine.seconds
      ? "Restart"
      : state.elapsed > 0
        ? "Resume"
        : "Start";

  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.routine === state.routineKey);
  });

  renderMoveList();
}

function setRoutine(key) {
  state.routineKey = key;
  state.moveIndex = 0;
  state.elapsed = 0;
  state.playing = false;
  state.lastTick = null;
  render();
}

function jumpToMove(index) {
  state.moveIndex = index;
  state.elapsed = Math.min(currentRoutine().seconds, index * secondsPerMove());
  state.lastTick = null;
  render();
}

function nextMove() {
  const routine = currentRoutine();
  const nextIndex = Math.min(routine.moves.length - 1, state.moveIndex + 1);
  jumpToMove(nextIndex);
}

function previousMove() {
  const previousIndex = Math.max(0, state.moveIndex - 1);
  jumpToMove(previousIndex);
}

function updateBreathCue() {
  state.breathExpanded = !state.breathExpanded;
  breathOrb.classList.toggle("is-expanded", state.breathExpanded);
  breathCue.textContent = state.breathExpanded ? "Exhale" : "Inhale";
}

function tick(timestamp) {
  if (!state.playing) {
    return;
  }

  if (state.lastTick === null) {
    state.lastTick = timestamp;
  }

  const delta = (timestamp - state.lastTick) / 1000;
  state.lastTick = timestamp;
  const routine = currentRoutine();
  state.elapsed = Math.min(routine.seconds, state.elapsed + delta);
  state.moveIndex = Math.min(routine.moves.length - 1, Math.floor(state.elapsed / secondsPerMove()));

  if (state.elapsed >= routine.seconds) {
    state.playing = false;
    state.lastTick = null;
  }

  render();
  requestAnimationFrame(tick);
}

function togglePlay() {
  if (!state.playing && state.elapsed >= currentRoutine().seconds) {
    state.elapsed = 0;
    state.moveIndex = 0;
  }

  state.playing = !state.playing;
  state.lastTick = null;
  render();

  if (state.playing) {
    requestAnimationFrame(tick);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setRoutine(tab.dataset.routine));
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextMove);
previousBtn.addEventListener("click", previousMove);
setInterval(updateBreathCue, 3800);
render();
