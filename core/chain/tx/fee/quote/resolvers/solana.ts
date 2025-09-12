import { getSolanaClient } from '../../../../chains/solana/client'
import { solanaConfig } from '../../../../chains/solana/solanaConfig'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'
import { address as solAddress } from '@solana/web3.js'

export const getSolanaFeeQuote: FeeQuoteResolver<'Solana'> = async (
  input: FeeQuoteInput<'Solana'>
): Promise<FeeQuote<'solana'>> => {
  const client = getSolanaClient()
  const prioritizationFees = await client
    .getRecentPrioritizationFees([solAddress(input.coin.address)])
    .send()

  const highPriorityFee =
    Math.max(
      ...prioritizationFees.map((f: any) =>
        Number(f.prioritizationFee.valueOf())
      ),
      solanaConfig.priorityFeeLimit
    ) + solanaConfig.baseFee

  return BigInt(highPriorityFee)
}
