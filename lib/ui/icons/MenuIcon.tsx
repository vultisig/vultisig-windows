import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const MenuIcon: FC<SvgProps> = props => (
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
    <path d="M4 12H20M4 6H20M4 18H20" />
  </svg>
)
