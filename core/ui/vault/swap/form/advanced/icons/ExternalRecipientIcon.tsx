import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ExternalRecipientIcon: FC<SvgProps> = props => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5.83203 5.83203H3.16536C2.42898 5.83203 1.83203 6.42898 1.83203 7.16536V12.832C1.83203 13.5684 2.42898 14.1654 3.16536 14.1654H8.83203C9.56843 14.1654 10.1654 13.5684 10.1654 12.832V10.1654"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83203 5.83203V6.66536V8.66536V8.83203C5.83203 9.56843 6.42898 10.1654 7.16536 10.1654H7.33203H9.33203H10.1654M5.83203 3.33203V3.16536C5.83203 2.42898 6.42898 1.83203 7.16536 1.83203H7.33203M12.6654 1.83203H12.832C13.5684 1.83203 14.1654 2.42898 14.1654 3.16536V3.33203M9.33203 1.83203H10.6654M14.1654 5.33203V6.66536M14.1654 8.66536V8.83203C14.1654 9.56843 13.5684 10.1654 12.832 10.1654H12.6654"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
