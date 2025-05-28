import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const CrossIcon: FC<SvgProps> = props => (
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
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)
