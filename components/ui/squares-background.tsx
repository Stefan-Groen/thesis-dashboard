"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface SquaresBackgroundProps {
  className?: string
  squareSize?: number
  borderColor?: string
  children?: React.ReactNode
}

export function SquaresBackground({
  className,
  squareSize = 40,
  borderColor = 'rgba(0, 0, 0, 0.1)',
  children,
}: SquaresBackgroundProps) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${borderColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${borderColor} 1px, transparent 1px)
          `,
          backgroundSize: `${squareSize}px ${squareSize}px`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
