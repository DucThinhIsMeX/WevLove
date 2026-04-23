let audioCtx = null;
let isUnlocked = false;

const initAudio = () => {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const unlockAudio = () => {
  if (isUnlocked) return;
  initAudio();
  if (audioCtx) {
    try {
      // Play silent buffer to unlock audio engine on iOS
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(0);
      isUnlocked = true;
    } catch (e) {}
    
    // Cleanup listeners
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('click', unlockAudio, { passive: true });
}

const playTone = (frequency, type, duration, vol) => {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Smooth attack and release to avoid clicking noises
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const playHover = () => {
  // A soft, high-pitched gentle pop
  playTone(800, 'sine', 0.05, 0.02);
};

export const playClick = () => {
  // A deeper, satisfying pop for clicking
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Frequency drop for a bubble "pop" effect
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
};

export const playSuccess = () => {
  // A soft chime (two quick notes C5 -> E5)
  playTone(523.25, 'sine', 0.15, 0.03); 
  setTimeout(() => playTone(659.25, 'sine', 0.3, 0.03), 100); 
};

export const playError = () => {
  // A low dull double beep
  playTone(200, 'triangle', 0.15, 0.05);
  setTimeout(() => playTone(150, 'triangle', 0.2, 0.05), 150);
};
