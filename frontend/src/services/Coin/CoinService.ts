import { WalletCore } from '@trustwallet/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { DeleteCoin, SaveCoin } from '../../../wailsjs/go/storage/Store';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { ICoinService } from './ICoinService';

export class CoinService implements ICoinService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async saveTokens(_coin: Coin, _vault: storage.Vault): Promise<void> {
    // No need to implement this method
    // only evm and solana chains need to implement this method
  }

  async saveCoin(coin: Coin, vault: storage.Vault): Promise<void> {
    const storageCoin = coinToStorageCoin(coin);
    await SaveCoin(vault.public_key_ecdsa, storageCoin);
  }

  async deleteCoin(coinId: string, vaultId: string): Promise<void> {
    await DeleteCoin(vaultId, coinId);
  }
}
