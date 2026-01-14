"use client";

// Типы звуков
export type SoundType = "none" | "softClick" | "tick" | "pop" | "whoosh" | "chime" | "thud" | "tap" | "knock";

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
  { id: "thud", name: "Глухой удар", description: "Низкий приглушённый удар" },
  { id: "tap", name: "Тап", description: "Мягкое касание поверхности" },
  { id: "knock", name: "Стук", description: "Глухой стук по дереву" },
];

// Глобальный AudioContext (создаётся один раз)
let audioContext: AudioContext | null = null;
let isUnlocked = false;

// Разблокировка AudioContext при первом user gesture
const unlockAudioContext = (): void => {
  if (isUnlocked) return;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  
  if (audioContext.state === "suspended") {
    audioContext.resume().then(() => {
      isUnlocked = true;
    });
  } else {
    isUnlocked = true;
  }
};

// Регистрируем глобальные обработчики для разблокировки
const setupAudioUnlock = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  
  const events = ["click", "touchstart", "touchend", "keydown", "pointerdown"];
  
  const handleUserGesture = () => {
    unlockAudioContext();
    // Удаляем обработчики после разблокировки
    events.forEach(event => {
      document.removeEventListener(event, handleUserGesture, true);
    });
  };
  
  // Добавляем обработчики с capture для раннего срабатывания
  events.forEach(event => {
    document.addEventListener(event, handleUserGesture, true);
  });
};

// Инициализируем после загрузки DOM
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAudioUnlock);
  } else {
    setupAudioUnlock();
  }
}

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

  thud: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Низкая частота для глухого звука
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    // Фильтр низких частот для приглушения
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  },

  tap: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Очень короткий, мягкий тап
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.025);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.025);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.025);
  },

  knock: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Два осциллятора для более "деревянного" звука
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);

    oscillator2.type = "triangle";
    oscillator2.frequency.setValueAtTime(250, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);

    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.06);
    oscillator2.start(ctx.currentTime);
    oscillator2.stop(ctx.currentTime + 0.04);
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
