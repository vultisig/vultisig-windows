import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget } from '@core/chain/chains/sui/config'
import { getCoinType } from '@core/chain/coin/coinType'
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TW } from '@trustwallet/wallet-core'

import { getSuiSigningInputs } from '../../../signingInputs/resolvers/sui'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificInput } from '../../resolver'

const minNetworkGasBudget = 2000n
const safetyMarginPercent = 15n

export const getSuiGasBudget = async ({
  keysignPayload,
  walletCore,
}: GetChainSpecificInput<'suicheSpecific'>): Promise<bigint> => {
  const coin = getKeysignCoin(keysignPayload)
  const client = getSuiClient()

  const { data } = await client.getAllCoins({
    owner: coin.address,
  })

  const coins = data.map(coin => create(SuiCoinSchema, coin))
  const referenceGasPrice = await client.getReferenceGasPrice()

  const tempPayload = create(KeysignPayloadSchema, {
    ...keysignPayload,
    blockchainSpecific: {
      case: 'suicheSpecific',
      value: create(SuiSpecificSchema, {
        coins,
        referenceGasPrice: referenceGasPrice.toString(),
        gasBudget: suiGasBudget.toString(),
      }),
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

  return safeGasBudget < minNetworkGasBudget
    ? minNetworkGasBudget
    : safeGasBudget
}
