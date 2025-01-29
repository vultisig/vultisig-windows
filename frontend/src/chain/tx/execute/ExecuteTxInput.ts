import { WalletCore } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { Chain } from '../../../model/chain';

export type ExecuteTxInput<T extends Chain = Chain> = {
  publicKey: PublicKey;
  txInputData: Uint8Array;
  signatures: Record<string, tss.KeysignResponse>;
  chain: T;
  walletCore: WalletCore;
};
