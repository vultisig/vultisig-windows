import { SvgProps } from '@lib/ui/props'

/**
 * Blockaid's mark, as shown on the review sheet's badge. Redrawn as a single
 * stroked path from the design file's raster export, so it stays crisp at
 * badge size instead of being downsampled.
 */
export const BlockaidLogomark = (props: SvgProps) => (
  <svg
    width="0.924em"
    height="1em"
    viewBox="0 0 170 184"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2 15H127A28 28 0 0 1 127 71H37A21.25 21.25 0 0 0 37 113.5H127A27.75 27.75 0 0 1 127 169H2"
      stroke="currentColor"
      strokeWidth="30"
    />
  </svg>
)
