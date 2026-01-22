import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CompactInputSplitProps {
    value: string
    onAnimationComplete: () => void
    onMessageFlightStart?: () => void
    onInputExpand?: () => void
    className?: string
}

type AnimationPhase = 'rounding' | 'messageFlight' | 'inputExpand' | 'done'

export const CompactInputSplit = ({
    value,
    onAnimationComplete,
    onMessageFlightStart,
    onInputExpand,
    className,
}: CompactInputSplitProps) => {
    const [phase, setPhase] = useState<AnimationPhase>('rounding')
    const [messageWidth, setMessageWidth] = useState(0)
    const [containerWidth, setContainerWidth] = useState(600)
    const messageRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Измеряем ширину перед анимацией
    useEffect(() => {
        if (messageRef.current) {
            setMessageWidth(messageRef.current.offsetWidth)
        }
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth)
        }
    }, [])

    // Следим за размером окна
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = []

        // Фаза 1: rounding (0-200ms)
        // Фаза 2: messageFlight (200ms) — стартует раньше
        timers.push(setTimeout(() => {
            setPhase('messageFlight')
            onMessageFlightStart?.()
        }, 150)) // Ускорили старт (было 200)

        // Фаза 3: inputExpand (350ms) -> 250ms
        timers.push(setTimeout(() => {
            setPhase('inputExpand')
            onInputExpand?.()
        }, 300))

        // Фаза 4: done (600ms) -> 450ms
        timers.push(setTimeout(() => {
            setPhase('done')
            onAnimationComplete()
        }, 450))

        return () => timers.forEach(clearTimeout)
    }, [onAnimationComplete, onMessageFlightStart, onInputExpand])

    const containerStyle = {
        backgroundColor: '#1F1C18',
        boxShadow: 'inset 0 0 24px rgba(255, 255, 255, 0.08)',
        border: '1px solid #282727',
    }

    const isFlying = phase === 'messageFlight' || phase === 'inputExpand' || phase === 'done'

    // Рассчитываем конечную позицию X, чтобы прижаться к правому краю (containerWidth)
    // containerWidth (общая ширина) - messageWidth (ширина сообщения)
    const targetX = containerWidth - messageWidth

    // Рассчитываем конечную позицию Y на основе индекса сообщения
    const messageHeight = 103 // 87 + 16
    const listBottomPadding = 16
    // Т.к. список теперь justify-end, новое сообщение всегда летит в "нижний слот" над инпутом
    // Смещение: поднимаемся на высоту сообщения + отступ списка
    const targetY = -(messageHeight + listBottomPadding)

    return (
        <div ref={containerRef} className={cn('relative w-full max-w-[600px]', className)}>
            {/* Контейнер для двух блоков */}
            <div className="flex items-center w-full">
                {/* Блок с текстом (MessageBubble) - сразу HUG */}
                <motion.div
                    ref={messageRef}
                    className={cn(
                        'flex items-center h-[87px]',
                        'px-[38px]',
                        'shrink-0',
                        // Когда улетает — position absolute чтобы не влиять на layout
                        isFlying && 'absolute z-10'
                    )}
                    style={containerStyle}
                    initial={{
                        borderRadius: 999,
                        x: 0,
                        y: 0,
                    }}
                    animate={{
                        borderRadius: 800,
                        // Летим вверх и вправо к финальной позиции сообщения
                        x: isFlying ? targetX : 0,
                        y: isFlying ? targetY : 0,
                    }}
                    transition={{
                        borderRadius: { duration: 0, ease: 'linear' },
                        x: { duration: 0.3, ease: [0.65, 0, 0.35, 1] },
                        y: { duration: 0.3, ease: [0.65, 0, 0.35, 1] },
                    }}
                >
                    <span className="font-['Google text-[28px] text-white leading-[35px] whitespace-nowrap Sans',sans-serif]">
                        {value}
                    </span>
                </motion.div>

                {/* Spacer для сохранения лейаута, когда сообщение улетает */}
                {isFlying && (
                    <motion.div
                        className="shrink-0"
                        initial={{ width: messageWidth }}
                        animate={{
                            width:
                                phase === 'inputExpand' || phase === 'done'
                                    ? 0
                                    : messageWidth,
                        }}
                        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                    />
                )}

                {/* Блок с кнопкой (InputBar) - сразу Fill */}
                <motion.div
                    className={cn(
                        'flex justify-end items-center h-[87px]',
                        'pr-[22px] pl-[22px]',
                        'flex-1'
                    )}
                    style={containerStyle}
                    initial={{ borderRadius: 999, marginLeft: 16 }}
                    animate={{
                        borderRadius: 999,
                        marginLeft:
                            phase === 'inputExpand' || phase === 'done' ? 0 : 16,
                    }}
                    transition={{
                        borderRadius: { duration: 0 },
                        marginLeft: { duration: 0.3, ease: [0.65, 0, 0.35, 1] },
                    }}
                >
                    {/* Submit Button */}
                    <div
                        className={cn(
                            'flex justify-center items-center shrink-0',
                            'w-[76px] h-[55px]',
                            'rounded-[999px]'
                        )}
                        style={{ backgroundColor: '#454545' }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ color: '#D4D4D4' }}
                        >
                            <path
                                d="M12 19V5M12 5L5 12M12 5L19 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
