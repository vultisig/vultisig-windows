import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const CalendarClockIcon: FC<SvgProps> = props => (
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
    <path d="M7.75 4.75V2.75M16.25 4.75V2.75M8.75 20.25H5.75C4.64543 20.25 3.75 19.3546 3.75 18.25V6.75C3.75 5.64543 4.64543 4.75 5.75 4.75H18.25C19.3546 4.75 20.25 5.64543 20.25 6.75V8.75" />
    <path d="M17 22.25C19.8995 22.25 22.25 19.8995 22.25 17C22.25 14.1005 19.8995 11.75 17 11.75C14.1005 11.75 11.75 14.1005 11.75 17C11.75 19.8995 14.1005 22.25 17 22.25Z" />
    <path d="M17 14.75V16.9996L18.75 18.75" />
  </svg>
)
