import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { HSLA } from '@lib/ui/colors/HSLA'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { KeyboardEvent, PointerEvent, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import {
  getLimitPriceWarning,
  getPresetPrice,
  LimitPriceWarning,
} from '../price'
import {
  getLimitChartDomain,
  getLimitChartFraction,
  getLimitChartPlacement,
  getLimitChartValue,
  limitChartGuidePresets,
} from './chartDomain'
import {
  limitChartHeight,
  limitChartViewBoxSize as viewBoxSize,
} from './config'

/** How much one arrow-key press moves the target, as a share of the plot. */
const keyboardStepFraction = 0.01

/** Marks a target the plot could not fit, and which way it ran off. */
const offScaleMarker = { above: '▲', below: '▼' }

type LimitPriceChartProps = {
  /** Pair-ratio history: buy units per sell unit. */
  points: MarketChartPoint[]
  marketPrice: number
  /** The form's target rate, or null while the price field is empty. */
  targetPrice: number | null
  /** Formats a rate for the target's label, in the pair's own units. */
  formatPrice: (rate: number) => string
  onTargetChange: (rate: number) => void
}

/**
 * Pair-ratio history with the target price drawn as a rule the user drags.
 *
 * The plot is anchored on the market rate, so the axis holds still while the
 * target moves through it. A target outside the axis is pinned to the edge and
 * labelled with an arrow rather than clamped — the price field stays
 * authoritative, and the chart never rewrites what was typed. The target's tint
 * comes from `getLimitPriceWarning`, the same call the form's advisory row
 * makes, so the two can never disagree.
 */
export const LimitPriceChart = ({
  points,
  marketPrice,
  targetPrice,
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

  const warningTint: Record<LimitPriceWarning, HSLA> = {
    atOrBelowMarket: colors.danger,
    farAboveMarket: colors.idle,
  }
  const warning =
    targetPrice === null
      ? undefined
      : getLimitPriceWarning({ price: targetPrice, marketPrice })
  const tint = (() => {
    if (targetPrice === null) return colors.textShy

    return warning ? warningTint[warning] : colors.primary
  })()

  const marketFraction = getLimitChartPlacement({
    value: marketPrice,
    domain,
  }).fraction
  const target =
    targetPrice === null
      ? null
      : getLimitChartPlacement({ value: targetPrice, domain })
  const handleFraction = target ? target.fraction : marketFraction

  const guides = limitChartGuidePresets
    .map(preset =>
      getLimitChartFraction({
        value: getPresetPrice({ marketPrice, preset }),
        domain,
      })
    )
    .filter(fraction => fraction >= 0 && fraction <= 1)

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
    const step = (domain.max - domain.min) * keyboardStepFraction
    const next = (targetPrice ?? marketPrice) + direction * step

    if (next > 0) {
      onTargetChange(next)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = { ArrowUp: 1, ArrowDown: -1 }[event.key]
    if (direction === undefined) return

    event.preventDefault()
    nudge(direction)
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
              stopColor={colors.textShy.toCssValue()}
              stopOpacity={0.28}
            />
            <stop
              offset="100%"
              stopColor={colors.textShy.toCssValue()}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={colors.textSupporting.toCssValue()}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      {guides.map(fraction => (
        <GuideRule key={fraction} style={{ top: `${fraction * 100}%` }} />
      ))}

      {target && !target.offScale ? (
        <Band
          style={{
            top: `${Math.min(handleFraction, marketFraction) * 100}%`,
            height: `${Math.abs(handleFraction - marketFraction) * 100}%`,
            background: tint.withAlpha(0.14).toCssValue(),
          }}
        />
      ) : null}

      <MarketRule style={{ top: `${marketFraction * 100}%` }} />

      <TargetRule
        style={{
          top: `${handleFraction * 100}%`,
          borderTopColor: tint.toCssValue(),
          borderTopStyle: target?.offScale ? 'dashed' : 'solid',
        }}
      />

      {targetPrice === null ? null : (
        <TargetLabel
          style={{
            top: `${handleFraction * 100}%`,
            background: tint.withAlpha(0.16).toCssValue(),
          }}
        >
          <Text size={11} weight={600} as="span" color="contrast">
            {target?.offScale
              ? `${offScaleMarker[target.offScale]} ${formatPrice(targetPrice)}`
              : formatPrice(targetPrice)}
          </Text>
        </TargetLabel>
      )}

      <DragHandle
        role="slider"
        tabIndex={0}
        aria-label={t('swap_limit_chart_drag_label')}
        aria-orientation="vertical"
        aria-valuemin={domain.min}
        aria-valuemax={domain.max}
        aria-valuenow={targetPrice ?? marketPrice}
        aria-valuetext={formatPrice(targetPrice ?? marketPrice)}
        style={{ top: `${handleFraction * 100}%` }}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={event =>
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      >
        <HandleGrip style={{ background: tint.toCssValue() }} />
      </DragHandle>
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

const Rule = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  pointer-events: none;
`

const GuideRule = styled(Rule)`
  border-top: 1px dotted ${getColor('foregroundSuper')};
`

const MarketRule = styled(Rule)`
  border-top: 1px dashed ${getColor('textShy')};
`

const TargetRule = styled(Rule)`
  border-top: 2px solid transparent;
`

const Band = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
`

const TargetLabel = styled.div`
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  padding: 2px 6px;
  ${borderRadius.xs};
  pointer-events: none;
  white-space: nowrap;
`

const DragHandle = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  cursor: ns-resize;
  touch-action: none;

  &:focus-visible {
    outline: 1px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

const HandleGrip = styled.div`
  width: 22px;
  height: 4px;
  ${borderRadius.pill};
`
