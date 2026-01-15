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
      className="rounded-4xl bg-card px-10 pb-[38px] pt-9"
      style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
    >
      {/* Область с компанией */}
      <div className="flex items-center gap-6 h-[62px] mb-6">
        <Image
          src={icon}
          alt={company}
          width={52}
          height={52}
          className="flex-shrink-0"
        />
        <div className="flex flex-col">
          <h3 className="text-[28px] leading-[26px] font-medium text-foreground">
            {position} · {company}
          </h3>
          <span className="text-[28px] leading-[26px] font-medium text-muted-foreground mt-3">
            {dates}
          </span>
        </div>
      </div>

      {/* Область с описанием */}
      <p className="text-[28px] leading-[36px] font-[500] text-muted-foreground">
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
      description: t("items.sber.description"),
      link: {
        text: t("items.sber.link"),
        url: t("items.sber.linkUrl"),
        previewImage: "/images/letter.jpg",
      },
    },
    {
      icon: "/images/icons/mid.svg",
      position: t("items.mid.position"),
      company: t("items.mid.company"),
      dates: t("items.mid.dates"),
      description: (
        <>
          {t("items.mid.description_part1")}{" "}
          <span className="text-foreground">
            {t("items.mid.description_highlight")}
          </span>{" "}
          {t("items.mid.description_part2")}
        </>
      ),
    },
    {
      icon: "/images/icons/unitbean.svg",
      position: t("items.unitbean.position"),
      company: t("items.unitbean.company"),
      dates: t("items.unitbean.dates"),
      description: t("items.unitbean.description"),
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
          className="text-[28px] leading-[36px] font-medium text-muted-foreground mb-8"
        >
          {t("title")}
        </motion.h2>

        {/* Карточки опыта */}
        <div className="flex flex-col gap-8">
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

