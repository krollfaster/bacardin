import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ShimmerTextProps {
    text: string
    className?: string
}

export const ShimmerText = ({ text, className }: ShimmerTextProps) => {
    return (
        <motion.span
            className={cn(
                'bg-[length:200%_100%] bg-clip-text bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 text-transparent',
                className
            )}
            animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            {text}
        </motion.span>
    )
}
