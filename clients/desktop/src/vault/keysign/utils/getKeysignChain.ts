import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';

export const getKeysignChain = ({ coin }: KeysignPayload) =>
  shouldBePresent(coin).chain as Chain;
