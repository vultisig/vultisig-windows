import { SvgProps } from '@lib/ui/props'

/** A broken chain link with a slash through it. */
export const LinkSlashIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M9.9997 4.9997L9.0352 4.0352C7.6545 2.6545 5.4159 2.6545 4.0352 4.0352C2.6545 5.4159 2.6545 7.6545 4.0352 9.0352L4.9997 9.9997"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M10 15L10.9645 15.9645C12.3452 17.3452 14.5838 17.3452 15.9645 15.9645C17.3452 14.5838 17.3452 12.3452 15.9645 10.9645L15 10"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M9.99967 9.99967L7.99967 7.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M2.99967 16.9997L16.9997 2.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
    </g>
  </svg>
)
