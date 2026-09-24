import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { Chain } from '@vultisig/core-chain/Chain'

/**
 * Chains whose balance the seedphrase scan could not read, so the scan
 * result can tell the user to check and select them manually.
 */
export const [UnscannedChainsProvider, useUnscannedChains] =
  setupStateProvider<Chain[]>('UnscannedChains')
