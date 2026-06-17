import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const GasLimitIcon: FC<SvgProps> = props => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.4987 13.5H10.1654M9.4987 13.5V6.5M9.4987 13.5H2.4987M9.4987 6.5V3.83333C9.4987 3.09695 8.90176 2.5 8.16536 2.5H3.83203C3.09565 2.5 2.4987 3.09695 2.4987 3.83333V13.5M9.4987 6.5H10.4987C11.2351 6.5 11.832 7.09693 11.832 7.83333V10.3333C11.832 10.9777 12.3544 11.5 12.9987 11.5C13.643 11.5 14.1654 10.9777 14.1654 10.3333V5.92715C14.1654 5.54917 14.005 5.18895 13.724 4.93609L12.4987 3.83333M2.4987 13.5H1.83203M7.4987 6.5H4.4987"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
