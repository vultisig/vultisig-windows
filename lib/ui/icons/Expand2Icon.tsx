import { SvgProps } from '@lib/ui/props'

/** Two diagonal arrows pointing out to opposite corners, framed by rounded corners. */
export const Expand2Icon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M17.0003 12.0003V14.0003C17.0003 15.6573 15.6573 17.0003 14.0003 17.0003H12.0003"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M2.99967 7.99967V5.99967C2.99967 4.34267 4.34267 2.99967 5.99967 2.99967H7.99967"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M17.0003 7.99967V2.99967H12.0003"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M12.0003 7.99967L17.0003 2.99967"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M2.99967 12.0003V17.0003H7.99967"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M7.99967 12.0003L2.99967 17.0003"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
