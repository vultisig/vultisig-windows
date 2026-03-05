import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const PencilWaveIcon: FC<SvgProps> = props => (
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
    <path d="M21 18.0001C21 18.0001 19.666 19.5445 18.166 19.5445C16.666 19.5445 15.4594 18.1152 13.9866 18.1152C12.5138 18.1152 11.6598 18.7862 10.75 19.7501M18.4142 4.16439L18.8358 4.58597C19.6168 5.36702 19.6168 6.63335 18.8358 7.4144L6.58579 19.6644C6.21071 20.0394 5.70201 20.2501 5.17157 20.2501H2.75V17.8286C2.75 17.2981 2.96071 16.7894 3.33579 16.4144L15.5858 4.1644C16.3668 3.38335 17.6332 3.38335 18.4142 4.16439Z" />
  </svg>
)
