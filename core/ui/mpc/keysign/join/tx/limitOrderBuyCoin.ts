import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'

type GetLimitOrderBuyCoinInput = {
  /** THORChain asset notation from the memo, e.g. `THOR.RUNE`, `ETH.USDC-06EB48`. */
  targetAsset: string
  /** The decoded chain, absent when the asset prefix isn't THORChain-routable. */
  targetChain?: Chain
}

/**
 * Resolve the buy side of a limit order to a real coin, for its icon and price.
 *
 * The memo only carries THORChain asset notation, and for L1 tokens that is an
 * *abbreviated* contract — `ETH.USDC-06EB48` is the last six characters of the
 * real address. Matching on that suffix is the inverse of how the memo was
 * built.
 *
 * Returns `undefined` rather than guessing when the asset can't be resolved
 * confidently. This renders a co-signer review, so an unresolved asset must
 * degrade to plain text: showing the wrong coin's logo and fiat price is worse
 * than showing neither, because it is the wrong information presented as
 * verified.
 */
export const getLimitOrderBuyCoin = ({
  targetAsset,
  targetChain,
}: GetLimitOrderBuyCoinInput): Coin | undefined => {
  if (!targetChain) {
    return undefined
  }

  const [, symbol] = targetAsset.split('.')
  if (!symbol) {
    return undefined
  }

  const [ticker, contractSuffix] = symbol.split('-')

  if (contractSuffix) {
    return knownTokens[targetChain]?.find(
      token =>
        !!token.id &&
        token.id.toUpperCase().endsWith(contractSuffix.toUpperCase()) &&
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
