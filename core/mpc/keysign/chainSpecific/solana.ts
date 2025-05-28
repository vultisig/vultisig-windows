import { create } from '@bufbuild/protobuf'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getSplAssociatedAccount } from '@core/chain/chains/solana/spl/getSplAssociatedAccount'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import {
  SolanaSpecific,
  SolanaSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { Address } from '@solana/web3.js'

import { ChainSpecificResolver } from './ChainSpecificResolver'

/// Base fee in lamports
// regardless of its complexity Solana charges a fixed base transaction fee of 5000 lamports per transaction.
// This base fee is separate from the priority fee.

const SOLANA_BASE_FEE = 5000 // 0.000005 SOL

export const getSolanaSpecific: ChainSpecificResolver<SolanaSpecific> = async ({
  coin,
  receiver,
}) => {
  const client = getSolanaClient()

  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  const prioritizationFees = await client
    .getRecentPrioritizationFees([coin.address as Address])
    .send()

  const highPriorityFee = Math.max(
    ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
    solanaConfig.priorityFeeLimit
  )

  const totalFee = SOLANA_BASE_FEE + highPriorityFee

  const result = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: totalFee.toString(),
  })

  if (!isFeeCoin(coin)) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: coin.id,
    })
    result.fromTokenAssociatedAddress = fromAccount.address
    const toAccount = await attempt(
      getSplAssociatedAccount({
        account: shouldBePresent(receiver),
        token: coin.id,
      })
    )
    if (toAccount.data) {
      result.toTokenAssociatedAddress = toAccount.data.address
      result.programId = toAccount.data.isToken2022
    }
  }

  return result
}
