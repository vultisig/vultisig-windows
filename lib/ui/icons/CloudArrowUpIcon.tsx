import { SvgProps } from '@lib/ui/props'

/** A cloud with an upward arrow, on a 20px grid. */
export const CloudArrowUpIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M10 12.0003V17.0003"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25033 12L10.0003 10L11.7503 12H8.25033Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.2347 11.7837C16.3057 10.8667 16.9997 9.52067 16.9997 7.99967C16.9997 5.23867 14.7607 2.99967 11.9997 2.99967C9.50967 2.99967 7.46067 4.82567 7.07967 7.20767C6.74367 7.07767 6.38167 6.99967 5.99967 6.99967C4.34267 6.99967 2.99967 8.34267 2.99967 9.99967C2.99967 11.2467 3.76067 12.3147 4.84367 12.7677"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
