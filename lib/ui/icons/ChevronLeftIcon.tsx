import { LinearIconProps } from '@lib/ui/icons/IconProps'
import { FC } from 'react'

export const ChevronLeftIcon: FC<LinearIconProps> = props => (
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
    <path d="M15 18L9 12L15 6" />
  </svg>
)
