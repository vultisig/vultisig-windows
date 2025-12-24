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
import { getKeysignAmount } from '../utils/getKeysignAmount'

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

export const refineKeysignUtxo = (
  input: RefineKeysignUtxoInput
): KeysignPayload => {
  const utxoSpecific = getBlockchainSpecificValue(
    input.keysignPayload.blockchainSpecific,
    'utxoSpecific'
  )

  // PSBTs already have UTXOs defined - skip refinement logic
  // The PSBT contains all necessary UTXO selection and transaction structure
  // TODO: Re-enable once we work again over psbt support
  // if (utxoSpecific.psbt) {
  //   return input.keysignPayload
  // }

  const [signingInput] = getUtxoSigningInputs(input)

  const plan = shouldBePresent(signingInput.plan, 'UTXO signing input plan')
  const planUtxos = plan.utxos

  const amount = getKeysignAmount(input.keysignPayload)

  if (!planUtxos || planUtxos.length === 0) {
    if (utxoSpecific.sendMaxAmount) {
      throw new Error(
        'Failed to build transaction: insufficient balance or invalid UTXO selection'
      )
    }

    if (amount) {
      return refineKeysignUtxo({
        ...input,
        keysignPayload: {
          ...input.keysignPayload,
          blockchainSpecific: {
            case: 'utxoSpecific',
            value: create(UTXOSpecificSchema, {
              ...utxoSpecific,
              sendMaxAmount: true,
            }),
          },
        },
      })
    }

    return input.keysignPayload
  }

  const actualFee = BigInt(
    shouldBePresent(plan.fee, 'UTXO signing input plan fee').toString()
  )

  if (amount && !utxoSpecific.sendMaxAmount) {
    const balance = bigIntSum(
      input.keysignPayload.utxoInfo.map(({ amount }) => amount)
    )
    const remainingBalance = balance - amount

    if (remainingBalance <= actualFee + dustStats) {
      return refineKeysignUtxo({
        ...input,
        keysignPayload: {
          ...input.keysignPayload,
          blockchainSpecific: {
            case: 'utxoSpecific',
            value: create(UTXOSpecificSchema, {
              ...utxoSpecific,
              sendMaxAmount: true,
            }),
          },
        },
      })
    }
  }

  return {
    ...input.keysignPayload,
    utxoInfo: convertPlanUtxosToUtxoInfo({
      utxos: planUtxos,
      walletCore: input.walletCore,
    }),
  }
}
