import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import {
  findThorchainMemoAssetSeparatorIndex,
  getThorchainMemoAssetChain,
} from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

type GetLimitOrderBuyCoinInput = {
  /**
   * THORChain asset notation from the memo — `THOR.RUNE`, `ETH.USDC-06EB48`, or
   * a secured `ETH-USDC-0xa0b8…`.
   */
  targetAsset: string
}

/**
 * Resolve the buy side of a limit order to a real coin, for its icon and price.
 *
 * The chain is read off the asset itself rather than taken from the caller: the
 * prefix ends at the first separator of any flavour, and a caller that split on
 * `.` would hand over `undefined` for every secured asset. One derivation means
 * the coin and the ticker beside it cannot disagree about which asset this is.
 *
 * The contract segment is matched by suffix, which covers both spellings the
 * memo uses: an L1 token carries only the last six characters of its address
 * (`ETH.USDC-06EB48`), while a secured denom carries the whole thing. Matching
 * on that tail is the inverse of how the memo was built.
 *
 * Returns `undefined` rather than guessing when the asset can't be resolved
 * confidently. This renders a co-signer review, so an unresolved asset must
 * degrade to plain text: showing the wrong coin's logo and fiat price is worse
 * than showing neither, because it is the wrong information presented as
 * verified.
 */
export const getLimitOrderBuyCoin = ({
  targetAsset,
}: GetLimitOrderBuyCoinInput): Coin | undefined => {
  const separatorIndex = findThorchainMemoAssetSeparatorIndex(targetAsset)
  if (separatorIndex === -1) {
    return undefined
  }

  const targetChain = getThorchainMemoAssetChain(targetAsset)
  if (!targetChain) {
    return undefined
  }

  const symbol = targetAsset.slice(separatorIndex + 1)
  if (!symbol) {
    return undefined
  }

  const [ticker, ...contractSegments] = symbol.split('-')
  const contract = contractSegments.join('-')

  if (contract) {
    return knownTokens[targetChain]?.find(
      token =>
        !!token.id &&
        token.id.toUpperCase().endsWith(contract.toUpperCase()) &&
        token.ticker.toUpperCase() === ticker.toUpperCase()
    )
  }

  const feeCoin = chainFeeCoin[targetChain]
  if (feeCoin.ticker.toUpperCase() === ticker.toUpperCase()) {
    return feeCoin
  }

  return knownTokens[targetChain]?.find(
    token => token.ticker.toUpperCase() === ticker.toUpperCase()
  )
}
