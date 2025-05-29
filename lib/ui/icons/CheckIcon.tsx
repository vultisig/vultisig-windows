import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const CheckIcon: FC<SvgProps> = props => (
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
    <path d="M20 6L9 17L4 12" />
  </svg>
)
