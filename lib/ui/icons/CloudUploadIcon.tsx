import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const CloudUploadIcon: FC<SvgProps> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 16.042v-6.25m0 0 2.083 2.084M10 9.792l-2.083 2.084m4.583 4.166h2.604a3.437 3.437 0 1 0-.108-6.873 5 5 0 0 0-9.724-1.841 4.376 4.376 0 0 0 .561 8.714H7.5"
    />
  </svg>
)
