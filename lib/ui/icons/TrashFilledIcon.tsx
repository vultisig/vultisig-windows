import { SvgProps } from '@lib/ui/props'

/** Trash can, filled. */
export const TrashFilledIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M11.9997 2.99967H7.99967V4.99967H11.9997V2.99967Z"
      fill="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M4.2985 7.99967L4.6565 15.1487C4.7355 16.7477 6.0525 17.9997 7.6525 17.9997H12.3475C13.9485 17.9997 15.2645 16.7477 15.3435 15.1487L15.7015 7.99967H4.2985Z"
      fill="currentColor"
    />
    <path
      d="M16.9997 5H2.99967"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
