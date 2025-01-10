import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type KeysignSwapPayload = Exclude<
  KeysignPayload['swapPayload'],
  { case: undefined; value?: undefined }
>;

export const toKeysignSwapPayload = (
  swapPayload: KeysignPayload['swapPayload']
): KeysignSwapPayload => {
  if (swapPayload.case === undefined) {
    throw new Error('Swap payload case is undefined');
  }
  return swapPayload;
};
