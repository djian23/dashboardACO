import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({ fullScreen, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'fixed inset-0 z-50 bg-[#0f0f0f]',
        className
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7c3aed]/30 border-t-[#7c3aed]" />
    </div>
  )
}
