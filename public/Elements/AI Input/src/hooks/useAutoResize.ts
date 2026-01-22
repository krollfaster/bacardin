import { useCallback, useRef, useEffect } from 'react'

export const useAutoResize = (maxHeight = 200) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = `${newHeight}px`
    }, [maxHeight])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.addEventListener('input', adjustHeight)
        adjustHeight()

        return () => {
            textarea.removeEventListener('input', adjustHeight)
        }
    }, [adjustHeight])

    return { textareaRef, adjustHeight }
}
