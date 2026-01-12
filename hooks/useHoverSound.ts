"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { 
  playSoundEffect, 
  loadSoundSettings, 
  type SoundSettings,
  type SoundType 
} from "@/lib/sounds";

interface UseHoverSoundOptions {
  debounceMs?: number;
}

export function useHoverSound(options: UseHoverSoundOptions = {}) {
  const { debounceMs = 50 } = options;
  const lastPlayedRef = useRef<number>(0);
  const [settings, setSettings] = useState<SoundSettings | null>(null);

  // Загружаем настройки при монтировании
  useEffect(() => {
    setSettings(loadSoundSettings());
    
    // Слушаем изменения в localStorage (если настройки меняются в другой вкладке)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolio-sound-settings") {
        setSettings(loadSoundSettings());
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Также слушаем кастомное событие для обновлений в той же вкладке
    const handleCustomEvent = () => {
      setSettings(loadSoundSettings());
    };
    
    window.addEventListener("sound-settings-changed", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sound-settings-changed", handleCustomEvent);
    };
  }, []);

  const playHoverSound = useCallback(() => {
    if (!settings?.enabled || settings.type === "none") return;
    
    const now = Date.now();
    if (now - lastPlayedRef.current < debounceMs) return;
    
    lastPlayedRef.current = now;
    playSoundEffect(settings.type);
  }, [settings, debounceMs]);

  // Для тестирования конкретного типа звука
  const playTestSound = useCallback((type: SoundType) => {
    playSoundEffect(type);
  }, []);

  return {
    playHoverSound,
    playTestSound,
    settings,
  };
}
