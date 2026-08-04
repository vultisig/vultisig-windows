import { RefObject } from 'react'

import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import {
  getContentBalanceOpacity,
  useVaultHeaderCollapseProgress,
} from './vaultHeaderCollapse'

type CollapsingVaultBalanceProps = {
  scrollContainerRef: RefObject<HTMLElement>
}

/**
 * The large vault balance that fades out with scroll as the collapsed
 * header balance takes over. Holds the scroll state itself so the rest
 * of the overview doesn't re-render on scroll, and disables pointer
 * events once hidden so the balance visibility toggle can't intercept
 * clicks.
 */
export const CollapsingVaultBalance = ({
  scrollContainerRef,
}: CollapsingVaultBalanceProps) => {
  const progress = useVaultHeaderCollapseProgress(scrollContainerRef)
  const opacity = getContentBalanceOpacity(progress)

  return (
    <div style={{ opacity, pointerEvents: opacity === 0 ? 'none' : 'auto' }}>
      <VaultTotalBalance />
    </div>
  )
}
