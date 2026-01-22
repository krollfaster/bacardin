import { cn } from '@/lib/utils'

interface MeshGradientProps {
    className?: string
}

export const MeshGradient = ({ className }: MeshGradientProps) => {
    return (
        <div className={cn('absolute inset-0 bg-[#16130F]', className)} />
    )
}
