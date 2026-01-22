import { forwardRef, useRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CompactInputProps } from './types'

export interface CompactInputRef {
    focus: () => void
}

export const CompactInput = forwardRef<CompactInputRef, CompactInputProps>(
    ({ value, onChange, onSubmit, placeholder = 'Message', className }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null)

        useImperativeHandle(ref, () => ({
            focus: () => inputRef.current?.focus(),
        }))

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (value.trim()) {
                    onSubmit()
                }
            }
        }

        return (
            <motion.div
                className={cn(
                    'relative flex items-center w-full max-w-[600px] h-[87px]',
                    'rounded-[999px]',
                    'pl-[38px] pr-[22px]',
                    className
                )}
                style={{
                    backgroundColor: '#1F1C18',
                    border: '1px solid #282727',
                    boxShadow: 'inset 0 0 24px rgba(255, 255, 255, 0.08)',
                }}
                layoutId="input-container"
            >
                {/* Text Input Area */}
                <motion.div
                    className="flex flex-1 items-center"
                    layoutId="input-text-area"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={cn(
                            'bg-transparent outline-none w-full',
                            'text-[28px] leading-[35px]',
                            'placeholder:text-[#605F5F]',
                            'text-white',
                            'font-["Google Sans",sans-serif]'
                        )}
                    />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                    onClick={() => value.trim() && onSubmit()}
                    disabled={!value.trim()}
                    className={cn(
                        'flex justify-center items-center shrink-0',
                        'w-[76px] h-[55px]',
                        'rounded-[999px]',
                        'transition-opacity',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    style={{
                        backgroundColor: '#454545',
                    }}
                    layoutId="submit-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                </motion.button>
            </motion.div>
        )
    }
)

CompactInput.displayName = 'CompactInput'
