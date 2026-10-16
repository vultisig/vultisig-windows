import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { MotionValue, motionValue } from 'framer-motion'

import { HomeTab } from './homeTab'

/** Motion values, so a slide or scroll restyles followers without re-rendering React. */
type HomeMotion = {
  /** Pager travel in pages: `0` on Wallet, `1` on DeFi, fractional between. */
  position: MotionValue<number>
  /** Each page's vertical scroll offset in px. */
  scrollY: Record<HomeTab, MotionValue<number>>
  /** Each page's scroll container, once mounted. */
  scrollContainers: Map<HomeTab, HTMLElement>
}

/** Fresh motion state for a home mounted on `tabIndex`. */
export const createHomeMotion = (tabIndex: number): HomeMotion => ({
  position: motionValue(tabIndex),
  scrollY: { wallet: motionValue(0), defi: motionValue(0) },
  scrollContainers: new Map(),
})

export const [HomeMotionProvider, useHomeMotion] =
  setupValueProvider<HomeMotion>('HomeMotion')
