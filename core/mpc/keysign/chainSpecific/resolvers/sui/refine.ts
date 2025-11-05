import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { SuiSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getPreSigningOutput } from '../../../preSigningOutput'
import { getEncodedSigningInputs } from '../../../signingInputs'

const minNetworkGasBudget = 2000n
const safetyMarginPercent = 15n

type RefineSuiChainSpecificInput = {
  keysignPayload: KeysignPayload
  chainSpecific: SuiSpecific
  walletCore: WalletCore
}

export const refineSuiChainSpecific = async ({
  keysignPayload,
  chainSpecific,
  walletCore,
}: RefineSuiChainSpecificInput): Promise<SuiSpecific> => {
  const client = getSuiClient()

  const [txInputData] = getEncodedSigningInputs({
    keysignPayload: create(KeysignPayloadSchema, {
      ...keysignPayload,
      blockchainSpecific: {
        case: 'suicheSpecific',
        value: chainSpecific,
      },
    }),
    walletCore,
  })

  const { data } = getPreSigningOutput({
    walletCore,
    txInputData,
    chain: Chain.Sui,
  })

  const txBytes = Buffer.from(data).subarray(3).toString('base64')

  const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: txBytes,
  })

  const gasUsed = dryRunResult.effects.gasUsed
  const computationCost = BigInt(gasUsed.computationCost)
  const storageCost = BigInt(gasUsed.storageCost)

  const gasBudget = computationCost + storageCost

  const safeGasBudget = gasBudget + (gasBudget * safetyMarginPercent) / 100n

  const estimatedGasBudget =
    safeGasBudget < minNetworkGasBudget ? minNetworkGasBudget : safeGasBudget

  return {
    ...chainSpecific,
    gasBudget: estimatedGasBudget.toString(),
  }
}
