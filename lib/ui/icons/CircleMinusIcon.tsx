import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const CircleMinusIcon: FC<SvgProps> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 12 12"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_66400_19434)">
      <path
        d="M8.1213 6.00025H3.87868M10.625 6C10.625 8.5543 8.5543 10.625 6 10.625C3.44568 10.625 1.375 8.5543 1.375 6C1.375 3.44568 3.44568 1.375 6 1.375C8.5543 1.375 10.625 3.44568 10.625 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_66400_19434">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
