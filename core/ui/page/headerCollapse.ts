import { useScroll } from '@lib/ui/hooks/useScroll'
import { RefObject } from 'react'

const collapseDistance = 100

const contentBalanceFadeEnd = 0.5
const normalHeaderFadeEnd = 0.75

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)

/**
 * 0…1 progress of a page header collapse, driven by the page's scroll
 * position over roughly the height of the large balance block, so the
 * handoff completes as that balance slides under the header.
 */
export const useHeaderCollapseProgress = (
  scrollContainerRef: RefObject<HTMLElement>
) => {
  const { y } = useScroll(scrollContainerRef)

  return clamp(y / collapseDistance)
}

/**
 * Opacity of the large in-content balance. It fades out over the first half
 * of the collapse, before anything in the header starts to move, so the
 * amount is never legible in two places at once.
 */
export const getContentBalanceOpacity = (progress: number) =>
  clamp((contentBalanceFadeEnd - progress) / contentBalanceFadeEnd)

/**
 * Opacity of the expanded header. It fades out over the third quarter, once
 * the content balance is gone and before the collapsed header appears.
 */
export const getNormalHeaderOpacity = (progress: number) =>
  clamp(
    (normalHeaderFadeEnd - progress) /
      (normalHeaderFadeEnd - contentBalanceFadeEnd)
  )

/**
 * Opacity of the collapsed header. It only starts once the expanded header
 * has fully faded out, so the vault name is never drawn twice in two
 * different places. The two headers therefore hand over at a single point
 * rather than crossfading through each other.
 */
export const getCollapsedHeaderOpacity = (progress: number) =>
  clamp((progress - normalHeaderFadeEnd) / (1 - normalHeaderFadeEnd))

/**
 * Which of the two stacked header layers should receive clicks. Exactly one
 * is ever interactive, and never the one that is fading out.
 */
export const isHeaderCollapsed = (progress: number) =>
  progress >= normalHeaderFadeEnd
