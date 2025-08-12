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
import { address } from '@solana/web3.js'

import { ChainSpecificResolver } from '../resolver'

export const getSolanaSpecific: ChainSpecificResolver<SolanaSpecific> = async ({
  coin,
  receiver,
}) => {
  const client = getSolanaClient()

  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  const prioritizationFees = await client
    .getRecentPrioritizationFees([address(coin.address)])
    .send()

  // regardless of its complexity Solana charges a fixed base transaction fee of 5000 lamports per transaction.
  const highPriorityFee =
    Math.max(
      ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
      solanaConfig.priorityFeeLimit
    ) + solanaConfig.baseFee

  const result = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
  })

  if (!isFeeCoin(coin)) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: shouldBePresent(coin.id),
    })
    result.fromTokenAssociatedAddress = fromAccount.address
    const toAccount = await attempt(
      getSplAssociatedAccount({
        account: shouldBePresent(receiver),
        token: shouldBePresent(coin.id),
      })
    )
    if (toAccount.data) {
      result.toTokenAssociatedAddress = toAccount.data.address
      result.programId = toAccount.data.isToken2022
    }
  }

  return result
}
