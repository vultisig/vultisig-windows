import { SvgProps } from '@lib/ui/props'

/** A filled circle in the current color with a check in the accent color. */
export const CircleCheckFilledIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path
      d="M6.13368 8.26684L7.33368 9.60017L9.86701 6.40017"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="var(--icon-accent, white)"
    />
  </svg>
)
