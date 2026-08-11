import {
  getMarketChartPriceDomain,
  MarketChartPoint,
} from '@core/ui/chain/coin/price/market/marketChart'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import { motion } from 'framer-motion'
import { useId } from 'react'
import styled from 'styled-components'

import { chartHeight, chartViewBoxSize as viewBoxSize } from './config'

type CoinPriceChartGraphProps = {
  points: MarketChartPoint[]
  color: string
  scrubIndex: number | null
  onScrubChange: (index: number | null) => void
}

type ChartFraction = {
  x: number
  y: number
}

const getFractions = (points: MarketChartPoint[]): ChartFraction[] => {
  const [domainMin, domainMax] = getMarketChartPriceDomain(points)
  const domainSpan = domainMax - domainMin

  return points.map(({ price }, index) => ({
    x: points.length > 1 ? index / (points.length - 1) : 0,
    y: (domainMax - price) / domainSpan,
  }))
}

const toLinePath = (fractions: ChartFraction[]): string =>
  fractions
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? 'M' : 'L'} ${(x * viewBoxSize).toFixed(3)} ${(y * viewBoxSize).toFixed(3)}`
    )
    .join(' ')

const toAreaPath = (fractions: ChartFraction[]): string =>
  `${toLinePath(fractions)} L ${viewBoxSize} ${viewBoxSize} L 0 ${viewBoxSize} Z`

/**
 * The SVG line + area of the coin-detail price chart, with hover/drag
 * scrubbing. The series is resampled to a fixed point count upstream, so a
 * range switch morphs the path in place instead of redrawing it. Pointer
 * events are captured so scrubbing doesn't fight the drawer's
 * drag-to-dismiss gesture on touch devices.
 */
export const CoinPriceChartGraph = ({
  points,
  color,
  scrubIndex,
  onScrubChange,
}: CoinPriceChartGraphProps) => {
  const gradientId = useId()
  const fractions = getFractions(points)
  const linePath = toLinePath(fractions)
  const areaPath = toAreaPath(fractions)

  const scrubFraction = scrubIndex === null ? null : fractions[scrubIndex]

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect()
    if (width <= 0 || points.length === 0) return

    const position = ((event.clientX - left) / width) * (points.length - 1)
    if (!Number.isFinite(position)) return

    const index = Math.min(points.length - 1, Math.max(0, Math.round(position)))
    onScrubChange(index)
  }

  return (
    <Container
      onPointerDown={event => {
        event.stopPropagation()
        event.currentTarget.setPointerCapture(event.pointerId)
        handlePointer(event)
      }}
      onPointerMove={handlePointer}
      onPointerUp={event => {
        event.currentTarget.releasePointerCapture(event.pointerId)
        onScrubChange(null)
      }}
      onPointerLeave={() => onScrubChange(null)}
      onPointerCancel={() => onScrubChange(null)}
    >
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
        <motion.path
          initial={false}
          animate={{ d: areaPath }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
        <motion.path
          initial={false}
          animate={{ d: linePath, stroke: color }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      {scrubFraction ? (
        <>
          <ScrubLine style={{ left: `${scrubFraction.x * 100}%` }} />
          <ScrubDot
            style={{
              left: `${scrubFraction.x * 100}%`,
              top: `${scrubFraction.y * 100}%`,
              background: color,
            }}
          />
        </>
      ) : null}
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: ${chartHeight}px;
  touch-action: none;
  cursor: crosshair;
`

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
`

const ScrubLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px dashed ${getColor('textShy')};
  opacity: 0.5;
  pointer-events: none;
`

const ScrubDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  ${borderRadius.pill};
  transform: translate(-50%, -50%);
  pointer-events: none;
`
