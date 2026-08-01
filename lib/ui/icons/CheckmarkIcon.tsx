import { SvgProps } from '@lib/ui/props'

export const CheckmarkIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 12 12"
    fill="none"
    {...props}
  >
    <path
      d="M3.375 6.53125L4.95 8.125L8.625 3.875"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
