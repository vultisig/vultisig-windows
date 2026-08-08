import { SvgProps } from '@lib/ui/props'

export const AtomShieldIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16.1 16.1"
    fill="none"
    {...props}
  >
    <ellipse
      cx="8.05"
      cy="8.05"
      rx="7.25"
      ry="2.85"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse
      cx="8.05"
      cy="8.05"
      rx="7.25"
      ry="2.85"
      transform="rotate(60 8.05 8.05)"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse
      cx="8.05"
      cy="8.05"
      rx="7.25"
      ry="2.85"
      transform="rotate(-60 8.05 8.05)"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.05" cy="8.05" r="1.6" fill="currentColor" />
  </svg>
)
