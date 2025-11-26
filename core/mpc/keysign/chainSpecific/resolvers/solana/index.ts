import { create } from '@bufbuild/protobuf'
import { OtherChain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { getSplAssociatedAccount } from '@core/chain/chains/solana/spl/getSplAssociatedAccount'
import { SolanaSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { refineSolanaChainSpecific } from './refine'

export const getSolanaChainSpecific: GetChainSpecificResolver<
  'solanaSpecific'
> = async ({ keysignPayload, walletCore }) => {
  const coin = getKeysignCoin<OtherChain.Solana>(keysignPayload)
  const receiver = shouldBePresent(keysignPayload.toAddress)
  const client = getSolanaClient()

  const recentBlockHash = (await client.getLatestBlockhash()).blockhash

  const chainSpecific = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: solanaConfig.priorityFeePrice.toString(),
    computeLimit: solanaConfig.priorityFeeLimit.toString(),
  })

  if (coin.id) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: coin.id,
    })
    chainSpecific.fromTokenAssociatedAddress = fromAccount.address
    const { data } = await attempt(
      getSplAssociatedAccount({
        account: receiver,
        token: coin.id,
      })
    )
    if (data) {
      chainSpecific.toTokenAssociatedAddress = data.address
      chainSpecific.programId = data.isToken2022
    }
  }

  return withFallback(
    attempt(
      refineSolanaChainSpecific({
        keysignPayload,
        chainSpecific,
        walletCore,
      })
    ),
    chainSpecific
  )
}
