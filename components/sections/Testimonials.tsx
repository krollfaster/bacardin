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
            className="bg-card px-10 pt-9 pb-[38px] rounded-4xl"
            style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
        >
            {/* Верхний блок с аватаром и информацией */}
            <div className="flex items-center gap-6 mb-6">
                <Image
                    src={avatar}
                    alt={name}
                    width={54}
                    height={54}
                    className="flex-shrink-0 rounded-lg object-cover"
                    style={{ width: 54, height: 54, borderRadius: 8 }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-medium text-[28px] text-foreground truncate leading-[26px]">
                        {name}
                    </h3>
                    <span className="mt-3 font-medium text-[28px] text-muted-foreground truncate leading-[26px]">
                        {role}
                    </span>
                </div>
            </div>

            {/* Текст отзыва */}
            <p className="font-[500] text-[28px] text-muted-foreground leading-[36px]">
                {text}
            </p>

            {/* Ссылка на рекомендательное письмо */}
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
            className="mt-[52px] mb-20"
        >
            <div className="mx-auto px-6 max-w-[1000px]">
                {/* Заголовок секции */}
                <motion.h2
                    variants={fadeIn}
                    className="mb-8 font-medium text-[28px] text-muted-foreground leading-[36px]"
                >
                    {t("title")}
                </motion.h2>

                {/* Сетка карточек */}
                <div className="gap-6 md:gap-8 grid grid-cols-1 md:grid-cols-2">
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
