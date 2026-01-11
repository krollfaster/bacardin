"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons/ArrowLeftIcon";
import { MailIcon } from "@/components/ui/icons/MailIcon";
import { TelegramIcon } from "@/components/ui/icons/TelegramIcon";

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
  "flex items-center justify-center p-4 rounded-[32px] bg-[#202020]/65 backdrop-blur-[0.64px] shadow-[inset_0_0_18px_rgba(255,255,255,0.04)] transition-colors";

export const CaseNavigation = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="fixed top-[28px] left-0 right-0 z-50 flex justify-between px-[32px]">
      {/* Кнопка назад */}
      <motion.button
        onClick={handleBack}
        aria-label="Назад"
        className={buttonClassName}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeftIcon size={54} />
      </motion.button>

      {/* Кнопки связи */}
      <div className="flex gap-6">
        {contactLinks.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            aria-label={link.label}
            className={buttonClassName}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <link.icon size={54} />
          </motion.a>
        ))}
      </div>
    </div>
  );
};
