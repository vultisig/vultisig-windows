import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ExpandIcon: FC<SvgProps> = props => (
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
    <path d="M21 21L15 15M21 21V16.2M21 21H16.2M3 16.2V21M3 21H7.8M3 21L9 15M21 7.8V3M21 3H16.2M21 3L15 9M3 7.8V3M3 3H7.8M3 3L9 9" />
  </svg>
)
