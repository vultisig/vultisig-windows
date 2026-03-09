import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const BurgerOpenIcon: FC<SvgProps> = props => (
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
    <path d="M2.75 12H21.25M2.75 5.75H21.25M2.75 18.25H21.25" />
  </svg>
)
