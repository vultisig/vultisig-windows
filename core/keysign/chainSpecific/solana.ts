import { create } from '@bufbuild/protobuf'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { getSplAssociatedAccount } from '@core/chain/chains/solana/spl/getSplAssociatedAccount'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import {
  SolanaSpecific,
  SolanaSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { asyncAttempt } from '@lib/utils/promise/asyncAttempt'
import { Address } from '@solana/web3.js'

import { ChainSpecificResolver } from './ChainSpecificResolver'

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
    0
  )

  const result = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
  })

  if (!isFeeCoin(coin)) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: coin.id,
    })
    const toAccount = await asyncAttempt(
      () =>
        getSplAssociatedAccount({
          account: shouldBePresent(receiver),
          token: coin.id,
        }),
      undefined
    )
    result.toTokenAssociatedAddress = toAccount?.address
    result.fromTokenAssociatedAddress = fromAccount.address
    result.programId = toAccount?.isToken2022
  }

  return result
}
