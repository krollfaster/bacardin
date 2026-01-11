"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

export const ContactButtons = () => {
  const pathname = usePathname();
  
  // Скрываем кнопки в админке
  if (pathname.includes("/admin")) {
    return null;
  }

  return (
    <div className="fixed top-[28px] right-[32px] z-50 flex gap-6">
      {contactLinks.map((link) => (
        <motion.a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          aria-label={link.label}
          className="flex items-center justify-center p-4 rounded-[32px] bg-[#202020]/65 backdrop-blur-[0.64px] shadow-[inset_0_0_18px_rgba(255,255,255,0.04)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <link.icon size={54} />
        </motion.a>
      ))}
    </div>
  );
};
