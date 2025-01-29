import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../../model/chain';

export type ExecuteTxInput<T extends Chain = Chain> = {
  chain: T;
  walletCore: WalletCore;
  compiledTx: Uint8Array<ArrayBufferLike>;
};
