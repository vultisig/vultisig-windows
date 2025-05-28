import { LinearIconProps } from '@lib/ui/icons/IconProps'
import { FC } from 'react'

export const ChevronDownIcon: FC<LinearIconProps> = props => (
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
    <path d="M6 9L12 15L18 9" />
  </svg>
)
