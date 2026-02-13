import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const InfoCircleIcon: FC<SvgProps> = props => (
  <svg fill="none" height="1em" viewBox="0 0 20 20" width="1em" {...props}>
    <path
      d="M8.95842 9.16669H10.0001V13.5417M17.7084 10C17.7084 14.2572 14.2572 17.7084 10.0001 17.7084C5.74289 17.7084 2.29175 14.2572 2.29175 10C2.29175 5.74283 5.74289 2.29169 10.0001 2.29169C14.2572 2.29169 17.7084 5.74283 17.7084 10Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M10.0001 6.14581C9.71241 6.14581 9.47925 6.379 9.47925 6.66665C9.47925 6.9543 9.71241 7.18748 10.0001 7.18748C10.2877 7.18748 10.5209 6.9543 10.5209 6.66665C10.5209 6.379 10.2877 6.14581 10.0001 6.14581Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.25"
    />
  </svg>
)
