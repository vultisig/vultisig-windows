import { SvgProps } from '@lib/ui/props'

/** Rounded note with two text lines. */
export const NoteIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M17.0003 6.99984V12.9998C17.0003 14.6567 15.6572 15.9998 14.0003 15.9998H6.00033C4.34347 15.9998 3.00033 14.6567 3.00033 12.9998V6.99984C3.00033 5.34298 4.34347 3.99984 6.00033 3.99984L14.0003 3.99984C15.6572 3.99984 17.0003 5.34298 17.0003 6.99984Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M13.0003 7.99967H7.00033"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M10.0003 12.0003H7.00033"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
