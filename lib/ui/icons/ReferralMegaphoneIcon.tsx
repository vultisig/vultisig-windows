import { SvgProps } from '@lib/ui/props'

/** A megaphone with a shadow under its handle. */
export const ReferralMegaphoneIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g clipPath="url(#referralMegaphoneIcon-clip0_0_22)">
      <g filter="url(#referralMegaphoneIcon-filter0_d_0_22)">
        <path
          d="M5 11.5455V14.7817C5 15.2327 5.3018 15.6278 5.7369 15.7465L8.7369 16.5647C9.373 16.7382 10 16.2593 10 15.5999V12.9092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </g>
      <path
        d="M16.5007 11.4495C17.6418 11.2178 18.5007 10.2094 18.5007 8.99989C18.5007 7.79039 17.6418 6.78199 16.5007 6.55029V11.4495Z"
        fill="currentColor"
      />
      <path
        d="M14.0007 2.99967V14.9997"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M2.99967 12.0002V6.00016"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M2.99967 6.99984L13.9997 3.99984"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M2.99967 11.0002L13.9997 14.0002"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </g>
    <defs>
      <filter
        id="referralMegaphoneIcon-filter0_d_0_22"
        x="0.25"
        y="10.7955"
        width="14.5"
        height="14.5554"
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
      <clipPath id="referralMegaphoneIcon-clip0_0_22">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
