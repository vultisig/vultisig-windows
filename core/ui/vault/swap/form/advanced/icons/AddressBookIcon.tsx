import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const AddressBookIcon: FC<SvgProps> = props => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.0423 9.99935V12.291C16.0423 13.2115 15.2962 13.9577 14.3757 13.9577H5.83398C4.79845 13.9577 3.95898 14.7972 3.95898 15.8327C3.95898 16.8682 4.79845 17.7077 5.83398 17.7077H8.33398M7.29232 5.83268H12.709M7.29232 9.16602H10.209M5.62565 2.29102H14.3757C15.2962 2.29102 16.0423 3.03721 16.0423 3.95768V16.041C16.0423 16.9615 15.2962 17.7077 14.3757 17.7077H5.62565C4.70518 17.7077 3.95898 16.9615 3.95898 16.041V3.95768C3.95898 3.03721 4.70518 2.29102 5.62565 2.29102Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
