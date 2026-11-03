import { SvgProps } from '@lib/ui/props'

/** Scan brackets with a center line, drawn 18 wide for Quick settings. */
export const ScanIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.9em"
    height="1em"
    viewBox="0 0 18 20"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M15.2997 10H2.69971"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M11.6997 2.99967H12.5997C13.5938 2.99967 14.3997 3.89507 14.3997 4.99967V5.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M3.60059 5.99967V4.99967C3.60059 3.89507 4.40645 2.99967 5.40059 2.99967H6.30059"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M11.6997 16.9998H12.5997C13.5938 16.9998 14.3997 16.1044 14.3997 14.9998V13.9998"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M3.60059 13.9998V14.9998C3.60059 16.1044 4.40645 16.9998 5.40059 16.9998H6.30059"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
    </g>
  </svg>
)
