import { WalletCore } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { DeleteCoin, SaveCoin } from '../../../wailsjs/go/storage/Store';
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
        hexPublicKey: hexPublicKey.stripHexPrefix(),
        logo: asset.logo,
      });
    } catch (error) {
      console.error('create coin error: ', error);
      throw error;
    }
  }

  getCoinType(): CoinType {
    switch (this.chain) {
      case Chain.THORChain:
        return this.walletCore.CoinType.thorchain;
      case Chain.MayaChain:
        return this.walletCore.CoinType.thorchain;
      case Chain.Arbitrum:
        return this.walletCore.CoinType.arbitrum;
      case Chain.Avalanche:
        return this.walletCore.CoinType.avalancheCChain;
      case Chain.Base:
        return this.walletCore.CoinType.base;
      case Chain.CronosChain:
        return this.walletCore.CoinType.cronosChain;
      case Chain.BSC:
        return this.walletCore.CoinType.smartChain;
      case Chain.Blast:
        return this.walletCore.CoinType.blast;
      case Chain.Ethereum:
        return this.walletCore.CoinType.ethereum;
      case Chain.Optimism:
        return this.walletCore.CoinType.optimism;
      case Chain.Polygon:
        return this.walletCore.CoinType.polygon;
      case Chain.Bitcoin:
        return this.walletCore.CoinType.bitcoin;
      case Chain.BitcoinCash:
        return this.walletCore.CoinType.bitcoinCash;
      case Chain.Litecoin:
        return this.walletCore.CoinType.litecoin;
      case Chain.Dogecoin:
        return this.walletCore.CoinType.dogecoin;
      case Chain.Dash:
        return this.walletCore.CoinType.dash;
      case Chain.Solana:
        return this.walletCore.CoinType.solana;
      case Chain.Cosmos:
        return this.walletCore.CoinType.cosmos;
      case Chain.Kujira:
        return this.walletCore.CoinType.kujira;
      case Chain.Dydx:
        return this.walletCore.CoinType.dydx;
      case Chain.Polkadot:
        return this.walletCore.CoinType.polkadot;
      case Chain.Sui:
        return this.walletCore.CoinType.sui;
      case Chain.Zksync:
        return this.walletCore.CoinType.zksync;
      case Chain.Ton:
        return this.walletCore.CoinType.ton;
      case Chain.Osmosis:
        return this.walletCore.CoinType.osmosis;
      default:
        throw new Error(`Invalid chain ${this.chain}`);
    }
  }
}
