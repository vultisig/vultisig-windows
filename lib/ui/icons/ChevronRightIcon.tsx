import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ChevronRightIcon: FC<SvgProps> = props => (
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
    <path d="M9 18L15 12L9 6" />
  </svg>
)
