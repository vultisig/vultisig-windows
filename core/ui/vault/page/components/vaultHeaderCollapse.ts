import { useScroll } from '@lib/ui/hooks/useScroll'
import { RefObject } from 'react'

const collapseDistance = 100

/**
 * 0…1 progress of the vault page header collapse, driven by the vault
 * overview scroll position over roughly the height of the large
 * balance block, so the crossfade completes as the balance slides
 * under the header.
 */
export const useVaultHeaderCollapseProgress = (
  scrollContainerRef: RefObject<HTMLElement>
) => {
  const { y } = useScroll(scrollContainerRef)
  return Math.min(Math.max(y, 0) / collapseDistance, 1)
}

/**
 * Opacity of the large in-content balance: fades out over the first
 * half of the collapse, before the header balance starts fading in,
 * so the amount is never legible twice at once.
 */
export const getContentBalanceOpacity = (progress: number) =>
  Math.max(1 - progress * 2, 0)

/**
 * Opacity of the collapsed header: fades in over the second half of
 * the collapse, after the content balance has fully faded out.
 */
export const getCollapsedHeaderOpacity = (progress: number) =>
  Math.max(progress * 2 - 1, 0)
