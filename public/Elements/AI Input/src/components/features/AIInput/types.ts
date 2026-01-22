export type InputVariant = 'compact' | 'expanded'
export type InputPhase = 'idle' | 'submitting' | 'submitted'

export interface InputState {
    variant: InputVariant
    phase: InputPhase
    value: string
}

export interface AIInputProps {
    className?: string
    placeholder?: string
    onSubmit?: (value: string) => void
}

export interface CompactInputProps {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    placeholder?: string
    className?: string
}

export interface CompactInputSplitProps {
    value: string
    onAnimationComplete: () => void
    onMessageFlightStart?: () => void
    onInputExpand?: () => void
    className?: string
    messageIndex: number
}
