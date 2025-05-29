import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ArrowUpFromDotIcon: FC<SvgProps> = props => (
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
    <path d="M5 9L12 2M12 2L19 9M12 2V16M13 21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21C11 20.4477 11.4477 20 12 20C12.5523 20 13 20.4477 13 21Z" />
  </svg>
)
