import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const MegaphoneIcon: FC<SvgProps> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 19 19"
    fill="none"
    {...props}
  >
    <path
      d="M14.4449 11.083C15.7565 11.083 16.8199 10.0197 16.8199 8.70798C16.8199 7.39632 15.7565 6.333 14.4449 6.333M9.95561 14.4476C9.6296 15.37 8.74982 16.0309 7.71574 16.0309C6.40407 16.0309 5.34074 14.9676 5.34074 13.6559V12.4684M5.34248 4.94759V12.4684M14.4449 4.3227V13.0933C14.4449 14.1592 13.413 14.9207 12.3945 14.6061L3.29031 11.7952C2.62669 11.5903 2.17407 10.9769 2.17407 10.2824V7.13366C2.17407 6.43914 2.62669 5.8257 3.29031 5.6208L12.3945 2.80983C13.413 2.49538 14.4449 3.25678 14.4449 4.3227Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
