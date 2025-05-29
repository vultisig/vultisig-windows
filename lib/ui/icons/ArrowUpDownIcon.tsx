import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ArrowUpDownIcon: FC<SvgProps> = props => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M21 16L17 20M17 20L13 16M17 20V4M3 8L7 4M7 4L11 8M7 4V20" />
  </svg>
)
