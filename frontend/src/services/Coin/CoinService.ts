import { WalletCore } from '@trustwallet/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { DeleteCoin, SaveCoin } from '../../../wailsjs/go/storage/Store';
import { stripHexPrefix } from '../../chain/utils/stripHexPrefix';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
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
    publicKeyECDSA: string,
    publicKeyEdDSA: string, // TODO this is not correct
    hexChainCode: string
  ): Promise<Coin> {
    try {
      const addressService = AddressServiceFactory.createAddressService(
        this.chain,
        this.walletCore
      );

      const publicKey = await addressService.getPublicKey(
        publicKeyECDSA,
        publicKeyEdDSA,
        hexChainCode
      );

      const address = await addressService.deriveAddressFromPublicKey(
        publicKeyECDSA,
        publicKeyEdDSA,
        hexChainCode
      );
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
