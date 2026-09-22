import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { HSLA } from '@lib/ui/colors/HSLA'
import { getColor } from '@lib/ui/theme/getters'
import { KeyboardEvent, PointerEvent, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import {
  getLimitChartDomain,
  getLimitChartFraction,
  getLimitChartPlacement,
  getLimitChartValue,
} from './chartDomain'
import {
  getLimitChartReachColor,
  LimitChartReach,
  LimitChartReachColor,
} from './chartReach'
import {
  limitChartHeight,
  limitChartViewBoxSize as viewBoxSize,
} from './config'

/** How much one arrow-key press moves the target, as a share of the plot. */
const keyboardStepFraction = 0.01

type LimitPriceChartProps = {
  /** Pair-ratio history: buy units per sell unit. */
  points: MarketChartPoint[]
  /** Undefined while the pair's quote is still resolving; the history draws without it. */
  marketPrice: number | undefined
  /**
   * Where the rule is drawn: the typed target, or the market rate while the
   * price field is empty. Undefined when neither is known yet, in which case
   * only the history is drawn.
   */
  targetPrice: number | undefined
  /** The verdict for the drawn rule, which tints it; null when there is nothing to judge. */
  reach: LimitChartReach | null
  /** Formats a rate for assistive technology, in the pair's own units. */
  formatPrice: (rate: number) => string
  onTargetChange: (rate: number) => void
}

/**
 * Pair-ratio history with the target price drawn as a rule the user drags.
 *
 * The plot is fitted to the history and the market rate, never to the target,
 * so dragging cannot rescale it under the pointer. A target outside the plot
 * is pinned to the edge and drawn dashed rather than clamped — the price field
 * stays authoritative, and the chart never rewrites what was typed. The rule's
 * colour is the verdict's, the same one the caption under the chart is drawn
 * in, so the two can never disagree.
 */
export const LimitPriceChart = ({
  points,
  marketPrice,
  targetPrice,
  reach,
  formatPrice,
  onTargetChange,
}: LimitPriceChartProps) => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const gradientId = useId()
  const plotRef = useRef<HTMLDivElement>(null)

  const domain = getLimitChartDomain({ points, marketPrice })
  const toViewBoxY = (value: number) =>
    getLimitChartFraction({ value, domain }) * viewBoxSize

  const linePath = points
    .map(({ price }, index) => {
      const x =
        points.length > 1 ? (index / (points.length - 1)) * viewBoxSize : 0

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${toViewBoxY(price).toFixed(3)}`
    })
    .join(' ')
  const areaPath = `${linePath} L ${viewBoxSize} ${viewBoxSize} L 0 ${viewBoxSize} Z`

  // The theme colours behind the `Text` names of the same verdicts, so the rule
  // matches the caption drawn under it.
  const reachTint: Record<LimitChartReachColor, HSLA> = {
    success: colors.primary,
    danger: colors.danger,
    shy: colors.textShy,
  }
  const tint = reach
    ? reachTint[getLimitChartReachColor(reach)]
    : colors.textShy

  const placement =
    targetPrice === undefined
      ? null
      : getLimitChartPlacement({ value: targetPrice, domain })

  const dragTo = (clientY: number) => {
    const plot = plotRef.current
    if (!plot) return

    const { top, height } = plot.getBoundingClientRect()
    if (height <= 0) return

    const fraction = Math.min(1, Math.max(0, (clientY - top) / height))
    const next = getLimitChartValue({ fraction, domain })

    if (next > 0) {
      onTargetChange(next)
    }
  }

  const nudge = (direction: number) => {
    if (targetPrice === undefined) return

    const step = (domain.max - domain.min) * keyboardStepFraction
    const next = targetPrice + direction * step

    if (next > 0) {
      onTargetChange(next)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return

    event.preventDefault()
    nudge(event.key === 'ArrowUp' ? 1 : -1)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragTo(event.clientY)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

    dragTo(event.clientY)
  }

  return (
    <Plot ref={plotRef}>
      <Svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={colors.primaryAlt.toCssValue()}
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor={colors.primaryAlt.toCssValue()}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={colors.primaryAlt.toCssValue()}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      {placement && targetPrice !== undefined ? (
        <>
          <TargetRule
            style={{
              top: `${placement.fraction * 100}%`,
              borderTopColor: tint.toCssValue(),
              borderTopStyle: placement.offScale ? 'dashed' : 'solid',
            }}
          />
          <DragHandle
            role="slider"
            tabIndex={0}
            aria-label={t('swap_limit_chart_drag_label')}
            aria-orientation="vertical"
            aria-valuemin={domain.min}
            aria-valuemax={domain.max}
            // The pinned value, so it never contradicts the declared range;
            // the real target, off-scale or not, is what `aria-valuetext`
            // reads out.
            aria-valuenow={getLimitChartValue({
              fraction: placement.fraction,
              domain,
            })}
            aria-valuetext={formatPrice(targetPrice)}
            style={{ top: `${placement.fraction * 100}%` }}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={event =>
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          />
        </>
      ) : null}
    </Plot>
  )
}

const Plot = styled.div`
  position: relative;
  width: 100%;
  height: ${limitChartHeight}px;
`

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
`

const TargetRule = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px solid transparent;
  pointer-events: none;
`

// The rule's hit area: tall enough to grab, drawn as nothing so the rule
// itself is the handle.
const DragHandle = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  transform: translateY(-50%);
  cursor: ns-resize;
  touch-action: none;

  &:focus-visible {
    outline: 1px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`
