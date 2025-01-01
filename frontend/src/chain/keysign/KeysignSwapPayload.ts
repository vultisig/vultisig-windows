import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type KeysignSwapPayload = Exclude<
  KeysignPayload['swapPayload'],
  { case: undefined; value?: undefined }
>;
