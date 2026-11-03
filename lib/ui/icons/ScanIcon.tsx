import { SvgProps } from '@lib/ui/props'

/** Scanner frame corners crossed by a scan line. */
export const ScanIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M16.9997 10H2.9997"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M12.9997 2.9997H13.9997C15.1042 2.9997 15.9997 3.8951 15.9997 4.9997V5.9997"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M4.0007 5.9997V4.9997C4.0007 3.8951 4.8961 2.9997 6.0007 2.9997H7.0007"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M12.9997 16.9998H13.9997C15.1042 16.9998 15.9997 16.1044 15.9997 14.9998V13.9998"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M4.0007 13.9998V14.9998C4.0007 16.1044 4.8961 16.9998 6.0007 16.9998H7.0007"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
