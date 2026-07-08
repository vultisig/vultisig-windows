import { SvgProps } from '@lib/ui/props'

/**
 * Orange lightning-bolt used in the "Threshold not met" badge, matching the
 * device-picker card icons in the Figma reshare redesign.
 */
export const ReshareThresholdBoltIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.36 1.41232C8.36 0.679429 7.41436 0.384987 6.99833 0.988304L1.89113 8.39374C1.54944 8.88917 1.9041 9.56457 2.50595 9.56457H5.97005V12.9369C5.97005 13.6698 6.91564 13.9643 7.33173 13.361L12.4389 5.95557C12.7806 5.46012 12.4259 4.7847 11.8241 4.7847H8.36V1.41232Z"
      fill="url(#reshare_bolt_gradient)"
    />
    <defs>
      <linearGradient
        id="reshare_bolt_gradient"
        x1="7.16502"
        y1="0.664062"
        x2="9.2631"
        y2="11.8715"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F2C375" />
        <stop offset="1" stopColor="#FFAA1C" />
      </linearGradient>
    </defs>
  </svg>
)
