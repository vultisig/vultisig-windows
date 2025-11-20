import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { SolanaSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getPreSigningOutput } from '../../../preSigningOutput'
import { getEncodedSigningInputs } from '../../../signingInputs'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'

const rentExemptionAccountSize = 165
const microLamportsPerLamport = 1_000_000n

type RefineSolanaChainSpecificInput = {
  keysignPayload: KeysignPayload
  chainSpecific: SolanaSpecific
  walletCore: WalletCore
}

export const refineSolanaChainSpecific = async ({
  keysignPayload,
  chainSpecific,
  walletCore,
}: RefineSolanaChainSpecificInput): Promise<SolanaSpecific> => {
  const coin = getKeysignCoin(keysignPayload)
  const client = getSolanaClient()

  const [txInputData] = getEncodedSigningInputs({
    keysignPayload: create(KeysignPayloadSchema, {
      ...keysignPayload,
      blockchainSpecific: {
        case: 'solanaSpecific',
        value: chainSpecific,
      },
    }),
    walletCore,
  })

  const { data } = getPreSigningOutput({
    walletCore,
    txInputData,
    chain: Chain.Solana,
  })

  const messageBase64 = Buffer.from(data).toString('base64')

  const getBaseFee = async () => {
    const { value } = await client
      .getFeeForMessage(
        messageBase64 as Parameters<typeof client.getFeeForMessage>[0],
        {
          commitment: 'confirmed',
        }
      )
      .send()

    return value?.valueOf() ?? 0n
  }

  const getRentExemptionFee = async () => {
    if (!isFeeCoin(coin) && !chainSpecific.toTokenAssociatedAddress) {
      const rentExemption = await client
        .getMinimumBalanceForRentExemption(BigInt(rentExemptionAccountSize))
        .send()
      return rentExemption.valueOf()
    }

    return 0n
  }

  const baseFee = await getBaseFee()
  const rentExemptionFee = await getRentExemptionFee()

  const priorityFeeAmount =
    (BigInt(solanaConfig.priorityFeePrice) *
      BigInt(solanaConfig.priorityFeeLimit)) /
    microLamportsPerLamport

  const totalFee = baseFee + rentExemptionFee + priorityFeeAmount

  return {
    ...chainSpecific,
    priorityFee: totalFee.toString(),
  }
}
