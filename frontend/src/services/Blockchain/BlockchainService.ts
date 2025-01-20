import { WalletCore } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { getCoinType } from '../../chain/walletCore/getCoinType';
import { Chain } from '../../model/chain';

export class BlockchainService {
  chain: Chain;
  walletCore: WalletCore;
  coinType: CoinType;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.coinType = getCoinType({ walletCore, chain });
  }
}
