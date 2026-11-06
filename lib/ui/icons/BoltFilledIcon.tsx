import { SvgProps } from '@lib/ui/props'

/** A filled lightning bolt, drawn 18 wide for Quick settings. */
export const BoltFilledIcon = (props: SvgProps) => (
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
        d="M9.90059 2.99967L8.10059 8.99967H14.4006L8.10059 16.9997L9.90059 10.9997H3.60059L9.90059 2.99967Z"
        fill="var(--icon-accent, currentColor)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
    </g>
  </svg>
)
