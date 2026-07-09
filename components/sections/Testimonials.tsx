"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { LinkPreview } from "@/components/ui/LinkPreview";

interface TestimonialCardProps {
    avatar: string;
    name: string;
    role: string;
    text: string;
    link?: { text: string; url: string; previewImage?: string };
    index: number;
}

const TestimonialCard = ({
    avatar,
    name,
    role,
    text,
    link,
    index,
}: TestimonialCardProps) => {
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
            className="bg-card px-[38px] pt-[34px] pb-[36px] rounded-4xl"
            style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
        >
            {/* Верхний блок с аватаром и информацией */}
            <div className="flex items-center gap-[23px] mb-[23px]">
                <Image
                    src={avatar}
                    alt={name}
                    width={51}
                    height={51}
                    className="flex-shrink-0 rounded-lg object-cover"
                    style={{ width: 51, height: 51, borderRadius: 8 }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-medium text-[26px] text-foreground truncate leading-[24px]">
                        {name}
                    </h3>
                    <span className="mt-3 font-medium text-[26px] text-muted-foreground truncate leading-[24px]">
                        {role}
                    </span>
                </div>
            </div>

            {/* Текст отзыва */}
            <p className="font-[500] text-[26px] text-muted-foreground leading-[34px]">
                {text}
            </p>

            {/* Ссылка на рекомендательное письмо */}
            {link && (
                <div className="mt-[23px]">
                    <LinkPreview
                        href={link.url}
                        previewImage={link.previewImage || "/images/preview-default.png"}
                        altText={`Превью: ${link.text}`}
                        isExternal={!link.url.startsWith("/")}
                    >
                        {link.text}
                    </LinkPreview>
                </div>
            )}
        </motion.div>
    );
};

export const Testimonials = () => {
    const t = useTranslations("testimonials");

    const testimonials: Array<{
        avatar: string;
        name: string;
        role: string;
        text: string;
        link?: { text: string; url: string; previewImage?: string };
    }> = [
            {
                avatar: "/images/Sber.jpg",
                name: t("items.denis.name"),
                role: t("items.denis.role"),
                text: t("items.denis.text"),
                link: {
                    text: t("items.denis.link"),
                    url: t("items.denis.linkUrl"),
                    previewImage: "/images/letter.jpg",
                },
            },
            {
                avatar: "/images/Unitbean.jpg",
                name: t("items.anton.name"),
                role: t("items.anton.role"),
                text: t("items.anton.text"),
            },
        ];

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-[49px]"
        >
            <div className="mx-auto px-6 max-w-[1000px]">
                {/* Заголовок секции */}
                <motion.h2
                    variants={fadeIn}
                    className="mb-[30px] font-medium text-[26px] text-muted-foreground leading-[34px]"
                >
                    {t("title")}
                </motion.h2>

                {/* Сетка карточек */}
                <div className="gap-[23px] md:gap-[30px] grid grid-cols-1 md:grid-cols-2">
                    {testimonials.map((item, index) => (
                        <TestimonialCard
                            key={index}
                            avatar={item.avatar}
                            name={item.name}
                            role={item.role}
                            text={item.text}
                            link={item.link}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};
