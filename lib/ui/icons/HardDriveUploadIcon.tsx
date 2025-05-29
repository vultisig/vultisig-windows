import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const HardDriveUploadIcon: FC<SvgProps> = props => (
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
    <path d="M16 6L12 2M12 2L8 6M12 2V10M6 18H6.01M10 18H10.01M4 14H20C21.1046 14 22 14.8954 22 16V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V16C2 14.8954 2.89543 14 4 14Z" />
  </svg>
)
