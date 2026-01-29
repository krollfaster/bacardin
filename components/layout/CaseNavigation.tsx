"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons/ArrowLeftIcon";
import { MailIcon } from "@/components/ui/icons/MailIcon";
import { TelegramIcon } from "@/components/ui/icons/TelegramIcon";
import { MagneticButton } from "@/components/ui/MagneticButton";

const contactLinks = [
  {
    href: "mailto:rickbacardin@yandex.ru",
    icon: MailIcon,
    label: "Email",
  },
  {
    href: "https://t.me/RickBacardin",
    icon: TelegramIcon,
    label: "Telegram",
  },
];

const buttonClassName =
  "flex items-center justify-center p-4 rounded-[32px] bg-[#202020]/65 backdrop-blur-[0.64px] shadow-[inset_0_0_18px_rgba(255,255,255,0.04)] transition-colors cursor-pointer";

export const CaseNavigation = () => {
  const router = useRouter();

  const handleBack = () => {
    // Если в истории браузера больше 1 записи — возвращаемся назад
    // Это работает корректно с клиент-сайд навигацией Next.js
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Иначе переходим на главную
      router.push("/");
    }
  };

  return (
    <div className="top-[28px] right-0 left-0 z-50 fixed flex justify-between px-[32px]">
      {/* Кнопка назад */}
      <MagneticButton
        onClick={handleBack}
        aria-label="Назад"
        className={buttonClassName}
      >
        <ArrowLeftIcon size={54} />
      </MagneticButton>

      {/* Кнопки связи */}
      <div className="flex gap-6">
        {contactLinks.map((link) => (
          <MagneticButton
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            aria-label={link.label}
            className={buttonClassName}
          >
            <link.icon size={54} />
          </MagneticButton>
        ))}
      </div>
    </div>
  );
};
