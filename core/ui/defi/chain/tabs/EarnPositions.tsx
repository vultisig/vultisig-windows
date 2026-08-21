import { Chain } from '@vultisig/core-chain/Chain'

import { KaminoEarnView } from '../solana/kamino/KaminoEarnView'
import { useCurrentDefiChain } from '../useCurrentDefiChain'

/**
 * The Earn tab. Solana is the only chain that offers one today (Kamino Earn
 * vaults); the tab is not rendered for any other chain, so an unexpected chain
 * renders nothing rather than an empty surface.
 */
export const EarnPositions = () => {
  const chain = useCurrentDefiChain()

  return chain === Chain.Solana ? <KaminoEarnView /> : null
}
