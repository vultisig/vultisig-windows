import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { address as solAddress } from '@solana/web3.js'

import { getSolanaClient } from '../../../../chains/solana/client'
import { solanaConfig } from '../../../../chains/solana/solanaConfig'

export type GetSolanaFeeQuoteInput = {
  sender: string
}

export const getSolanaFeeQuote = async ({ sender }: GetSolanaFeeQuoteInput) => {
  const client = getSolanaClient()
  const prioritizationFees = await client
    .getRecentPrioritizationFees([solAddress(sender)])
    .send()

  return (
    bigIntMax(
      ...prioritizationFees.map(({ prioritizationFee }) =>
        BigInt(prioritizationFee.valueOf())
      ),
      solanaConfig.priorityFeeLimit
    ) + solanaConfig.baseFee
  )
}
