import { WalletCore } from '@trustwallet/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { SaveCoins } from '../../../wailsjs/go/storage/Store';
import { getChainFeeCoin } from '../../chain/tx/fee/utils/getChainFeeCoin';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { createCoin } from '../../coin/utils/createCoin';
import { Chain } from '../../model/chain';
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey';
import { getStorageVaultId } from '../utils/storageVault';

type CreateVaultDefaultCoinsInput = {
  vault: storage.Vault;
  defaultChains: Chain[];
  walletCore: WalletCore;
};

export const createVaultDefaultCoins = async ({
  vault,
  defaultChains,
  walletCore,
}: CreateVaultDefaultCoinsInput) => {
  const coins = await Promise.all(
    defaultChains.map(async chain => {
      const publicKey = await getVaultPublicKey({
        chain,
        vault,
        walletCore,
      });

      const coin = createCoin({
        coinMeta: getChainFeeCoin(chain),
        publicKey,
        walletCore,
      });

      return coinToStorageCoin(coin);
    })
  );

  await SaveCoins(getStorageVaultId(vault), coins);
};
