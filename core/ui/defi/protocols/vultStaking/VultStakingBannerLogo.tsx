import { useId } from 'react'
import styled from 'styled-components'

import { VultLogoIcon } from './VultLogoIcon'

// Concentric ring artwork (exported "Frame 1000005808") centred in a 201×206
// viewBox, with the brand badge placed at the same centre.
const ringViewWidth = 201
const ringViewHeight = 206
const ringCenterX = 101.283
const ringCenterY = 102.43

const defaultRingWidth = 220
const badgeFontSize = 90

type VultStakingBannerLogoProps = {
  /** Ring artwork width in px; the badge scales with it. Defaults to 220. */
  width?: number
}

/**
 * VULT staking banner artwork: the brand badge centred inside the glowing blue
 * concentric rings, anchored to the right edge of the banner (rings bleed
 * off-edge, matching the design).
 */
export const VultStakingBannerLogo = ({
  width = defaultRingWidth,
}: VultStakingBannerLogoProps = {}) => {
  const id = useId()
  const outerGlow = `${id}-outer-glow`
  const innerGlow = `${id}-inner-glow`
  const outerStroke = `${id}-outer-stroke`
  const innerStroke = `${id}-inner-stroke`

  return (
    <Graphic $width={width}>
      <Rings
        viewBox={`0 0 ${ringViewWidth} ${ringViewHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.6">
          <g filter={`url(#${outerGlow})`}>
            <circle
              cx={ringCenterX}
              cy={ringCenterY}
              r="72.6722"
              fill="white"
              fillOpacity="0.03"
            />
            <circle
              cx={ringCenterX}
              cy={ringCenterY}
              r="72.3861"
              stroke={`url(#${outerStroke})`}
              strokeWidth="0.572222"
            />
          </g>
          <g filter={`url(#${innerGlow})`}>
            <circle
              cx="101.5"
              cy="102.5"
              r="58.3556"
              stroke={`url(#${innerStroke})`}
              strokeWidth="2.28889"
            />
          </g>
        </g>
        <defs>
          <filter
            id={outerGlow}
            x="1.94528"
            y="3.09226"
            width="198.676"
            height="198.676"
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
            <feOffset />
            <feGaussianBlur stdDeviation="13.3328" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0509804 0 0 0 0 0.223529 0 0 0 0 0.694118 0 0 0 0.27 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="6.92389" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0509804 0 0 0 0 0.223529 0 0 0 0 0.694118 0 0 0 0.27 0"
            />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          </filter>
          <filter
            id={innerGlow}
            x="42"
            y="43"
            width="119"
            height="119"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="6.92389" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.294118 0 0 0 0 0.298039 0 0 0 0 0.615686 0 0 0 0.27 0"
            />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          </filter>
          <linearGradient
            id={outerStroke}
            x1={ringCenterX}
            y1="29.7578"
            x2={ringCenterX}
            y2="175.102"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4879FD" />
            <stop offset="1" stopColor="#0D39B1" />
          </linearGradient>
          <linearGradient
            id={innerStroke}
            x1="101.5"
            y1="43"
            x2="101.5"
            y2="162"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4879FD" />
            <stop offset="1" stopColor="#0D39B1" />
          </linearGradient>
        </defs>
      </Rings>
      <Badge style={{ fontSize: (badgeFontSize * width) / defaultRingWidth }} />
    </Graphic>
  )
}

const Graphic = styled.div<{ $width: number }>`
  position: absolute;
  right: -36px;
  top: 70%;
  transform: translateY(-50%);
  width: ${({ $width }) => $width}px;
  height: ${({ $width }) => ($width * ringViewHeight) / ringViewWidth}px;
  pointer-events: none;
`

const Rings = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
`

const Badge = styled(VultLogoIcon)`
  position: absolute;
  left: ${(ringCenterX / ringViewWidth) * 100}%;
  top: ${(ringCenterY / ringViewHeight) * 100}%;
  transform: translate(-50%, -50%);
`
