import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type KeysignChainSpecific = Exclude<
  KeysignPayload['blockchainSpecific'],
  { case: undefined; value?: undefined }
>;
