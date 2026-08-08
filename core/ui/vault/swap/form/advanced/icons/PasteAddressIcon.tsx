import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const PasteAddressIcon: FC<SvgProps> = props => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.29102 7.29102H3.95768C3.03721 7.29102 2.29102 8.03721 2.29102 8.95768V16.041C2.29102 16.9615 3.03721 17.7077 3.95768 17.7077H11.041C11.9615 17.7077 12.7077 16.9615 12.7077 16.041V12.7077"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.29102 3.95768C7.29102 3.03721 8.03721 2.29102 8.95768 2.29102H16.041C16.9615 2.29102 17.7077 3.03721 17.7077 3.95768V11.041C17.7077 11.9615 16.9615 12.7077 16.041 12.7077H8.95768C8.03721 12.7077 7.29102 11.9615 7.29102 11.041V3.95768Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
