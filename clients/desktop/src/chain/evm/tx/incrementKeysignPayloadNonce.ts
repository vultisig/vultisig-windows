import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';

export const incrementKeysignPayloadNonce = (
  keysignPayload: KeysignPayload
): KeysignPayload => {
  const { blockchainSpecific } = keysignPayload;

  const { nonce, ...rest } = blockchainSpecific.value as EthereumSpecific;

  return new KeysignPayload({
    ...keysignPayload,
    blockchainSpecific: {
      case: 'ethereumSpecific',
      value: {
        ...rest,
        nonce: nonce + 1n,
      },
    },
  });
};
