import React from 'react'

interface RingProgressProps {
  size: number
  strokeWidth: number
  progress: number // percentage (0-100)
}

const RingProgress: React.FC<RingProgressProps> = ({
  size,
  strokeWidth,
  progress,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#11284A"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <defs>
        <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0439C7" />
          <stop offset="100%" stopColor="#33E6BF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default RingProgress
