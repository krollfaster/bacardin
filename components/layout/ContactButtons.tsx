"use client";

import { usePathname } from "next/navigation";
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

export const ContactButtons = () => {
  const pathname = usePathname();
  
  // Скрываем кнопки в админке и на страницах кейсов (там есть CaseNavigation)
  if (pathname.includes("/admin") || pathname.includes("/cases/")) {
    return null;
  }

  return (
    <div className="fixed top-[28px] right-[32px] z-50 flex gap-6">
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
  );
};
