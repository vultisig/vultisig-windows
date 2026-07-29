import { useRippleTrustLineCostQuery } from '@core/ui/chain/coin/ripple/queries/useRippleTrustLineCostQuery'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

const xrp = chainFeeCoin[Chain.Ripple]

/**
 * What opening a trust line costs in XRP, for the Open Trust Line form.
 *
 * The cost is the owner-reserve increment the line locks up plus the fee the
 * TrustSet burns. Below that the transaction fails on-ledger with
 * `tecINSUFFICIENT_RESERVE` *after* the signing ceremony, with the fee already
 * spent — so the form blocks first rather than letting the user co-sign
 * something the ledger will reject.
 *
 * `undefined` while the cost is unknown, so a pending lookup never blocks the
 * form on a number it does not have yet.
 */
export const useRippleTrustLineCostXrp = (enabled: boolean) => {
  const { data } = useRippleTrustLineCostQuery(enabled)

  if (!enabled || !data) {
    return undefined
  }

  return fromChainAmount(data.ownerReserveDrops + data.feeDrops, xrp.decimals)
}
