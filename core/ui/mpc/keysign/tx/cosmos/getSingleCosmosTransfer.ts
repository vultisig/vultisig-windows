import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'

import { CosmosSignDataReview } from './getCosmosSignDataReview'

type GetSingleCosmosTransferInput = {
  review: CosmosSignDataReview
  coin: CoinKey
}

/**
 * Returns the only transfer of fully summarized sign data when it names a
 * recipient and moves the given coin, so a single-amount view can show it.
 * Returns `undefined` for anything a single amount can't describe.
 */
export const getSingleCosmosTransfer = ({
  review,
  coin,
}: GetSingleCosmosTransferInput) => {
  const { chain, transfers, hasUnsummarizedMessages } = review
  if (hasUnsummarizedMessages || transfers.length !== 1) return undefined

  const [{ recipient, coin: signedCoin }] = transfers
  const denom = coin.id ?? cosmosFeeCoinDenom[chain]
  if (!recipient || signedCoin.denom !== denom) return undefined

  return { recipient, amount: signedCoin.amount }
}
