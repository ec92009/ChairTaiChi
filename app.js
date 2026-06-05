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
  breathExpanded: false,
  musicOn: false,
  voiceOn: true,
  musicVolume: 0.5,
  voiceVolume: 0.8,
  soundscapePreset: "calm",
  autoOrbit: false
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
const musicToggle = document.querySelector("#musicToggle");
const voiceToggle = document.querySelector("#voiceToggle");
const tabs = Array.from(document.querySelectorAll(".tab"));
const musicVolumeInput = document.querySelector("#musicVolume");
const voiceVolumeInput = document.querySelector("#voiceVolume");
const soundscapeSelect = document.querySelector("#soundscapeSelect");
const camFrontBtn = document.querySelector("#camFrontBtn");
const camSideBtn = document.querySelector("#camSideBtn");
const camTopBtn = document.querySelector("#camTopBtn");
const camOrbitToggle = document.querySelector("#camOrbitToggle");

// --- Web Audio API Ambient Synthesizer ---
class AmbientMusicSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.isPlaying = false;
    this.chordIndex = 0;
    this.chimeTimeout = null;
    this.chordTimeout = null;
    this.soundscapes = {
      calm: [
        [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
        [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
        [196.00, 246.94, 293.66, 440.00, 659.25], // G6/9
        [220.00, 261.63, 329.63, 392.00, 493.88]  // Am9
      ],
      forest: [
        [65.41, 98.00, 130.81, 196.00, 261.63],   // C2, G2, C3, G3, C4
        [87.31, 130.81, 174.61, 261.63, 349.23],   // F2, C3, F3, C4, F4
        [73.42, 110.00, 146.83, 220.00, 293.66],   // D2, A2, D3, A3, D4
        [98.00, 146.83, 196.00, 293.66, 392.00]    // G2, D3, G3, D4, G4
      ],
      ocean: [
        [110.00, 164.81, 220.00, 277.18, 329.63], // Amaj9
        [130.81, 196.00, 261.63, 311.13, 392.00], // Cmaj9
        [146.83, 220.00, 293.66, 369.99, 440.00], // Dmaj9
        [98.00, 146.83, 196.00, 233.08, 293.66]   // Gmaj9
      ]
    };
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.masterGain.gain.linearRampToValueAtTime((state.breathExpanded ? 0.35 : 0.22) * state.musicVolume, this.ctx.currentTime + 2.0);
    this.playNextPadChord();
    this.scheduleChime();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.5);
    }

    if (this.chordTimeout) {
      clearTimeout(this.chordTimeout);
      this.chordTimeout = null;
    }
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }

    const currentOscs = this.oscillators;
    setTimeout(() => {
      if (!this.isPlaying) {
        currentOscs.forEach(oscObj => {
          try { oscObj.osc.stop(); } catch (e) {}
        });
      }
    }, 1600);
    this.oscillators = [];
  }

  updateVolume() {
    if (!this.isPlaying || !this.masterGain) return;
    const targetVolume = (state.breathExpanded ? 0.35 : 0.22) * state.musicVolume;
    this.masterGain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
  }

  playNextPadChord() {
    if (!this.isPlaying) return;

    const prevOscs = this.oscillators;
    const fadeOutTime = 3.0;
    prevOscs.forEach(oscObj => {
      try {
        oscObj.gainNode.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + fadeOutTime);
        setTimeout(() => {
          try { oscObj.osc.stop(); } catch(e) {}
        }, fadeOutTime * 1000 + 100);
      } catch(e) {}
    });
    this.oscillators = [];

    const activeChords = this.soundscapes[state.soundscapePreset] || this.soundscapes.calm;
    const frequencies = activeChords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % activeChords.length;

    const fadeInTime = 4.0;
    frequencies.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';

      let cutoff = 800;
      if (state.soundscapePreset === 'forest') cutoff = 320;
      if (state.soundscapePreset === 'ocean') cutoff = 1100;
      filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

      gainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);

      let baseGain = 0.035;
      if (state.soundscapePreset === 'forest') baseGain = 0.045;
      if (state.soundscapePreset === 'ocean') baseGain = 0.03;
      gainNode.gain.linearRampToValueAtTime(baseGain * state.musicVolume, this.ctx.currentTime + fadeInTime);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start();
      this.oscillators.push({ osc, gainNode });
    });

    // Add low ocean surge swell if in ocean mode
    if (state.soundscapePreset === 'ocean' && this.ctx) {
      const waveOsc = this.ctx.createOscillator();
      const waveGain = this.ctx.createGain();
      waveOsc.type = 'triangle';
      waveOsc.frequency.setValueAtTime(55.0, this.ctx.currentTime); // low rumble

      const waveFilter = this.ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(90, this.ctx.currentTime);

      waveGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      waveGain.gain.linearRampToValueAtTime(0.12 * state.musicVolume, this.ctx.currentTime + 3.0);
      waveGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 9.5);

      waveOsc.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(this.masterGain);

      waveOsc.start();
      waveOsc.stop(this.ctx.currentTime + 9.7);
    }

    this.chordTimeout = setTimeout(() => {
      this.playNextPadChord();
    }, 12000);
  }

  scheduleChime() {
    if (!this.isPlaying) return;

    const delay = 4000 + Math.random() * 6000;
    this.chimeTimeout = setTimeout(() => {
      this.playChime();
      this.scheduleChime();
    }, delay);
  }

  playChime() {
    if (!this.isPlaying || !this.ctx) return;

    let chimeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    if (state.soundscapePreset === 'forest') {
      chimeFreqs = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    } else if (state.soundscapePreset === 'ocean') {
      chimeFreqs = [659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    }
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = state.soundscapePreset === 'forest' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);

    let peakVol = 0.015 * state.musicVolume;
    let decayTime = state.soundscapePreset === 'forest' ? 1.5 : 3.0;

    gainNode.gain.linearRampToValueAtTime(peakVol, this.ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decayTime);

    const delayNode = this.ctx.createDelay();

    let delayVal = 0.4;
    let feedbackVal = 0.4;
    if (state.soundscapePreset === 'ocean') {
      delayVal = 0.7;
      feedbackVal = 0.55;
    } else if (state.soundscapePreset === 'forest') {
      delayVal = 0.25;
      feedbackVal = 0.25;
    }

    delayNode.delayTime.value = delayVal;
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = feedbackVal;

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    gainNode.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(delayNode);
    delayGain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + decayTime + 0.2);
  }

  setBreathingIntensity(isExpanded) {
    if (!this.isPlaying || !this.masterGain) return;
    const targetVolume = (isExpanded ? 0.35 : 0.22) * state.musicVolume;
    this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 3.8);
  }
}

const ambientSynth = new AmbientMusicSynth();

// --- Web Speech API Voice Guide ---
const VoiceGuide = {
  speak(title, text) {
    if (!state.voiceOn) return;
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(`${title}. ${text}`);
    msg.rate = 0.85;
    msg.pitch = 1.0;
    msg.volume = state.voiceVolume; // Apply the slider voice volume

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                          voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                          voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      msg.voice = englishVoice;
    }
    window.speechSynthesis.speak(msg);
  },

  cancel() {
    window.speechSynthesis.cancel();
  }
};

// Warm up Speech Synthesis voices
window.speechSynthesis.getVoices();

// --- Tesla Bot (3D Optimus-like) Drawing Helper Functions ---
function draw3DLimb(ctx, x1, y1, x2, y2, width, isBackground, dynamicZoom) {
  ctx.save();
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const w = width * dynamicZoom;

  const baseColor = isBackground ? "#e2e8f0" : "#ffffff";
  const shadowColor = isBackground ? "#cbd5e1" : "#cbd5e0";
  const edgeColor = isBackground ? "#94a3b8" : "#94a3b8";
  const specColor = isBackground ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.9)";
  const outlineColor = "#1e293b";

  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = w + 2 * dynamicZoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const px = -dy / len;
  const py = dx / len;

  const grad = ctx.createLinearGradient(
    (x1 + x2)/2 - px * w/2, (y1 + y2)/2 - py * w/2,
    (x1 + x2)/2 + px * w/2, (y1 + y2)/2 + py * w/2
  );
  grad.addColorStop(0, shadowColor);
  grad.addColorStop(0.25, baseColor);
  grad.addColorStop(0.65, "#ffffff");
  grad.addColorStop(1, edgeColor);

  ctx.strokeStyle = grad;
  ctx.lineWidth = w;
  ctx.stroke();

  ctx.strokeStyle = specColor;
  ctx.lineWidth = w * 0.16;
  ctx.beginPath();
  ctx.moveTo(x1 - px * w * 0.18, y1 - py * w * 0.18);
  ctx.lineTo(x2 - px * w * 0.18, y2 - py * w * 0.18);
  ctx.stroke();

  ctx.restore();
}

function drawTeslaJoint(ctx, x, y, radius, isBackground, dynamicZoom) {
  ctx.save();
  const r = radius * dynamicZoom;
  const cx = x - r * 0.25;
  const cy = y - r * 0.25;
  const grad = ctx.createRadialGradient(cx, cy, 1, x, y, r);

  if (isBackground) {
    grad.addColorStop(0, "#475569");
    grad.addColorStop(0.7, "#334155");
    grad.addColorStop(1, "#1e293b");
  } else {
    grad.addColorStop(0, "#64748b");
    grad.addColorStop(0.6, "#334155");
    grad.addColorStop(1, "#0f172a");
  }

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1 * dynamicZoom;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isBackground ? "#cbd5e1" : "#f1f5f9";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.35, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore();
}

function drawTeslaHead3D(ctx, headX, headY, headZ, headRadius, shCenterX, shCenterY, shCenterZ, dynamicZoom, px, py, pz) {
  const headP = project3D(headX, headY, headZ);

  // Use the chest forward vector (defaulting to +Z if undefined)
  const forwardX = px !== undefined ? px : 0;
  const forwardY = py !== undefined ? py : 0;
  const forwardZ = pz !== undefined ? pz : 1;

  // Offset the visor along the chest's forward direction in 3D
  const visor3DX = headX + forwardX * headRadius * 0.55;
  const visor3DY = headY + forwardY * headRadius * 0.55;
  const visor3DZ = headZ + forwardZ * headRadius * 0.55;
  const visorP = project3D(visor3DX, visor3DY, visor3DZ);

  ctx.save();

  // 1. Draw Neck (metallic cylinder structure connecting torso to head base)
  const neckBaseP = project3D(shCenterX, shCenterY, shCenterZ);
  const neckTopP = project3D(headX, headY + headRadius * 0.85, headZ);
  draw3DLimb(ctx, neckBaseP.x, neckBaseP.y, neckTopP.x, neckTopP.y, 4.8, false, dynamicZoom);

  // 2. Draw Back Helmet Shell
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 6 * dynamicZoom;
  ctx.shadowOffsetY = 2 * dynamicZoom;

  const r = headRadius * dynamicZoom;
  const sphereGrad = ctx.createRadialGradient(
    headP.x - r * 0.3, headP.y - r * 0.3, r * 0.1,
    headP.x, headP.y, r
  );
  sphereGrad.addColorStop(0, "#ffffff");
  sphereGrad.addColorStop(0.75, "#e2e8f0");
  sphereGrad.addColorStop(1, "#94a3b8");

  ctx.fillStyle = sphereGrad;
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.2 * dynamicZoom;
  ctx.beginPath();
  ctx.arc(headP.x, headP.y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. Draw Visor (if facing the camera)
  if (visorP.depth < headP.depth) {
    ctx.save();

    // Clip visor to head sphere bounds so it wraps smoothly and never overflows
    ctx.beginPath();
    ctx.arc(headP.x, headP.y, r - 0.5 * dynamicZoom, 0, 2 * Math.PI);
    ctx.clip();

    const rx = r * 0.85;
    const ry = r * 0.65;

    const visorGrad = ctx.createLinearGradient(
      visorP.x - rx * 0.3, visorP.y - ry * 0.9,
      visorP.x + rx * 0.5, visorP.y + ry * 0.5
    );
    visorGrad.addColorStop(0, "#334155");
    visorGrad.addColorStop(0.4, "#1e293b");
    visorGrad.addColorStop(1, "#020617");

    ctx.fillStyle = visorGrad;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5 * dynamicZoom;

    ctx.beginPath();
    ctx.ellipse(visorP.x, visorP.y, rx, ry, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Visor highlight reflection
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.8 * dynamicZoom;
    ctx.beginPath();
    ctx.ellipse(visorP.x, visorP.y - ry * 0.1, rx * 0.8, ry * 0.8, 0, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Specular dot
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(visorP.x + rx * 0.35, visorP.y - ry * 0.35, 1.8 * dynamicZoom, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

function drawTeslaTorso(ctx, shX, shY, shZ, lShX, lShY, lShZ, rShX, rShY, rShZ, pelvisX, pelvisY, pelvisZ, breathVal, dynamicZoom) {
  ctx.save();

  // Project center points
  const shCenterP = project3D(shX, shY, shZ);
  const pelvisP = project3D(pelvisX, pelvisY, pelvisZ);

  // 1. Black Spine backbone linkage
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 10 * dynamicZoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shCenterP.x, shCenterP.y);
  ctx.lineTo(pelvisP.x, pelvisP.y);
  ctx.stroke();

  // Lower waist pivot
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc((shCenterP.x + pelvisP.x * 2)/3, (shCenterP.y + pelvisP.y * 2)/3, 7.5 * dynamicZoom, 0, 2 * Math.PI);
  ctx.fill();

  // Compute shoulder direction vector in 3D (U axis)
  const dx = rShX - lShX;
  const dy = rShY - lShY;
  const dz = rShZ - lShZ;
  const lenU = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const ux = dx / lenU;
  const uy = dy / lenU;
  const uz = dz / lenU;

  // Vector from shoulder center to pelvis (S vector)
  const shCenterX = (lShX + rShX) / 2;
  const shCenterY = (lShY + rShY) / 2;
  const shCenterZ = (lShZ + rShZ) / 2;
  const sx = pelvisX - shCenterX;
  const sy = pelvisY - shCenterY;
  const sz = pelvisZ - shCenterZ;

  // Compute forward vector pointing out of chest (P = U x S)
  let px = uy * sz - uz * sy;
  let py = uz * sx - ux * sz;
  let pz = ux * sy - uy * sx;
  const lenP = Math.sqrt(px * px + py * py + pz * pz) || 1;
  px /= lenP;
  py /= lenP;
  pz /= lenP;

  // Compute orthogonal down vector (V = P x U)
  const vx = py * uz - pz * uy;
  const vy = pz * ux - px * uz;
  const vz = px * uy - py * ux;

  // Define chest height based on spine length
  const spineLen = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
  const chestHeight = spineLen * 0.65;

  // Torso top and bottom centers
  const topCenter = { x: shCenterX, y: shCenterY, z: shCenterZ };
  const botCenter = {
    x: shCenterX + vx * chestHeight,
    y: shCenterY + vy * chestHeight,
    z: shCenterZ + vz * chestHeight
  };

  // 3D torso dimensions (expanding dynamically with breathVal for physical breathing effect)
  const wTop = 13 + breathVal * 1.5;
  const wBot = 8.5 + breathVal * 0.5;
  const dFront = 5.5 + breathVal * 1.0;
  const dBack = 4.5;

  // Compute 8 vertices of the 3D tapered torso box
  const TLF = { x: topCenter.x - ux * wTop + px * dFront, y: topCenter.y - uy * wTop + py * dFront, z: topCenter.z - uz * wTop + pz * dFront };
  const TRF = { x: topCenter.x + ux * wTop + px * dFront, y: topCenter.y + uy * wTop + py * dFront, z: topCenter.z + uz * wTop + pz * dFront };
  const BRF = { x: botCenter.x + ux * wBot + px * dFront, y: botCenter.y + uy * wBot + py * dFront, z: botCenter.z + uz * wBot + pz * dFront };
  const BLF = { x: botCenter.x - ux * wBot + px * dFront, y: botCenter.y - uy * wBot + py * dFront, z: botCenter.z - uz * wBot + pz * dFront };

  const TLB = { x: topCenter.x - ux * wTop - px * dBack, y: topCenter.y - uy * wTop - py * dBack, z: topCenter.z - uz * wTop - pz * dBack };
  const TRB = { x: topCenter.x + ux * wTop - px * dBack, y: topCenter.y + uy * wTop - py * dBack, z: topCenter.z + uz * wTop - pz * dBack };
  const BRB = { x: botCenter.x + ux * wBot - px * dBack, y: botCenter.y + uy * wBot - py * dBack, z: botCenter.z + uz * wBot - pz * dBack };
  const BLB = { x: botCenter.x - ux * wBot - px * dBack, y: botCenter.y - uy * wBot - py * dBack, z: botCenter.z - uz * wBot - pz * dBack };

  // Project all 8 vertices to 2D screen coordinates
  const pTLF = project3D(TLF.x, TLF.y, TLF.z);
  const pTRF = project3D(TRF.x, TRF.y, TRF.z);
  const pBRF = project3D(BRF.x, BRF.y, BRF.z);
  const pBLF = project3D(BLF.x, BLF.y, BLF.z);

  const pTLB = project3D(TLB.x, TLB.y, TLB.z);
  const pTRB = project3D(TRB.x, TRB.y, TRB.z);
  const pBRB = project3D(BRB.x, BRB.y, BRB.z);
  const pBLB = project3D(BLB.x, BLB.y, BLB.z);

  // Gradient helper
  function getGrad(pA, pB, col1, col2) {
    const grad = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    return grad;
  }

  // Draw polygon face helper
  function drawFace(p1, p2, p3, p4, fill, strokeColor = "#1e293b") {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2 * dynamicZoom;
    ctx.stroke();
  }

  // Define 6 faces with their computed Z-depths and individual drawing routines
  const faces = [
    {
      name: "front",
      depth: (pTLF.depth + pTRF.depth + pBRF.depth + pBLF.depth) / 4,
      draw: () => {
        const fill = getGrad(pTLF, pBRF, "#ffffff", "#cbd5e1");
        drawFace(pTLF, pTRF, pBRF, pBLF, fill);

        // Specular highlight line along the left-front edge
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5 * dynamicZoom;
        ctx.beginPath();
        ctx.moveTo(pTLF.x + (pTRF.x - pTLF.x) * 0.15, pTLF.y + (pBLF.y - pTLF.y) * 0.15);
        ctx.lineTo(pBLF.x + (pBRF.x - pBLF.x) * 0.15, pBLF.y - (pBLF.y - pTLF.y) * 0.15);
        ctx.stroke();

        // Pulsating cyan core indicator
        const core3D = {
          x: (TLF.x + TRF.x + BRF.x + BLF.x)/4,
          y: (TLF.y + TRF.y + BRF.y + BLF.y)/4,
          z: (TLF.z + TRF.z + BRF.z + BLF.z)/4
        };
        const coreP = project3D(core3D.x, core3D.y, core3D.z);
        ctx.save();
        ctx.fillStyle = "rgba(0, 240, 255, 0.85)";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = (5 + breathVal * 6) * dynamicZoom;
        ctx.beginPath();
        ctx.arc(coreP.x, coreP.y, (3.5 + breathVal * 1.2) * dynamicZoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    },
    {
      name: "back",
      depth: (pTRB.depth + pTLB.depth + pBLB.depth + pBRB.depth) / 4,
      draw: () => {
        const fill = getGrad(pTRB, pBLB, "#e2e8f0", "#94a3b8");
        drawFace(pTRB, pTLB, pBLB, pBRB, fill);

        // Charging port slot on the back plate
        const port3D = {
          x: (TLB.x + TRB.x + BRB.x + BLB.x)/4,
          y: (TLB.y + TRB.y + BRB.y + BLB.y)/4,
          z: (TLB.z + TRB.z + BRB.z + BLB.z)/4
        };
        const portP = project3D(port3D.x, port3D.y, port3D.z);
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.ellipse(portP.x, portP.y, 4 * dynamicZoom, 1.5 * dynamicZoom, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    {
      name: "left",
      depth: (pTLB.depth + pTLF.depth + pBLF.depth + pBLB.depth) / 4,
      draw: () => {
        const fill = getGrad(pTLB, pBLF, "#475569", "#1e293b");
        drawFace(pTLB, pTLF, pBLF, pBLB, fill);

        // Vertical panel crease line
        const midTop = { x: (pTLB.x + pTLF.x)/2, y: (pTLB.y + pTLF.y)/2 };
        const midBot = { x: (pBLB.x + pBLF.x)/2, y: (pBLB.y + pBLF.y)/2 };
        ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
        ctx.lineWidth = 1 * dynamicZoom;
        ctx.beginPath();
        ctx.moveTo(midTop.x, midTop.y);
        ctx.lineTo(midBot.x, midBot.y);
        ctx.stroke();
      }
    },
    {
      name: "right",
      depth: (pTRF.depth + pTRB.depth + pBRB.depth + pBRF.depth) / 4,
      draw: () => {
        const fill = getGrad(pTRF, pBRB, "#475569", "#1e293b");
        drawFace(pTRF, pTRB, pBRB, pBRF, fill);

        // Vertical panel crease line
        const midTop = { x: (pTRF.x + pTRB.x)/2, y: (pTRF.y + pTRB.y)/2 };
        const midBot = { x: (pBRF.x + pBRB.x)/2, y: (pBRF.y + pBRB.y)/2 };
        ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
        ctx.lineWidth = 1 * dynamicZoom;
        ctx.beginPath();
        ctx.moveTo(midTop.x, midTop.y);
        ctx.lineTo(midBot.x, midBot.y);
        ctx.stroke();
      }
    },
    {
      name: "top",
      depth: (pTLB.depth + pTRB.depth + pTRF.depth + pTLF.depth) / 4,
      draw: () => {
        const fill = getGrad(pTLB, pTRF, "#cbd5e1", "#64748b");
        drawFace(pTLB, pTRB, pTRF, pTLF, fill);
      }
    },
    {
      name: "bottom",
      depth: (pBLF.depth + pBRF.depth + pBRB.depth + pBLB.depth) / 4,
      draw: () => {
        const fill = getGrad(pBLF, pBRB, "#1e293b", "#0f172a");
        drawFace(pBLF, pBRF, pBRB, pBLB, fill);
      }
    }
  ];

  // Draw faces back-to-front (Painters Algorithm)
  faces.sort((a, b) => b.depth - a.depth);
  faces.forEach(face => face.draw());

  ctx.restore();
}

function drawTeslaHand(ctx, x, y, isBackground, dynamicZoom) {
  ctx.save();
  ctx.fillStyle = isBackground ? "#334155" : "#1e293b";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1 * dynamicZoom;
  ctx.beginPath();
  ctx.arc(x, y, 4 * dynamicZoom, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = isBackground ? "#334155" : "#1e293b";
  ctx.lineWidth = 1.8 * dynamicZoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 5 * dynamicZoom, y - 2 * dynamicZoom);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 5 * dynamicZoom, y + 2 * dynamicZoom);
  ctx.stroke();

  ctx.restore();
}

function drawTeslaFoot(ctx, x, y, dynamicZoom) {
  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.2 * dynamicZoom;
  ctx.beginPath();
  ctx.moveTo(x - 5 * dynamicZoom, y);
  ctx.lineTo(x + 10 * dynamicZoom, y);
  ctx.lineTo(x + 8 * dynamicZoom, y - 4 * dynamicZoom);
  ctx.lineTo(x - 3 * dynamicZoom, y - 4 * dynamicZoom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// --- Camera & 3D Projection Configuration ---
const cameraDefaults = {
  yaw: Math.PI - 0.45,
  pitch: 0.15,
  zoom: 2.1,
  panX: 0,
  panY: 8
};

const camera = { ...cameraDefaults };

function project3D(x, y, z) {
  // Rotate around Y axis (Yaw)
  const cosY = Math.cos(camera.yaw);
  const sinY = Math.sin(camera.yaw);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;

  // Rotate around X axis (Pitch)
  const cosX = Math.cos(camera.pitch);
  const sinX = Math.sin(camera.pitch);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  const canvas = document.getElementById("animationCanvas");
  const cx = canvas ? canvas.width / 2 : 120;
  const cy = canvas ? canvas.height / 2 : 120;

  // Scale zoom factor dynamically based on canvas height (home height was 240)
  const baseHeight = 240;
  const scaleFactor = canvas ? (canvas.height / baseHeight) : 1;
  const dynamicZoom = camera.zoom * scaleFactor;

  return {
    x: cx + (x1 + camera.panX) * dynamicZoom,
    y: cy + (y2 + camera.panY) * dynamicZoom,
    depth: z2
  };
}

// --- Robot Canvas Animation Engine ---
function drawScene(timestamp) {
  const canvas = document.getElementById("animationCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Resize drawing buffer to match layout display size
  const rect = canvas.getBoundingClientRect();
  const targetWidth = Math.floor(rect.width);
  const targetHeight = Math.floor(rect.height);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const t = timestamp ? timestamp / 1000 : Date.now() / 1000;

  // Auto-orbit camera angle adjustment
  if (state.autoOrbit && !isDragging && !isTouchDragging) {
    camera.yaw += 0.0035;
  }

  // Smooth breathing oscillation (7.6 second cycle)
  const breathPhase = (t * 2 * Math.PI) / 7.6;
  const breathVal = (Math.sin(breathPhase) + 1) / 2; // 0 to 1

  // Draw pulsating breathing ring (scale with height)
  const cx = width / 2;
  const cy = height / 2 - 10;
  const scale = height / 240;
  const dynamicZoom = camera.zoom * scale;
  const minRadius = 75 * scale;
  const maxRadius = 92 * scale;
  const radius = minRadius + breathVal * (maxRadius - minRadius);

  ctx.save();
  ctx.strokeStyle = "rgba(110, 143, 121, 0.25)";
  ctx.lineWidth = 6 * scale;
  ctx.shadowColor = "rgba(110, 143, 121, 0.4)";
  ctx.shadowBlur = 10 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // Define 3D coordinates relative to pelvis center at (0, 35, 0)
  const pelvisX = 0, pelvisY = 35, pelvisZ = 0;
  const lHipX = -7, lHipY = 35, lHipZ = 0;
  const rHipX = 7, rHipY = 35, rHipZ = 0;

  // Legs in sitting position (Thighs forward along +Z, calves down along +Y)
  const lKneeX = -8, lKneeY = 35, lKneeZ = 28;
  const rKneeX = 8, rKneeY = 35, rKneeZ = 28;
  const lAnkleX = -8, lAnkleY = 75, lAnkleZ = 28;
  const rAnkleX = 8, rAnkleY = 75, rAnkleZ = 28;

  // Shoulders and Spine
  let shCenterX = 0, shCenterY = -12, shCenterZ = 0;
  let lShoulderX = -13, lShoulderY = -12, lShoulderZ = 0;
  let rShoulderX = 13, rShoulderY = -12, rShoulderZ = 0;

  // Head
  let headX = 0, headY = -36, headZ = 0;

  // Arms
  let lElbowX = -15, lElbowY = 12, lElbowZ = 10;
  let lHandX = -10, lHandY = 32, lHandZ = 20;

  let rElbowX = 15, rElbowY = 12, rElbowZ = 10;
  let rHandX = 10, rHandY = 32, rHandZ = 20;

  const routine = currentRoutine();
  const currentMove = routine && routine.moves[state.moveIndex] ? routine.moves[state.moveIndex].title : "";
  const animTime = state.playing ? t : t * 0.5; // slow down if paused

  if (currentMove === "Arrive Tall" || currentMove === "Posture Check" || currentMove === "Quiet Hands" || currentMove === "Closing Stillness") {
    const stretch = breathVal * 3;
    shCenterY -= stretch;
    lShoulderY -= stretch;
    rShoulderY -= stretch;
    headY -= stretch * 1.3;

    lElbowX = -14; lElbowY = 10 - stretch; lElbowZ = 8;
    lHandX = -9; lHandY = 32; lHandZ = 20;
    rElbowX = 14; rElbowY = 10 - stretch; rElbowZ = 8;
    rHandX = 9; rHandY = 32; rHandZ = 20;

  } else if (currentMove === "Open the Chest" || currentMove === "Opening Breath" || currentMove === "Lift and Settle") {
    const stretch = breathVal * 2;
    shCenterY -= stretch;
    lShoulderY -= stretch;
    rShoulderY -= stretch;
    headY -= stretch * 1.2;

    const wide = breathVal * 26;
    const rise = breathVal * 12;
    const fwd = breathVal * 5;

    lElbowX = -15 - wide * 0.4; lElbowY = 12 - rise * 0.5; lElbowZ = 6 + fwd;
    lHandX = -10 - wide; lHandY = 22 - rise; lHandZ = 16 + fwd * 2;

    rElbowX = 15 + wide * 0.4; rElbowY = 12 - rise * 0.5; rElbowZ = 6 + fwd;
    rHandX = 10 + wide; rHandY = 22 - rise; rHandZ = 16 + fwd * 2;

  } else if (currentMove === "Cloud Hands") {
    const cycle = (animTime * 1.5) % (2 * Math.PI);
    const wave = Math.sin(cycle);
    const cosWave = Math.cos(cycle);

    shCenterX += wave * 3;
    headX += wave * 4;

    lElbowX = -12 + wave * 8; lElbowY = 4 + cosWave * 6; lElbowZ = 14 + wave * 4;
    lHandX = -6 + wave * 18; lHandY = 8 + cosWave * 12; lHandZ = 22 + wave * 8;

    rElbowX = 12 + wave * 8; rElbowY = 8 - cosWave * 6; rElbowZ = 14 + wave * 4;
    rHandX = 6 + wave * 18; rHandY = 12 - cosWave * 12; rHandZ = 22 + wave * 8;

  } else if (currentMove === "Seated Wave") {
    const waveProgress = (Math.sin((animTime * Math.PI * 2) / 8) + 1) / 2;

    shCenterX += waveProgress * 2;
    shCenterY += waveProgress * 14;
    shCenterZ += waveProgress * 15;

    lShoulderX += waveProgress * 2; lShoulderY += waveProgress * 14; lShoulderZ += waveProgress * 15;
    rShoulderX += waveProgress * 2; rShoulderY += waveProgress * 14; rShoulderZ += waveProgress * 15;

    headX += waveProgress * 3;
    headY += waveProgress * 20;
    headZ += waveProgress * 22;

    lElbowX = -14; lElbowY = 15 + waveProgress * 10; lElbowZ = 10 + waveProgress * 12;
    lHandX = -8; lHandY = 32 + waveProgress * 4; lHandZ = 20 + waveProgress * 12;

    rElbowX = 14; rElbowY = 15 + waveProgress * 10; rElbowZ = 10 + waveProgress * 12;
    rHandX = 8; rHandY = 32 + waveProgress * 4; rHandZ = 20 + waveProgress * 12;

  } else if (currentMove === "Gather and Rest" || currentMove === "Gather Energy") {
    const circleVal = (animTime * Math.PI * 2 / 6) % (2 * Math.PI);
    const cosVal = Math.cos(circleVal);
    const sinVal = Math.sin(circleVal);

    lElbowX = -13 - Math.abs(sinVal) * 12;
    lElbowY = 8 - sinVal * 18;
    lElbowZ = 8 + cosVal * 4;

    lHandX = -6 - Math.abs(sinVal) * 20;
    lHandY = 24 - sinVal * 34;
    lHandZ = 14 + cosVal * 8;

    rElbowX = 13 + Math.abs(sinVal) * 12;
    rElbowY = 8 - sinVal * 18;
    rElbowZ = 8 + cosVal * 4;

    rHandX = 6 + Math.abs(sinVal) * 20;
    rHandY = 24 - sinVal * 34;
    rHandZ = 14 + cosVal * 8;

  } else if (currentMove === "Root the Feet") {
    const stretch = breathVal * 2;
    shCenterY -= stretch;
    lShoulderY -= stretch;
    rShoulderY -= stretch;
    headY -= stretch * 1.2;

    // Hands resting flat on the thighs (near the knees)
    lElbowX = -13; lElbowY = 16 - stretch; lElbowZ = 12;
    lHandX = -8; lHandY = 35; lHandZ = 24;

    rElbowX = 13; rElbowY = 16 - stretch; rElbowZ = 12;
    rHandX = 8; rHandY = 35; rHandZ = 24;

  } else if (currentMove === "Parting Clouds") {
    const wave = Math.sin(animTime * 1.2);
    const cosWave = Math.cos(animTime * 1.2);
    const expansion = (wave + 1) / 2; // 0 to 1

    shCenterY -= expansion * 2;
    lShoulderY -= expansion * 2;
    rShoulderY -= expansion * 2;
    headY -= expansion * 2.4;

    // Left arm sweeps wide left and up
    lElbowX = -13 - expansion * 10;
    lElbowY = 12 - expansion * 12;
    lElbowZ = 8 + cosWave * 6;

    lHandX = -6 - expansion * 22;
    lHandY = 24 - expansion * 26;
    lHandZ = 16 + wave * 10;

    // Right arm sweeps wide right and up
    rElbowX = 13 + expansion * 10;
    rElbowY = 12 - expansion * 12;
    rElbowZ = 8 + cosWave * 6;

    rHandX = 6 + expansion * 22;
    rHandY = 24 - expansion * 26;
    rHandZ = 16 + wave * 10;

  } else if (currentMove === "Crane Spreads Wings") {
    const cycle = Math.sin(animTime * 1.0);
    const twist = cycle * 0.25;
    const cosT = Math.cos(twist);
    const sinT = Math.sin(twist);

    lShoulderX = -13 * cosT; lShoulderZ = -13 * sinT;
    rShoulderX = 13 * cosT; rShoulderZ = 13 * sinT;
    headX = 3 * sinT; headZ = 3 * cosT - 3;

    const lSpeed = cycle;
    const rSpeed = -cycle;

    lElbowX = -14 * cosT;
    lElbowY = 12 - lSpeed * 15;
    lElbowZ = 8 + lSpeed * 6 - 13 * sinT;

    lHandX = -8 * cosT;
    lHandY = 22 - lSpeed * 32;
    lHandZ = 16 + lSpeed * 12 - 13 * sinT;

    rElbowX = 14 * cosT;
    rElbowY = 12 - rSpeed * 15;
    rElbowZ = 8 + rSpeed * 6 + 13 * sinT;

    rHandX = 8 * cosT;
    rHandY = 22 - rSpeed * 32;
    rHandZ = 16 + rSpeed * 12 + 13 * sinT;

  } else if (currentMove === "Turn the Moon") {
    const twist = Math.sin(animTime * 1.0);
    const angle = twist * 0.5;
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);

    lShoulderX = -13 * cosT; lShoulderZ = -13 * sinT;
    rShoulderX = 13 * cosT; rShoulderZ = 13 * sinT;
    headX = 5 * sinT; headZ = 5 * cosT - 5;

    lElbowX = -10 * cosT; lElbowY = 18; lElbowZ = 16 - 8 * sinT;
    lHandX = -3 * cosT; lHandY = 12; lHandZ = 22 - 12 * sinT;

    rElbowX = 10 * cosT; rElbowY = 24; rElbowZ = 16 + 8 * sinT;
    rHandX = 3 * cosT; rHandY = 28; rHandZ = 22 + 12 * sinT;

  } else if (currentMove === "Pouring Tea") {
    const cycle = Math.sin(animTime * 1.1);
    const tilt = cycle * 0.15; // side tilt

    const cosT = Math.cos(tilt * 0.5);
    const sinT = Math.sin(tilt * 0.5);

    lShoulderX = -13 * cosT; lShoulderY = -12 + tilt * 8; lShoulderZ = -13 * sinT;
    rShoulderX = 13 * cosT; rShoulderY = -12 - tilt * 8; rShoulderZ = 13 * sinT;
    shCenterY = -12 + tilt * 4;
    headX = tilt * 6; headY = -36 + Math.abs(tilt) * 3;

    const action = (Math.sin(animTime * 1.5) + 1) / 2; // 0 to 1 pouring gesture

    // Left holds a low cup
    lElbowX = -12 * cosT; lElbowY = 18 + tilt * 4; lElbowZ = 14;
    lHandX = -4 * cosT; lHandY = 26; lHandZ = 20;

    // Right hand tilts and extends to pour
    rElbowX = 10 * cosT; rElbowY = 8 - tilt * 4 - action * 4; rElbowZ = 16;
    rHandX = 2 * cosT; rHandY = 12 - action * 12; rHandZ = 24 + action * 6;

  } else if (currentMove === "Brush Knee") {
    const cycle = Math.sin(animTime * 1.2);
    const twist = cycle * 0.45;
    const cosT = Math.cos(twist);
    const sinT = Math.sin(twist);

    lShoulderX = -13 * cosT; lShoulderZ = -13 * sinT;
    rShoulderX = 13 * cosT; rShoulderZ = 13 * sinT;
    headX = 4 * sinT; headZ = 4 * cosT - 4;

    if (cycle >= 0) {
      // Left hand brushes knee
      lElbowX = -10 * cosT; lElbowY = 26; lElbowZ = 16 - 13 * sinT;
      lHandX = -2 * cosT; lHandY = 32; lHandZ = 24 - 13 * sinT;

      // Right hand pushes forward
      rElbowX = 10 * cosT; rElbowY = 14; rElbowZ = 12 + cycle * 12 + 13 * sinT;
      rHandX = 6 * cosT; rHandY = 12; rHandZ = 20 + cycle * 24 + 13 * sinT;
    } else {
      // Right hand brushes knee
      rElbowX = 10 * cosT; rElbowY = 26; rElbowZ = 16 + 13 * sinT;
      rHandX = 2 * cosT; rHandY = 32; rHandZ = 24 + 13 * sinT;

      // Left hand pushes forward
      lElbowX = -10 * cosT; lElbowY = 14; lElbowZ = 12 - cycle * 12 - 13 * sinT;
      lHandX = -6 * cosT; lHandY = 12; lHandZ = 20 - cycle * 24 - 13 * sinT;
    }

  } else if (currentMove === "Seated Push") {
    const push = breathVal;

    lElbowX = -12; lElbowY = 14; lElbowZ = 8 + push * 12;
    lHandX = -8; lHandY = 14; lHandZ = 18 + push * 24;

    rElbowX = 12; rElbowY = 14; rElbowZ = 8 + push * 12;
    rHandX = 8; rHandY = 14; rHandZ = 18 + push * 24;
  }

  // 3D projections
  const pelvisP = project3D(pelvisX, pelvisY, pelvisZ);
  const lHipP = project3D(lHipX, lHipY, lHipZ);
  const rHipP = project3D(rHipX, rHipY, rHipZ);

  const lKneeP = project3D(lKneeX, lKneeY, lKneeZ);
  const rKneeP = project3D(rKneeX, rKneeY, rKneeZ);

  const lAnkleP = project3D(lAnkleX, lAnkleY, lAnkleZ);
  const rAnkleP = project3D(rAnkleX, rAnkleY, rAnkleZ);

  const shCenterP = project3D(shCenterX, shCenterY, shCenterZ);
  const lShoulderP = project3D(lShoulderX, lShoulderY, lShoulderZ);
  const rShoulderP = project3D(rShoulderX, rShoulderY, rShoulderZ);

  const headP = project3D(headX, headY, headZ);

  const lElbowP = project3D(lElbowX, lElbowY, lElbowZ);
  const lHandP = project3D(lHandX, lHandY, lHandZ);

  const rElbowP = project3D(rElbowX, rElbowY, rElbowZ);
  const rHandP = project3D(rHandX, rHandY, rHandZ);

  // 3D chair projection
  const chairFrontLP = project3D(-16, 36, 16);
  const chairFrontRP = project3D(16, 36, 16);
  const chairBackLP = project3D(-16, 36, -16);
  const chairBackRP = project3D(16, 36, -16);

  const chairTopLP = project3D(-16, -12, -16);
  const chairTopRP = project3D(16, -12, -16);

  const chairLegFrontLP = project3D(-16, 75, 16);
  const chairLegFrontRP = project3D(16, 75, 16);
  const chairLegBackLP = project3D(-16, 75, -16);
  const chairLegBackRP = project3D(16, 75, -16);

  // Draw Chair first
  ctx.strokeStyle = "rgba(31, 39, 35, 0.16)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(chairBackLP.x, chairBackLP.y);
  ctx.lineTo(chairBackRP.x, chairBackRP.y);
  ctx.lineTo(chairFrontRP.x, chairFrontRP.y);
  ctx.lineTo(chairFrontLP.x, chairFrontLP.y);
  ctx.closePath();

  ctx.moveTo(chairBackLP.x, chairBackLP.y);
  ctx.lineTo(chairTopLP.x, chairTopLP.y);
  ctx.lineTo(chairTopRP.x, chairTopRP.y);
  ctx.lineTo(chairBackRP.x, chairBackRP.y);

  ctx.moveTo(chairFrontLP.x, chairFrontLP.y);
  ctx.lineTo(chairLegFrontLP.x, chairLegFrontLP.y);
  ctx.moveTo(chairFrontRP.x, chairFrontRP.y);
  ctx.lineTo(chairLegFrontRP.x, chairLegFrontRP.y);
  ctx.moveTo(chairBackLP.x, chairBackLP.y);
  ctx.lineTo(chairLegBackLP.x, chairLegBackLP.y);
  ctx.moveTo(chairBackRP.x, chairBackRP.y);
  ctx.lineTo(chairLegBackRP.x, chairLegBackRP.y);
  ctx.stroke();

  // Calculate chest forward vector for head rotation
  const dxSh = rShoulderX - lShoulderX;
  const dySh = rShoulderY - lShoulderY;
  const dzSh = rShoulderZ - lShoulderZ;
  const lenUSh = Math.sqrt(dxSh*dxSh + dySh*dySh + dzSh*dzSh) || 1;
  const uxSh = dxSh / lenUSh;
  const uySh = dySh / lenUSh;
  const uzSh = dzSh / lenUSh;

  const sxSp = pelvisX - shCenterX;
  const sySp = pelvisY - shCenterY;
  const szSp = pelvisZ - shCenterZ;

  let px = uySh * szSp - uzSh * sySp;
  let py = uzSh * sxSp - uxSh * szSp;
  let pz = uxSh * sySp - uySh * sxSp;
  const lenP = Math.sqrt(px*px + py*py + pz*pz) || 1;
  px /= lenP;
  py /= lenP;
  pz /= lenP;

  // Depth-sorting draw list (Painters algorithm for realistic overlaps)
  const drawList = [
    {
      depth: (lShoulderP.depth + lElbowP.depth + lHandP.depth) / 3,
      draw: () => {
        draw3DLimb(ctx, lShoulderP.x, lShoulderP.y, lElbowP.x, lElbowP.y, 6.2, true, dynamicZoom);
        draw3DLimb(ctx, lElbowP.x, lElbowP.y, lHandP.x, lHandP.y, 5.2, true, dynamicZoom);
        drawTeslaJoint(ctx, lElbowP.x, lElbowP.y, 3.8, true, dynamicZoom);
        drawTeslaHand(ctx, lHandP.x, lHandP.y, true, dynamicZoom);
      }
    },
    {
      depth: (rShoulderP.depth + rElbowP.depth + rHandP.depth) / 3,
      draw: () => {
        draw3DLimb(ctx, rShoulderP.x, rShoulderP.y, rElbowP.x, rElbowP.y, 7.5, false, dynamicZoom);
        draw3DLimb(ctx, rElbowP.x, rElbowP.y, rHandP.x, rHandP.y, 6.5, false, dynamicZoom);
        drawTeslaJoint(ctx, rElbowP.x, rElbowP.y, 4.5, false, dynamicZoom);
        drawTeslaHand(ctx, rHandP.x, rHandP.y, false, dynamicZoom);
      }
    },
    {
      depth: (lHipP.depth + lKneeP.depth + lAnkleP.depth) / 3,
      draw: () => {
        draw3DLimb(ctx, lHipP.x, lHipP.y, lKneeP.x, lKneeP.y, 8.2, false, dynamicZoom);
        draw3DLimb(ctx, lKneeP.x, lKneeP.y, lAnkleP.x, lAnkleP.y, 7.2, false, dynamicZoom);
        drawTeslaJoint(ctx, lHipP.x, lHipP.y, 5.8, false, dynamicZoom);
        drawTeslaJoint(ctx, lKneeP.x, lKneeP.y, 4.8, false, dynamicZoom);
        drawTeslaFoot(ctx, lAnkleP.x, lAnkleP.y, dynamicZoom);
      }
    },
    {
      depth: (rHipP.depth + rKneeP.depth + rAnkleP.depth) / 3,
      draw: () => {
        draw3DLimb(ctx, rHipP.x, rHipP.y, rKneeP.x, rKneeP.y, 8.2, false, dynamicZoom);
        draw3DLimb(ctx, rKneeP.x, rKneeP.y, rAnkleP.x, rAnkleP.y, 7.2, false, dynamicZoom);
        drawTeslaJoint(ctx, rHipP.x, rHipP.y, 5.8, false, dynamicZoom);
        drawTeslaJoint(ctx, rKneeP.x, rKneeP.y, 4.8, false, dynamicZoom);
        drawTeslaFoot(ctx, rAnkleP.x, rAnkleP.y, dynamicZoom);
      }
    },
    {
      depth: (shCenterP.depth + pelvisP.depth) / 2,
      draw: () => {
        drawTeslaTorso(ctx, shCenterX, shCenterY, shCenterZ, lShoulderX, lShoulderY, lShoulderZ, rShoulderX, rShoulderY, rShoulderZ, pelvisX, pelvisY, pelvisZ, breathVal, dynamicZoom);
        drawTeslaJoint(ctx, shCenterP.x, shCenterP.y, 6.2, false, dynamicZoom);
      }
    },
    {
      depth: headP.depth,
      draw: () => {
        drawTeslaHead3D(ctx, headX, headY, headZ, 13, shCenterX, shCenterY, shCenterZ, dynamicZoom, px, py, pz);
      }
    }
  ];

  // Draw back-to-front
  drawList.sort((a, b) => b.depth - a.depth);
  drawList.forEach(item => item.draw());

  requestAnimationFrame(drawScene);
}

// Start animation loop
requestAnimationFrame(drawScene);

// --- Core Helper Functions ---
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

  if (musicToggle) {
    musicToggle.classList.toggle("is-active", state.musicOn);
    musicToggle.setAttribute("aria-pressed", state.musicOn);
    musicToggle.innerHTML = `<span class="icon">🎵</span> Music: ${state.musicOn ? "On" : "Off"}`;
  }
  if (voiceToggle) {
    voiceToggle.classList.toggle("is-active", state.voiceOn);
    voiceToggle.setAttribute("aria-pressed", state.voiceOn);
    voiceToggle.innerHTML = `<span class="icon">🔊</span> Voice: ${state.voiceOn ? "On" : "Off"}`;
  }

  renderMoveList();
}

function setRoutine(key) {
  state.routineKey = key;
  state.moveIndex = 0;
  state.elapsed = 0;
  state.playing = false;
  state.lastTick = null;
  ambientSynth.stop();
  VoiceGuide.cancel();
  render();
}

function speakCurrentMove() {
  const routine = currentRoutine();
  const move = routine.moves[state.moveIndex];
  if (move) {
    VoiceGuide.speak(move.title, move.text);
  }
}

function jumpToMove(index) {
  const oldIndex = state.moveIndex;
  state.moveIndex = index;
  state.elapsed = Math.min(currentRoutine().seconds, index * secondsPerMove());
  state.lastTick = null;
  render();

  if (oldIndex !== index && state.playing) {
    speakCurrentMove();
  }
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
  const breathOrb = document.querySelector("#breathOrb");
  const breathCue = document.querySelector("#breathCue");
  if (breathOrb) breathOrb.classList.toggle("is-expanded", state.breathExpanded);
  if (breathCue) breathCue.textContent = state.breathExpanded ? "Exhale" : "Inhale";

  if (state.playing && state.musicOn) {
    ambientSynth.setBreathingIntensity(state.breathExpanded);
  }
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

  const oldIndex = state.moveIndex;
  state.elapsed = Math.min(routine.seconds, state.elapsed + delta);
  state.moveIndex = Math.min(routine.moves.length - 1, Math.floor(state.elapsed / secondsPerMove()));

  if (state.elapsed >= routine.seconds) {
    state.playing = false;
    state.lastTick = null;
    ambientSynth.stop();
  }

  if (oldIndex !== state.moveIndex && state.playing) {
    speakCurrentMove();
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
    if (state.musicOn) {
      ambientSynth.start();
    }
    speakCurrentMove();
    requestAnimationFrame(tick);
  } else {
    ambientSynth.stop();
    VoiceGuide.cancel();
  }
}

function toggleMusic() {
  ambientSynth.init();
  state.musicOn = !state.musicOn;
  render();
  if (state.playing) {
    if (state.musicOn) {
      ambientSynth.start();
    } else {
      ambientSynth.stop();
    }
  }
}

function toggleVoice() {
  state.voiceOn = !state.voiceOn;
  render();
  if (state.playing) {
    if (state.voiceOn) {
      speakCurrentMove();
    } else {
      VoiceGuide.cancel();
    }
  }
}

// --- Event Listeners ---
tabs.forEach((tab) => {
  tab.addEventListener("click", () => setRoutine(tab.dataset.routine));
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextMove);
previousBtn.addEventListener("click", previousMove);

if (musicToggle) musicToggle.addEventListener("click", toggleMusic);
if (voiceToggle) voiceToggle.addEventListener("click", toggleVoice);

// Volume mixing event listeners
if (musicVolumeInput) {
  musicVolumeInput.addEventListener("input", (e) => {
    state.musicVolume = parseFloat(e.target.value);
    ambientSynth.updateVolume();
  });
}

if (voiceVolumeInput) {
  voiceVolumeInput.addEventListener("input", (e) => {
    state.voiceVolume = parseFloat(e.target.value);
  });
}

// Soundscape theme selector listener
if (soundscapeSelect) {
  soundscapeSelect.addEventListener("change", (e) => {
    state.soundscapePreset = e.target.value;
    // If playing, restart the synth immediately with the new soundscape configuration
    if (state.playing && state.musicOn) {
      ambientSynth.stop();
      setTimeout(() => {
        if (state.playing && state.musicOn) {
          ambientSynth.start();
        }
      }, 300);
    }
  });
}

// Camera Preset bindings
if (camFrontBtn) {
  camFrontBtn.addEventListener("click", () => {
    state.autoOrbit = false;
    updateOrbitToggleStyle();
    camera.yaw = Math.PI;
    camera.pitch = 0.1;
    camera.panX = 0;
    camera.panY = 8;
  });
}

if (camSideBtn) {
  camSideBtn.addEventListener("click", () => {
    state.autoOrbit = false;
    updateOrbitToggleStyle();
    camera.yaw = Math.PI / 2;
    camera.pitch = 0.1;
    camera.panX = 0;
    camera.panY = 8;
  });
}

if (camTopBtn) {
  camTopBtn.addEventListener("click", () => {
    state.autoOrbit = false;
    updateOrbitToggleStyle();
    camera.yaw = Math.PI;
    camera.pitch = Math.PI / 2 - 0.1;
    camera.panX = 0;
    camera.panY = 8;
  });
}

function updateOrbitToggleStyle() {
  if (camOrbitToggle) {
    camOrbitToggle.classList.toggle("is-active", state.autoOrbit);
    camOrbitToggle.textContent = state.autoOrbit ? "🔄 Orbiting" : "🔄 Orbit";
  }
}

if (camOrbitToggle) {
  camOrbitToggle.addEventListener("click", () => {
    state.autoOrbit = !state.autoOrbit;
    updateOrbitToggleStyle();
  });
}

// Setup Breath Cue Interval (7.6 second complete cycle, toggled every 3.8s)
setInterval(updateBreathCue, 3800);

// --- 3D Camera Controls (Onshape CAD Style) ---
let isDragging = false;
let dragMode = "orbit"; // "orbit" or "pan"
const canvasEl = document.getElementById("animationCanvas");
let dragStartX = 0, dragStartY = 0;

// Mobile Touch Control State
let isTouchDragging = false;
let touchStartX = 0, touchStartY = 0;
let touchStartDist = 0;
let touchMode = "orbit"; // "orbit" or "zoom"

if (canvasEl) {
  // --- Mouse Listeners ---
  canvasEl.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    // Right button (2) or Middle button (1) or Shift-key drag = Pan
    if (e.button === 2 || e.button === 1 || e.shiftKey || e.ctrlKey) {
      dragMode = "pan";
    } else {
      dragMode = "orbit";
    }
  });

  canvasEl.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    if (dragMode === "orbit") {
      camera.yaw += dx * 0.0075;
      camera.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.pitch + dy * 0.0075));
    } else {
      camera.panX += dx / camera.zoom;
      camera.panY += dy / camera.zoom;
    }
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Prevent right-click context menu so right-drag orbits smoothly
  canvasEl.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Scroll to Zoom
  canvasEl.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    camera.zoom = Math.max(0.6, Math.min(6.0, camera.zoom * factor));
  }, { passive: false });

  // Double click to Reset View
  canvasEl.addEventListener("dblclick", () => {
    state.autoOrbit = false;
    updateOrbitToggleStyle();
    camera.yaw = cameraDefaults.yaw;
    camera.pitch = cameraDefaults.pitch;
    camera.zoom = cameraDefaults.zoom;
    camera.panX = cameraDefaults.panX;
    camera.panY = cameraDefaults.panY;
  });

  // --- Mobile Touch Gestures ---
  canvasEl.addEventListener("touchstart", (e) => {
    isTouchDragging = true;
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMode = "orbit";
    } else if (e.touches.length === 2) {
      touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist = Math.sqrt(dx * dx + dy * dy) || 1;
      touchMode = "zoom";
    }
  }, { passive: true });

  canvasEl.addEventListener("touchmove", (e) => {
    if (!isTouchDragging) return;

    if (touchMode === "orbit" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      camera.yaw += dx * 0.0075;
      camera.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.pitch + dy * 0.0075));
    } else if (touchMode === "zoom" && e.touches.length === 2) {
      const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Pinch zoom
      const factor = currentDist / touchStartDist;
      touchStartDist = currentDist;
      camera.zoom = Math.max(0.6, Math.min(6.0, camera.zoom * (1 + (factor - 1) * 0.8)));

      // Two-finger drag pan
      const panDx = currentMidX - touchStartX;
      const panDy = currentMidY - touchStartY;
      touchStartX = currentMidX;
      touchStartY = currentMidY;

      camera.panX += panDx / camera.zoom;
      camera.panY += panDy / camera.zoom;
    }
  }, { passive: true });

  canvasEl.addEventListener("touchend", () => {
    isTouchDragging = false;
  });
}

render();
