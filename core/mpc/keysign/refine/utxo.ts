import { create } from '@bufbuild/protobuf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfoSchema } from '../../types/vultisig/keysign/v1/utxo_info_pb'
import { getUtxoSigningInputs } from '../signingInputs/resolvers/utxo'

type RefineKeysignUtxoInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey: PublicKey
}

export const refineKeysignUtxo = (input: RefineKeysignUtxoInput) => {
  const [signingInput] = getUtxoSigningInputs(input)

  if (signingInput.plan?.utxos) {
    return {
      ...input.keysignPayload,
      utxoInfo: signingInput.plan.utxos.map(({ outPoint, amount }) => {
        const hash = shouldBePresent(outPoint?.hash, 'UTXO outPoint hash')
        const index = shouldBePresent(outPoint?.index, 'UTXO outPoint index')

        return create(UtxoInfoSchema, {
          hash: input.walletCore.HexCoding.encode(
            Uint8Array.from(hash).reverse()
          ),
          amount: BigInt(shouldBePresent(amount, 'UTXO amount').toString()),
          index,
        })
      }),
    }
  }

  return input.keysignPayload
}
