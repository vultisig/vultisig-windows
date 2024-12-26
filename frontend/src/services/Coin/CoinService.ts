import { WalletCore } from '@trustwallet/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { DeleteCoin, SaveCoin } from '../../../wailsjs/go/storage/Store';
import { stripHexPrefix } from '../../chain/utils/stripHexPrefix';
import { getCoinType } from '../../chain/walletCore/getCoinType';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { toWalletCorePublicKey } from '../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../vault/publicKey/VaultPublicKey';
import { TokensStore } from './CoinList';
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

  hasTokens(): boolean {
    return (
      TokensStore.TokenSelectionAssets.filter(asset => {
        return asset.chain === this.chain && !asset.isNativeToken;
      }).length > 0
    );
  }

  async saveCoin(coin: Coin, vault: storage.Vault): Promise<void> {
    const storageCoin = coinToStorageCoin(coin);
    await SaveCoin(vault.public_key_ecdsa, storageCoin);
  }

  async deleteCoin(coinId: string, vaultId: string): Promise<void> {
    await DeleteCoin(vaultId, coinId);
  }

  async createCoin(
    asset: CoinMeta,
    vaultPublicKey: VaultPublicKey
  ): Promise<Coin> {
    try {
      const publicKey = await toWalletCorePublicKey({
        chain: this.chain,
        value: vaultPublicKey,
        walletCore: this.walletCore,
      });

      const coinType = getCoinType({
        chain: this.chain,
        walletCore: this.walletCore,
      });

      const getAddress = () => {
        if (this.chain === Chain.MayaChain) {
          this.walletCore.AnyAddress.createBech32WithPublicKey(
            publicKey,
            this.walletCore.CoinType.thorchain,
            'maya'
          );
        }

        return this.walletCore.CoinTypeExt.deriveAddressFromPublicKey(
          coinType,
          publicKey
        );
      };

      const address = getAddress();

      const hexPublicKey = this.walletCore.HexCoding.encode(publicKey.data());
      return new Coin({
        chain: this.chain.toString(),
        ticker: asset.ticker,
        address: address,
        contractAddress: asset.contractAddress,
        decimals: asset.decimals,
        priceProviderId: asset.priceProviderId,
        isNativeToken: asset.isNativeToken,
        hexPublicKey: stripHexPrefix(hexPublicKey),
        logo: asset.logo,
      });
    } catch (error) {
      console.error('create coin error: ', error);
      throw error;
    }
  }
}
