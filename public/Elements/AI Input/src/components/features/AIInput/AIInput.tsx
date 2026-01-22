import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAutoResize } from '@/hooks/useAutoResize'
import { inputContainerVariants, buttonVariants } from '@/lib/animations'
import { MeshGradient } from './MeshGradient'
import { ShimmerText } from './ShimmerText'

interface AIInputProps {
    className?: string
    placeholder?: string
    onSubmit?: (value: string) => void
}

export const AIInput = ({
    className,
    placeholder = 'Ask anything...',
    onSubmit,
}: AIInputProps) => {
    const [value, setValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const { textareaRef, adjustHeight } = useAutoResize(200)

    const handleSubmit = async () => {
        if (!value.trim() || isLoading) return

        setIsLoading(true)
        onSubmit?.(value)

        // Симуляция загрузки
        setTimeout(() => {
            setIsLoading(false)
            setValue('')
            adjustHeight()
        }, 2000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <motion.div
            className={cn(
                'relative rounded-2xl w-full max-w-2xl overflow-hidden',
                'border border-white/10 bg-zinc-900/80 backdrop-blur-xl',
                'shadow-2xl shadow-zinc-900/20',
                className
            )}
            variants={inputContainerVariants}
            initial="initial"
            whileHover="hover"
            animate={isFocused ? 'focus' : 'initial'}
            style={{
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Mesh Gradient Background */}
            <MeshGradient className="opacity-50" />

            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />

            {/* Content */}
            <div className="z-10 relative flex items-end gap-3 p-4">
                <div className="relative flex-1 min-h-[24px]">
                    {/* Placeholder with shimmer */}
                    <AnimatePresence>
                        {!value && !isFocused && (
                            <motion.div
                                className="absolute inset-0 flex items-center pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ShimmerText text={placeholder} className="text-base" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Static placeholder when focused */}
                    {!value && isFocused && (
                        <div className="absolute inset-0 flex items-center pointer-events-none">
                            <span className="text-zinc-500 text-base">{placeholder}</span>
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className={cn(
                            'bg-transparent w-full text-white text-base resize-none',
                            'placeholder-transparent outline-none',
                            'scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent'
                        )}
                        disabled={isLoading}
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    onClick={handleSubmit}
                    disabled={!value.trim() || isLoading}
                    className={cn(
                        'flex justify-center items-center rounded-xl w-10 h-10 shrink-0',
                        'bg-zinc-100 text-zinc-900 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'hover:bg-white'
                    )}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={!isLoading && value.trim() ? 'hover' : undefined}
                    whileTap={!isLoading && value.trim() ? 'tap' : undefined}
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="arrow"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Bottom loading bar */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="right-0 bottom-0 left-0 absolute bg-white h-0.5"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                            scaleX: 1,
                            opacity: 1,
                        }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{
                            scaleX: { duration: 1, repeat: Infinity },
                        }}
                        style={{ transformOrigin: 'left' }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
