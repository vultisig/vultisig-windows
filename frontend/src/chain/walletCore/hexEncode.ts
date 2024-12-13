import { WalletCore } from '@trustwallet/wallet-core';

import { stripHexPrefix } from '../utils/stripHexPrefix';

type Input = {
  value: Uint8Array | Buffer;
  walletCore: WalletCore;
};

export const hexEncode = ({ value, walletCore }: Input) =>
  stripHexPrefix(walletCore.HexCoding.encode(value));
