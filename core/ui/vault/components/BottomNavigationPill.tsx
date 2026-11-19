import { borderRadius } from '@lib/ui/css/borderRadius'
import {
  motion,
  MotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import styled from 'styled-components'

/** How much wider the pill grows halfway between two tabs. */
const pillStretch = 0.35
/** How much flatter it gets there, so the stretch reads as liquid. */
const pillSquash = 0.12

type BottomNavigationPillProps = {
  /** Fractional tab index the pill sits on; whole numbers at rest. */
  indicator: MotionValue<number>
  tabCount: number
  /** Space between neighbouring tabs, in px. */
  tabGap?: number
}

/** The selected-tab highlight; it stretches like liquid as it slides between tabs. */
export const BottomNavigationPill = ({
  indicator,
  tabCount,
  tabGap = 0,
}: BottomNavigationPillProps) => {
  const shouldReduceMotion = useReducedMotion() === true
  const tabShare = 100 / tabCount
  const gapShare = tabGap / tabCount
  const tabWidth = `(${tabShare}% - ${(tabCount - 1) * gapShare}px)`
  const stretch = useTransform(indicator, value =>
    shouldReduceMotion ? 0 : Math.sin(Math.PI * (value - Math.floor(value)))
  )
  const left = useTransform(() => {
    const index = indicator.get()
    const shift = (pillStretch * stretch.get()) / 2
    return `calc(${index * tabShare}% + ${index * gapShare}px - ${tabWidth} * ${shift})`
  })
  const width = useTransform(
    stretch,
    value => `calc(${tabWidth} * ${1 + pillStretch * value})`
  )
  const scaleY = useTransform(stretch, value => 1 - pillSquash * value)

  return <Pill aria-hidden style={{ left, width, scaleY }} />
}

const Pill = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  ${borderRadius.pill};
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
`
