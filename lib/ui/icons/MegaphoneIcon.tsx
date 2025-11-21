import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const MegaphoneIcon: FC<SvgProps> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)" filter="url(#b)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.205 11.667a2.5 2.5 0 0 0 0-5m-4.726 8.541a2.501 2.501 0 0 1-4.857-.833v-1.25m.002-7.917v7.917m9.581-8.574v9.232a1.667 1.667 0 0 1-2.158 1.592l-9.584-2.959a1.667 1.667 0 0 1-1.175-1.592V7.51c0-.732.477-1.377 1.175-1.593l9.584-2.959a1.667 1.667 0 0 1 2.158 1.593Z"
        shapeRendering="crispEdges"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
      <filter
        id="b"
        width={24.917}
        height={23.492}
        x={-2.462}
        y={2.133}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={4} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_57060_74525"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_57060_74525"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
