import { create } from '@bufbuild/protobuf'
import { getSolanaClient } from '@core/chain/chains/solana/client'
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
