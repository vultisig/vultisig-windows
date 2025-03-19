import { create } from '@bufbuild/protobuf'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

export const incrementKeysignPayloadNonce = (
  keysignPayload: KeysignPayload
): KeysignPayload => {
  const { blockchainSpecific } = keysignPayload

  const { nonce, ...rest } = blockchainSpecific.value as EthereumSpecific

  return create(KeysignPayloadSchema, {
    ...keysignPayload,
    blockchainSpecific: {
      case: 'ethereumSpecific',
      value: {
        ...rest,
        nonce: nonce + 1n,
      },
    },
  })
}
