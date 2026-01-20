"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { LinkPreview } from "@/components/ui/LinkPreview";

interface ExperienceCardProps {
  icon: string;
  position: string;
  company: string;
  dates: string;
  description: React.ReactNode;
  link?: { text: string; url: string; previewImage?: string };
  index: number;
}

const ExperienceCard = ({
  icon,
  position,
  company,
  dates,
  description,
  link,
  index,
}: ExperienceCardProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.5 },
        },
      }}
      className="bg-card px-10 pt-9 pb-[38px] rounded-4xl"
      style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
    >
      {/* Область с компанией */}
      <div className="flex items-center gap-6 mb-6 h-[62px]">
        <Image
          src={icon}
          alt={company}
          width={52}
          height={52}
          className="flex-shrink-0"
        />
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-medium text-[28px] text-foreground truncate leading-[26px]">
            {position} · {company}
          </h3>
          <span className="mt-3 font-medium text-[28px] text-muted-foreground truncate leading-[26px]">
            {dates}
          </span>
        </div>
      </div>

      {/* Область с описанием */}
      <p className="font-[500] text-[28px] text-muted-foreground leading-[36px]">
        {description}
      </p>

      {/* Область со ссылкой */}
      {link && (
        <div className="mt-6">
          <LinkPreview
            href={link.url}
            previewImage={link.previewImage || "/images/preview-default.png"}
            isExternal={!link.url.startsWith("/")}
          >
            {link.text}
          </LinkPreview>
        </div>
      )}
    </motion.div>
  );
};

export const Experience = () => {
  const t = useTranslations("experience");

  const experiences: Array<{
    icon: string;
    position: string;
    company: string;
    dates: string;
    description: React.ReactNode;
    link?: { text: string; url: string; previewImage?: string };
  }> = [
      {
        icon: "/images/icons/sber.svg",
        position: t("items.sber.position"),
        company: t("items.sber.company"),
        dates: t("items.sber.dates"),
        description: (
          <>
            {t("items.sber.desc_part1")}{" "}
            <span className="text-foreground">{t("items.sber.desc_highlight1")}</span>{" "}
            {t("items.sber.desc_part2")}{" "}
            <span className="text-foreground">{t("items.sber.desc_highlight2")}</span>{" "}
            {t("items.sber.desc_part3")}{" "}
            <span className="text-foreground">{t("items.sber.desc_highlight3")}</span>
          </>
        ),
      },
      {
        icon: "/images/icons/mid.svg",
        position: t("items.mid.position"),
        company: t("items.mid.company"),
        dates: t("items.mid.dates"),
        description: (
          <>
            {t("items.mid.desc_part1")}{" "}
            <span className="text-foreground">{t("items.mid.desc_highlight1")}</span>
            {t("items.mid.desc_part2")}{" "}
            <span className="text-foreground">{t("items.mid.desc_highlight2")}</span>
            {t("items.mid.desc_part3")}{" "}
            <span className="text-foreground">{t("items.mid.desc_highlight3")}</span>{" "}
            {t("items.mid.desc_part4")}
          </>
        ),
      },
      {
        icon: "/images/icons/unitbean.svg",
        position: t("items.unitbean.position"),
        company: t("items.unitbean.company"),
        dates: t("items.unitbean.dates"),
        description: (
          <>
            {t("items.unitbean.desc_part1")}{" "}
            <span className="text-foreground">{t("items.unitbean.desc_highlight1")}</span>{" "}
            {t("items.unitbean.desc_part2")}{" "}
            <span className="text-foreground">{t("items.unitbean.desc_highlight2")}</span>{" "}
            {t("items.unitbean.desc_part3")}{" "}
            <span className="text-foreground">{t("items.unitbean.desc_highlight3")}</span>{" "}
            {t("items.unitbean.desc_part4")}
          </>
        ),
        link: {
          text: t("items.unitbean.link"),
          url: t("items.unitbean.linkUrl"),
          previewImage: "/images/behance-preview.jpg",
        },
      },
    ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="mt-[52px]"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Заголовок секции */}
        <motion.h2
          variants={fadeIn}
          className="mb-8 font-medium text-[28px] text-muted-foreground leading-[36px]"
        >
          {t("title")} <span className="text-foreground">{t("titleHighlight")}</span>
        </motion.h2>

        {/* Карточки опыта */}
        <div className="flex flex-col gap-6 md:gap-8">
          {experiences.map((exp, index) => (
            <ExperienceCard
              key={index}
              icon={exp.icon}
              position={exp.position}
              company={exp.company}
              dates={exp.dates}
              description={exp.description}
              link={exp.link}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

