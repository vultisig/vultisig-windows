import { SvgProps } from '@lib/ui/props'

/** Four arrows expanding to the corners. */
export const Expand2Icon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g clipPath="url(#expand2Icon-clip0_0_22)">
      <g filter="url(#expand2Icon-filter0_d_0_22)">
        <path
          d="M17.0003 12.0003V14.0003C17.0003 15.6573 15.6573 17.0003 14.0003 17.0003H12.0003"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </g>
      <path
        d="M2.99967 7.99967V5.99967C2.99967 4.34267 4.34267 2.99967 5.99967 2.99967H7.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
      <path
        d="M17.0003 7.99967V2.99967H12.0003"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M12.0003 7.99967L17.0003 2.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M2.99967 12.0003V17.0003H7.99967"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M7.99967 12.0003L2.99967 17.0003"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </g>
    <defs>
      <filter
        id="expand2Icon-filter0_d_0_22"
        x="7.25033"
        y="11.2503"
        width="14.5"
        height="14.5"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_0_22"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_0_22"
          result="shape"
        />
      </filter>
      <clipPath id="expand2Icon-clip0_0_22">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
