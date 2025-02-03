import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../model/chain';
import { getCoinType } from '../walletCore/getCoinType';

type Input = {
  chain: Chain;
  address: string;
  walletCore: WalletCore;
};

export const isValidAddress = ({ chain, address, walletCore }: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  });

  if (chain === Chain.MayaChain) {
    return walletCore.AnyAddress.isValidBech32(address, coinType, 'maya');
  }

  return walletCore.AnyAddress.isValid(address, coinType);
};
