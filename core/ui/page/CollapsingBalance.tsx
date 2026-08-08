import { ChildrenProp } from '@lib/ui/props'
import { RefObject } from 'react'

import {
  getContentBalanceOpacity,
  useHeaderCollapseProgress,
} from './headerCollapse'

type CollapsingBalanceProps = ChildrenProp & {
  scrollContainerRef: RefObject<HTMLElement>
}

/**
 * Wraps the large in-content balance so it fades out with scroll as the
 * collapsed header balance takes over. Holds the scroll state itself so the
 * rest of the page doesn't re-render per scroll frame, and drops pointer
 * events once hidden so the balance visibility toggle can't intercept clicks
 * it can no longer show.
 */
export const CollapsingBalance = ({
  scrollContainerRef,
  children,
}: CollapsingBalanceProps) => {
  const progress = useHeaderCollapseProgress(scrollContainerRef)
  const opacity = getContentBalanceOpacity(progress)

  return (
    <div style={{ opacity, pointerEvents: opacity === 0 ? 'none' : 'auto' }}>
      {children}
    </div>
  )
}
