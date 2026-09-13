import React from 'react'
import { Loader2 } from 'lucide-react'

const Loading = ({ variant = 'spinner', label = 'Loading...' }) => {
  if (variant === 'card') {
    return (
      <div className="rounded-xl overflow-hidden border border-gaming-border bg-gaming-card animate-pulse">
        <div className="aspect-[4/3] bg-gaming-surface" />
        <div className="p-4 space-y-3">
          <div className="h-3 w-1/3 bg-gaming-surface rounded" />
          <div className="h-4 w-2/3 bg-gaming-surface rounded" />
          <div className="h-3 w-full bg-gaming-surface rounded" />
          <div className="h-6 w-1/2 bg-gaming-surface rounded" />
        </div>
      </div>
    )
  }

  if (variant === 'row') {
    return (
      <div className="h-14 w-full bg-gaming-surface rounded-lg animate-pulse" />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-gaming-neon animate-spin" />
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  )
}

export default Loading
