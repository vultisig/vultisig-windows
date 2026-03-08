import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const BurgerClosedIcon: FC<SvgProps> = props => (
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
    <path d="M3.75 4.75H20.25M3.75 12H12.25M3.75 19.25H20.25" />
  </svg>
)
