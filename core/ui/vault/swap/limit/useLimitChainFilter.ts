import { Chain } from '@vultisig/core-chain/Chain'
import { isThorchainRoutable } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { useLimitSwapSupportedChainsQuery } from './queries/useLimitSwapSupportedChainsQuery'

/**
 * Chain predicate for the limit form's coin pickers.
 *
 * Narrows to THORChain's live inbound set once it resolves, so a halted chain is
 * never offered in the first place instead of being picked and then rejected by
 * the placement gate. Falls back to the static routable set while the fetch is
 * in flight — an unfiltered picker would offer chains whose memo cannot even be
 * encoded. A pair already selected on a halted chain (the market tab shares this
 * state) still needs the inline notice: filtering the picker cannot un-pick it.
 */
export const useLimitChainFilter = () => {
  const { data: supportedChains } = useLimitSwapSupportedChainsQuery()

  return (chain: Chain) =>
    supportedChains
      ? isOneOf(chain, supportedChains)
      : isThorchainRoutable(chain)
}
