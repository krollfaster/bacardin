import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import useSound from 'use-sound'
import sendSound from '@/assets/sounds/send_upperbeat.mp3'
import { CompactInput, CompactInputRef } from './CompactInput'
import { CompactInputSplit } from './CompactInputSplit'
import type { AIInputProps, InputPhase, InputVariant } from './types'

const CHAR_THRESHOLD = 10

interface Message {
    id: string
    text: string
    invisible?: boolean
}

export const AIInputContainer = ({
    className,
    placeholder = 'Message',
    onSubmit,
}: AIInputProps) => {
    const [value, setValue] = useState('')
    const [submittedValue, setSubmittedValue] = useState('')
    const [phase, setPhase] = useState<InputPhase>('idle')
    const [messages, setMessages] = useState<Message[]>([])
    const compactInputRef = useRef<CompactInputRef>(null)
    const pendingMessageIdRef = useRef<string | null>(null)

    const [playSend] = useSound(sendSound, { volume: 0.25 })

    // Определяем вариант на основе длины текста
    const variant: InputVariant = value.length >= CHAR_THRESHOLD ? 'expanded' : 'compact'

    const handleSubmit = useCallback(() => {
        if (!value.trim() || phase !== 'idle') return

        playSend()
        setSubmittedValue(value)
        setPhase('submitting')
        onSubmit?.(value)
    }, [value, phase, onSubmit, playSend])

    const handleMessageFlightStart = useCallback(() => {
        // Сообщение начало лететь — добавляем "невидимку" чтобы список поехал вверх
        const id = Date.now().toString()
        pendingMessageIdRef.current = id

        const newMessage: Message = {
            id,
            text: submittedValue,
            invisible: true,
        }
        setMessages(prev => [...prev, newMessage])
    }, [submittedValue])

    const handleInputExpand = useCallback(() => {
        // Инпут расширился
    }, [])

    const handleAnimationComplete = useCallback(() => {
        // Анимация завершилась — делаем сообщение видимым
        if (pendingMessageIdRef.current) {
            setMessages(prev => prev.map(m =>
                m.id === pendingMessageIdRef.current
                    ? { ...m, invisible: false }
                    : m
            ))
            pendingMessageIdRef.current = null
        }

        // Сбрасываем состояние
        setValue('')
        setSubmittedValue('')
        setPhase('idle')

        // Возвращаем фокус на инпут после того как он появится
        setTimeout(() => {
            compactInputRef.current?.focus()
        }, 10)
    }, [])

    const handleChange = (newValue: string) => {
        setValue(newValue)
    }

    return (
        <div className={cn('flex flex-col w-full h-full', className)}>
            {/* Область сообщений */}
            <div
                className="flex flex-col flex-1 justify-end items-center pt-12 pb-8 w-full overflow-y-auto"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black 100px)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 100px)',
                }}
            >
                <div className="flex flex-col items-end px-4 sm:px-0 w-full max-w-[600px]">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                layout
                                key={message.id}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30,
                                }}
                                className={cn(
                                    'flex items-center h-[87px]',
                                    'px-[38px] mb-4',
                                    'rounded-[800px]'
                                )}
                                style={{
                                    backgroundColor: '#1F1C18',
                                    boxShadow: 'inset 0 0 24px rgba(255, 255, 255, 0.08)',
                                    border: '1px solid #282727',
                                    opacity: message.invisible ? 0 : 1,
                                }}
                            >
                                <span className="font-['Google text-[28px] text-white leading-[35px] whitespace-nowrap Sans',sans-serif]">
                                    {message.text}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <motion.div
                className={cn(
                    'relative flex justify-center px-4 sm:px-0 pb-4 sm:pb-12 w-full'
                )}
                animate={{
                    y: 0,
                }}
                transition={{
                    y: { duration: 0.5, ease: [0.32, 0, 0.67, 0] },
                }}
            >
                {/* CompactInput всегда в DOM чтобы держать фокус */}
                {variant === 'compact' && (
                    <div className={cn(
                        'w-full max-w-[600px]',
                        phase === 'submitting' && 'opacity-0 pointer-events-none'
                    )}>
                        <CompactInput
                            ref={compactInputRef}
                            value={value}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            placeholder={placeholder}
                        />
                    </div>
                )}

                {/* Анимация полета (CompactInputSplit) поверх инпута */}
                {phase === 'submitting' && variant === 'compact' && (
                    <div className="top-0 right-0 left-0 z-10 absolute flex justify-center px-4 sm:px-0">
                        <CompactInputSplit
                            value={submittedValue}
                            onAnimationComplete={handleAnimationComplete}
                            onMessageFlightStart={handleMessageFlightStart}
                            onInputExpand={handleInputExpand}
                        />
                    </div>
                )}

                {/* TODO Этап 3: ExpandedInput */}
                {phase === 'idle' && variant === 'expanded' && (
                    <CompactInput
                        key="expanded-idle"
                        ref={compactInputRef}
                        value={value}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        placeholder={placeholder}
                    />
                )}

                {/* TODO Этап 3: ExpandedInputSplit */}
                {phase === 'submitting' && variant === 'expanded' && (
                    <CompactInputSplit
                        key="expanded-submitting"
                        value={submittedValue}
                        onAnimationComplete={handleAnimationComplete}
                        onMessageFlightStart={handleMessageFlightStart}
                        onInputExpand={handleInputExpand}
                    />
                )}
            </motion.div>
        </div>
    )
}
