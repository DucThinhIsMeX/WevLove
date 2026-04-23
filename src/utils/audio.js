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
    // Better envelope for loudness
    const attack = 0.02;
    const decay = duration - attack;
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + attack);
    gainNode.gain.linearRampToValueAtTime(vol * 0.5, audioCtx.currentTime + attack + decay * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const playHover = () => {
  // A clearer, slightly longer pop
  playTone(800, 'triangle', 0.1, 0.8);
};

export const playClick = () => {
  // A deeper, satisfying pop for clicking
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    const duration = 0.15;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + duration * 0.6);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
};

export const playSuccess = () => {
  // A soft chime (two quick notes C5 -> E5)
  playTone(523.25, 'triangle', 0.25, 0.8); 
  setTimeout(() => playTone(659.25, 'triangle', 0.4, 0.8), 120); 
};

export const playError = () => {
  // A low dull double beep
  playTone(200, 'triangle', 0.15, 1.0);
  setTimeout(() => playTone(150, 'triangle', 0.2, 1.0), 150);
};
