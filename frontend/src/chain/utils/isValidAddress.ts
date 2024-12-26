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

  return walletCore.AnyAddress.isValid(address, coinType);
};
