import { SvgProps } from '@lib/ui/props'

/**
 * Small right-chevron used on the Reshare option cards. Exported from the Figma
 * reshare redesign so it matches the design's stroke weight and rounding. Uses
 * `currentColor`, so set the color on the wrapping element.
 */
export const ReshareChevronRightIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 5 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0.75 7.41667L3.49408 4.67258C3.8195 4.34717 3.8195 3.8195 3.49408 3.49408L0.75 0.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
