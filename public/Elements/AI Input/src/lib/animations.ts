import { Variants } from 'framer-motion'

export const inputContainerVariants: Variants = {
    initial: {
        scale: 1,
        rotateX: 0,
        transformPerspective: 1000,
    },
    hover: {
        scale: 1.02,
        rotateX: 2,
        transformPerspective: 1000,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    focus: {
        scale: 1.02,
        rotateX: 0,
        transformPerspective: 1000,
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
}

export const buttonVariants: Variants = {
    initial: { scale: 1, opacity: 0.8 },
    hover: { scale: 1.05, opacity: 1 },
    tap: { scale: 0.95 },
}

export const shimmerVariants: Variants = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
        },
    },
}

export const loadingDotsVariants: Variants = {
    animate: {
        opacity: [0.4, 1, 0.4],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
}
