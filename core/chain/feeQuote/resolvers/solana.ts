import { getSolanaClient } from '@core/chain/chains/solana/client'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { address } from '@solana/web3.js'

import { FeeQuoteResolver } from '../resolver'

export const getSolanaFeeQuote: FeeQuoteResolver<'solana'> = async ({
  coin,
}) => {
  const client = getSolanaClient()
  const prioritizationFees = await client
    .getRecentPrioritizationFees([address(coin.address)])
    .send()

  const highPriorityFee =
    Math.max(
      ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
      solanaConfig.priorityFeeLimit
    ) + solanaConfig.baseFee

  return { priorityFee: BigInt(highPriorityFee) }
}
