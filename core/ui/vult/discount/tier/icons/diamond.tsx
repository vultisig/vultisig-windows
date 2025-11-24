import { SvgProps } from '@lib/ui/props'

export const DiamondTierIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="0.5"
      y="0.5"
      width="39"
      height="39"
      rx="19.5"
      fill="#8954FF"
      fillOpacity="0.12"
    />
    <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" stroke="#8954FF" />
    <path
      d="M20 10L20 30M10 20L30 20M15.5 12L20 20L24.5 12M15.5 28L20 20L24.5 28M12 15.5L20 20L12 24.5M28 15.5L20 20L28 24.5"
      stroke="#8954FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="20" r="2" fill="#8954FF" />
  </svg>
)
