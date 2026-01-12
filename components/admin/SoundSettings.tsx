"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  SOUND_OPTIONS, 
  playSoundEffect,
  loadSoundSettings, 
  saveSoundSettings,
  type SoundType,
  type SoundSettings as SoundSettingsType
} from "@/lib/sounds";

// Превью-карточка для демонстрации hover-эффекта
function DemoCard() {
  return (
    <div className="h-[200px] rounded-[20px] p-2.5 flex flex-col gap-2.5 bg-[#1F1C18] group">
      <div 
        className="flex-1 rounded-xl overflow-hidden relative"
        style={{ backgroundColor: "#16130F" }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Превью изображения</span>
        </div>
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)" }}
        />
      </div>
      <div 
        className="h-[44px] rounded-xl px-3 flex items-center justify-between"
        style={{ 
          backgroundColor: "#16130F",
          boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)"
        }}
      >
        <span className="text-sm font-medium text-foreground">Пример кейса</span>
        <span className="text-sm text-muted-foreground">jan 2026</span>
      </div>
    </div>
  );
}

export function SoundSettings() {
  const [settings, setSettings] = useState<SoundSettingsType>({
    enabled: true,
    type: "softClick",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Загружаем настройки при монтировании
  useEffect(() => {
    const loaded = loadSoundSettings();
    setSettings(loaded);
    setIsLoaded(true);
  }, []);

  // Сохраняем и уведомляем об изменениях
  const updateSettings = (newSettings: Partial<SoundSettingsType>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSoundSettings(updated);
    
    // Уведомляем другие компоненты об изменении
    window.dispatchEvent(new CustomEvent("sound-settings-changed"));
  };

  const handleToggleEnabled = (enabled: boolean) => {
    updateSettings({ enabled });
  };

  const handleSelectSound = (type: SoundType) => {
    updateSettings({ type });
    if (type !== "none") {
      playSoundEffect(type);
    }
  };

  const handleTestSound = (type: SoundType, e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundEffect(type);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Звуковые эффекты</h2>
        <p className="text-muted-foreground">
          Настройте звуковой эффект, который будет воспроизводиться при наведении на карточки кейсов
        </p>
      </div>

      {/* Переключатель вкл/выкл */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {settings.enabled ? (
              <Volume2 className="w-6 h-6 text-primary" />
            ) : (
              <VolumeX className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="sound-enabled" className="text-base font-medium">
                Звуки при наведении
              </Label>
              <p className="text-sm text-muted-foreground">
                {settings.enabled ? "Звуковые эффекты включены" : "Звуковые эффекты отключены"}
              </p>
            </div>
          </div>
          <Switch
            id="sound-enabled"
            checked={settings.enabled}
            onCheckedChange={handleToggleEnabled}
          />
        </div>
      </Card>

      {/* Выбор типа звука */}
      <div className={cn(!settings.enabled && "opacity-50 pointer-events-none")}>
        <h3 className="text-lg font-semibold mb-4">Выберите звук</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOUND_OPTIONS.filter(s => s.id !== "none").map((sound) => (
            <motion.div
              key={sound.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all border-2",
                  settings.type === sound.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-border"
                )}
                onClick={() => handleSelectSound(sound.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {settings.type === sound.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                    <span className="font-medium">{sound.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleTestSound(sound.id, e)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{sound.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Секция тестирования */}
      <div className={cn(!settings.enabled && "opacity-50 pointer-events-none")}>
        <h3 className="text-lg font-semibold mb-4">Тестирование</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Наведите курсор на карточку, чтобы услышать выбранный звук
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => {
                if (settings.enabled && settings.type !== "none") {
                  playSoundEffect(settings.type);
                }
              }}
              className="cursor-pointer"
            >
              <DemoCard />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Подсказка */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Совет:</strong> Звук "Мягкий клик" лучше всего подходит для минималистичного дизайна. 
          Он ненавязчивый и создаёт приятное тактильное ощущение.
        </p>
      </Card>
    </div>
  );
}
