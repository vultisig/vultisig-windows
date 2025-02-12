import { WalletCore } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { stripHexPrefix } from './stripHexPrefix';

type ToHexPublicKeyInput = {
  publicKey: PublicKey;
  walletCore: WalletCore;
};

export const toHexPublicKey = ({
  publicKey,
  walletCore,
}: ToHexPublicKeyInput) => {
  return stripHexPrefix(walletCore.HexCoding.encode(publicKey.data()));
};
