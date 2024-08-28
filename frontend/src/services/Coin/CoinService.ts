import { WalletCore } from '@trustwallet/wallet-core';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { ICoinService } from './ICoinService';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

export class CoinService implements ICoinService {
  private chain: Chain;
  private walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string, // TODO this is not correct
    hexChainCode: string
  ): Promise<Coin> {
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
      case Chain.Gaia:
        return this.walletCore.CoinType.cosmos;
      case Chain.Kujira:
        return this.walletCore.CoinType.kujira;
      case Chain.Dydx:
        return this.walletCore.CoinType.dydx;
      case Chain.Polkadot:
        return this.walletCore.CoinType.polkadot;
      case Chain.Sui:
        return this.walletCore.CoinType.sui;
      case Chain.ZkSync:
        return this.walletCore.CoinType.zksync;
      default:
        throw new Error(`Invalid chain ${this.chain}`);
    }
  }
}
