import { create } from '@bufbuild/protobuf'
import { OtherChain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getSplAssociatedAccount } from '@core/chain/chains/solana/spl/getSplAssociatedAccount'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { address } from '@solana/web3.js'

import {
  SolanaSpecific,
  SolanaSpecificSchema,
} from '../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getSolanaChainSpecific: GetChainSpecificResolver<
  'solanaSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<OtherChain.Solana>(keysignPayload)
  const receiver = shouldBePresent(keysignPayload.toAddress)
  const client = getSolanaClient()

  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  const prioritizationFees = await client
    .getRecentPrioritizationFees([address(coin.address)])
    .send()

  const highPriorityFee =
    Math.max(
      ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
      solanaConfig.priorityFeeLimit
    ) + solanaConfig.baseFee

  const result: SolanaSpecific = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
  })

  if (coin.id) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: coin.id,
    })
    result.fromTokenAssociatedAddress = fromAccount.address
    const { data } = await attempt(
      getSplAssociatedAccount({
        account: receiver,
        token: coin.id,
      })
    )
    if (data) {
      result.toTokenAssociatedAddress = data.address
      result.programId = data.isToken2022
    }
  }

  return result
}
