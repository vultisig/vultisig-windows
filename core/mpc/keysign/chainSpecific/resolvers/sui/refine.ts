import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { getCoinType } from '@core/chain/coin/coinType'
import { SuiSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TW } from '@trustwallet/wallet-core'
import { WalletCore } from '@trustwallet/wallet-core'

import { getSuiSigningInputs } from '../../../signingInputs/resolvers/sui'

const minNetworkGasBudget = 2000n
const safetyMarginPercent = 15n

type RefineSuiChainSpecificInput = {
  keysignPayload: KeysignPayload
  suiChainSpecific: SuiSpecific
  walletCore: WalletCore
}

export const refineSuiChainSpecific = async ({
  keysignPayload,
  suiChainSpecific,
  walletCore,
}: RefineSuiChainSpecificInput): Promise<SuiSpecific> => {
  try {
    const client = getSuiClient()

    const tempPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      blockchainSpecific: {
        case: 'suicheSpecific',
        value: suiChainSpecific,
      },
    })

    const inputs = getSuiSigningInputs({
      keysignPayload: tempPayload,
      walletCore,
    })

    const txInputData = TW.Sui.Proto.SigningInput.encode(inputs[0]).finish()

    const coinType = getCoinType({
      chain: Chain.Sui,
      walletCore,
    })

    const preHashes = walletCore.TransactionCompiler.preImageHashes(
      coinType,
      txInputData
    )

    const preSigningOutput =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes)

    if (preSigningOutput.errorMessage) {
      throw new Error(
        `Failed to get pre-signing output: ${preSigningOutput.errorMessage}`
      )
    }

    const txBytes = Buffer.from(preSigningOutput.data)
      .subarray(3)
      .toString('base64')

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
      ...suiChainSpecific,
      gasBudget: estimatedGasBudget.toString(),
    }
  } catch {
    return suiChainSpecific
  }
}
