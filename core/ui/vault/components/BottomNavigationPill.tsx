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
}

export const BottomNavigationPill = ({
  indicator,
  tabCount,
}: BottomNavigationPillProps) => {
  const shouldReduceMotion = useReducedMotion() === true
  const tabShare = 100 / tabCount
  const stretch = useTransform(indicator, value =>
    shouldReduceMotion ? 0 : Math.sin(Math.PI * (value - Math.floor(value)))
  )
  const left = useTransform(
    () => `${(indicator.get() - (pillStretch * stretch.get()) / 2) * tabShare}%`
  )
  const width = useTransform(
    stretch,
    value => `${tabShare * (1 + pillStretch * value)}%`
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
