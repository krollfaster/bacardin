"use client";

// Типы звуков
export type SoundType = "none" | "softClick" | "tick" | "pop" | "whoosh" | "chime";

export interface SoundConfig {
  id: SoundType;
  name: string;
  description: string;
}

export const SOUND_OPTIONS: SoundConfig[] = [
  { id: "none", name: "Без звука", description: "Звуковые эффекты отключены" },
  { id: "softClick", name: "Мягкий клик", description: "Тихий, приятный щелчок" },
  { id: "tick", name: "Тик", description: "Короткий механический звук" },
  { id: "pop", name: "Поп", description: "Звук лопающегося пузырика" },
  { id: "whoosh", name: "Свист", description: "Мягкий звук движения воздуха" },
  { id: "chime", name: "Тон", description: "Короткая музыкальная нота" },
];

// Глобальный AudioContext (создаётся один раз)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  
  // Возобновляем контекст если он был приостановлен
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  
  return audioContext;
};

// Генераторы звуков с использованием Web Audio API
const playSound = {
  softClick: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  },

  tick: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  },

  pop: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  },

  whoosh: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Создаём белый шум
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    filter.Q.value = 1;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    source.start(ctx.currentTime);
  },

  chime: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 нота

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  },
};

// Главная функция воспроизведения
export const playSoundEffect = (type: SoundType): void => {
  if (type === "none") return;
  
  const soundFn = playSound[type];
  if (soundFn) {
    soundFn();
  }
};

// Сохранение/загрузка настроек
const STORAGE_KEY = "portfolio-sound-settings";

export interface SoundSettings {
  enabled: boolean;
  type: SoundType;
}

export const getDefaultSoundSettings = (): SoundSettings => ({
  enabled: true,
  type: "softClick",
});

export const loadSoundSettings = (): SoundSettings => {
  if (typeof window === "undefined") return getDefaultSoundSettings();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading sound settings:", e);
  }
  
  return getDefaultSoundSettings();
};

export const saveSoundSettings = (settings: SoundSettings): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving sound settings:", e);
  }
};
