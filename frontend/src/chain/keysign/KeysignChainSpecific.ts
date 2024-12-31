import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type KeysignChainSpecific = Exclude<
  KeysignPayload['blockchainSpecific'],
  { case: undefined; value?: undefined }
>;

export function getKeysignChainSpecificValue<
  T extends KeysignChainSpecific['case'],
>(
  chainSpecific: KeysignChainSpecific,
  chainCase: T
): Extract<KeysignChainSpecific, { case: T }>['value'] {
  if (chainSpecific.case !== chainCase) {
    throw new Error(
      `Expected case "${chainCase}", but got "${chainSpecific.case}".`
    );
  }

  return chainSpecific.value as any;
}
