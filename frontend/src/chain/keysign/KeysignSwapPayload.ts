import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type KeysignSwapPayload = Exclude<
  KeysignPayload['swapPayload'],
  { case: undefined; value?: undefined }
>;

export function getKeysignSwapPayloadValue<
  T extends KeysignSwapPayload['case'],
>(
  chainSpecific: KeysignSwapPayload,
  chainCase: T
): Extract<KeysignSwapPayload, { case: T }>['value'] {
  if (chainSpecific.case !== chainCase) {
    throw new Error(
      `Expected case "${chainCase}", but got "${chainSpecific.case}".`
    );
  }

  return chainSpecific.value as any;
}
