import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core';

import { Chain } from '../../model/chain';
import { getCoinType } from '../walletCore/getCoinType';

type DeriveAddressInput = {
  chain: Chain;
  publicKey: PublicKey;
  walletCore: WalletCore;
};

export const deriveAddress = ({
  chain,
  publicKey,
  walletCore,
}: DeriveAddressInput) => {
  const coinType = getCoinType({
    chain,
    walletCore,
  });

  if (chain === Chain.MayaChain) {
    return walletCore.AnyAddress.createBech32WithPublicKey(
      publicKey,
      coinType,
      'maya'
    ).description();
  }

  return walletCore.CoinTypeExt.deriveAddressFromPublicKey(coinType, publicKey);
};
