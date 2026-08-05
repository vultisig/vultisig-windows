import { useId } from 'react'
import styled, { keyframes, useTheme } from 'styled-components'

const viewBoxSize = 100
const chartHeight = 168

// Fixed shape drawn while the first series loads, so the card reserves its
// final size instead of collapsing to a spinner.
const placeholderShape = [
  0.3, 0.46, 0.38, 0.55, 0.48, 0.68, 0.58, 0.74, 0.66, 0.85,
]

/**
 * Pulsing placeholder for the price chart while the first series loads.
 * Draws a neutral static line with the same footprint as the real chart.
 */
export const CoinPriceChartPlaceholder = () => {
  const gradientId = useId()
  const { colors } = useTheme()
  const color = colors.foregroundSuper.toCssValue()

  const linePath = placeholderShape
    .map(
      (value, index) =>
        `${index === 0 ? 'M' : 'L'} ${((index / (placeholderShape.length - 1)) * viewBoxSize).toFixed(3)} ${((1 - value) * viewBoxSize).toFixed(3)}`
    )
    .join(' ')

  const areaPath = `${linePath} L ${viewBoxSize} ${viewBoxSize} L 0 ${viewBoxSize} Z`

  return (
    <Container>
      <Svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </Container>
  )
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`

const Container = styled.div`
  width: 100%;
  height: ${chartHeight}px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
`
