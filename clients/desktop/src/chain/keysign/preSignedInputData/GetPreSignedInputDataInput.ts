import { WalletCore } from '@trustwallet/wallet-core';

import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import {
  ChainsBySpecific,
  KeysignChainSpecificKey,
  KeysignChainSpecificValueByKey,
} from '../KeysignChainSpecific';

export type GetPreSignedInputDataInput<T extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
  chain: ChainsBySpecific<T>;
  chainSpecific: KeysignChainSpecificValueByKey<T>;
};
