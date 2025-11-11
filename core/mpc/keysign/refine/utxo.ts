import { create } from '@bufbuild/protobuf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'
import { WalletCore } from '@trustwallet/wallet-core'
import { TW } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { UTXOSpecificSchema } from '../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfoSchema } from '../../types/vultisig/keysign/v1/utxo_info_pb'
import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { getUtxoSigningInputs } from '../signingInputs/resolvers/utxo'

type RefineKeysignUtxoInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey: PublicKey
}

const dustStats = 600n

type ConvertPlanUtxosToUtxoInfoInput = {
  utxos: Array<TW.Bitcoin.Proto.IUnspentTransaction>
  walletCore: WalletCore
}

const convertPlanUtxosToUtxoInfo = ({
  utxos,
  walletCore,
}: ConvertPlanUtxosToUtxoInfoInput) =>
  utxos.map(({ outPoint, amount }) => {
    const hash = shouldBePresent(outPoint?.hash, 'UTXO outPoint hash')
    const index = shouldBePresent(outPoint?.index, 'UTXO outPoint index')

    return create(UtxoInfoSchema, {
      hash: walletCore.HexCoding.encode(Uint8Array.from(hash).reverse()),
      amount: BigInt(shouldBePresent(amount, 'UTXO amount').toString()),
      index,
    })
  })

export const refineKeysignUtxo = (input: RefineKeysignUtxoInput) => {
  const [signingInput] = getUtxoSigningInputs(input)

  const utxoSpecific = getBlockchainSpecificValue(
    input.keysignPayload.blockchainSpecific,
    'utxoSpecific'
  )

  const plan = shouldBePresent(signingInput.plan, 'UTXO signing input plan')
  const actualFee = BigInt(
    shouldBePresent(plan.fee, 'UTXO signing input plan fee').toString()
  )
  const utxos = shouldBePresent(plan.utxos, 'UTXO signing input plan utxos')

  let updatedKeysignPayload = input.keysignPayload
  let updatedBlockchainSpecific = input.keysignPayload.blockchainSpecific

  if (input.keysignPayload.toAmount && !utxoSpecific.sendMaxAmount) {
    const amount = BigInt(input.keysignPayload.toAmount)
    const balance = bigIntSum(
      input.keysignPayload.utxoInfo.map(({ amount }) => amount)
    )
    const remainingBalance = balance - amount

    if (remainingBalance <= actualFee + dustStats) {
      updatedBlockchainSpecific = {
        case: 'utxoSpecific',
        value: create(UTXOSpecificSchema, {
          ...utxoSpecific,
          sendMaxAmount: true,
        }),
      }

      updatedKeysignPayload = {
        ...input.keysignPayload,
        blockchainSpecific: updatedBlockchainSpecific,
      }

      const [updatedSigningInput] = getUtxoSigningInputs({
        ...input,
        keysignPayload: updatedKeysignPayload,
      })

      const updatedPlan = shouldBePresent(
        updatedSigningInput.plan,
        'UTXO updated signing input plan'
      )
      const updatedUtxos = shouldBePresent(
        updatedPlan.utxos,
        'UTXO updated signing input plan utxos'
      )

      return {
        ...updatedKeysignPayload,
        utxoInfo: convertPlanUtxosToUtxoInfo({
          utxos: updatedUtxos,
          walletCore: input.walletCore,
        }),
      }
    }
  }

  return {
    ...updatedKeysignPayload,
    blockchainSpecific: updatedBlockchainSpecific,
    utxoInfo: convertPlanUtxosToUtxoInfo({
      utxos,
      walletCore: input.walletCore,
    }),
  }
}
