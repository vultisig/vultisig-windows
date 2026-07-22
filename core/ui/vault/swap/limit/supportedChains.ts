import { Chain } from '@vultisig/core-chain/Chain'
import {
  getThorchainInboundAddress,
  ThorchainInboundAddress,
} from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import {
  isThorchainRoutable,
  thorchainAssetPrefixToChain,
} from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

/** Every chain the memo builder can encode, ignoring live network state. */
export const staticLimitSwapSupportedChains =
  Object.values(Chain).filter(isThorchainRoutable)

/**
 * Chains a limit order can currently be placed from or to.
 *
 * THORChain itself is always included — RUNE settles via `MsgDeposit` and so has
 * no inbound vault to advertise. Everything else must have a live inbound that
 * is neither halted nor trading-paused, mirroring the market swap's halt gate;
 * absent pause flags read as "not paused".
 *
 * When the inbound list yields nothing usable we fall back to the static
 * routable set rather than returning just THORChain: an empty picker reads as
 * "this pair is unsupported" when the real problem is a failed fetch. The
 * placement path re-checks halts at sign time, so a stale entry here cannot get
 * a halted-chain order signed.
 */
export const getLimitSwapSupportedChains = (
  inbounds: ThorchainInboundAddress[]
): Chain[] => {
  const chains = new Set<Chain>([Chain.THORChain])

  inbounds.forEach(
    ({ chain, halted, global_trading_paused, chain_trading_paused }) => {
      if (halted || global_trading_paused || chain_trading_paused) {
        return
      }

      const supported = thorchainAssetPrefixToChain[chain.trim().toUpperCase()]
      if (supported) {
        chains.add(supported)
      }
    }
  )

  return chains.size > 1 ? [...chains] : staticLimitSwapSupportedChains
}

/** Fetches the live inbound list and reduces it to the currently routable chains. */
export const fetchLimitSwapSupportedChains = async (): Promise<Chain[]> => {
  const inbounds = await withFallback<ThorchainInboundAddress[]>(
    attempt(getThorchainInboundAddress),
    []
  )

  return getLimitSwapSupportedChains(inbounds)
}
