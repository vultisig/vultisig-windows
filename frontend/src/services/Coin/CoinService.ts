import { initWasm } from '@trustwallet/wallet-core';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { ICoinService } from './ICoinService';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';

export class CoinService implements ICoinService {
  private chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
  }

  async createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<Coin> {
    const addressService = AddressServiceFactory.createAddressService(
      this.chain
    );

    const publicKey = await addressService.getPublicKey(
      publicKeyECDSA,
      publicKeyEdDSA
    );

    const address = await addressService.deriveAddressFromPublicKey(
      publicKeyECDSA,
      publicKeyEdDSA
    );

    return new Coin({
      chain: this.chain.toString(),
      ticker: asset.ticker,
      address: address,
      contractAddress: asset.contractAddress,
      decimals: asset.decimals,
      priceProviderId: asset.priceProviderId,
      isNativeToken: asset.isNativeToken,
      hexPublicKey: publicKey.data.toString('hex'),
      logo: asset.logo,
    });
  }

  async getCoinType(): Promise<any> {
    const walletCore = await initWasm();
    switch (this.chain) {
      case Chain.THORChain:
        return walletCore.CoinType.thorchain;
      case Chain.MayaChain:
        return walletCore.CoinType.thorchain;
      case Chain.Arbitrum:
        return walletCore.CoinType.arbitrum;
      case Chain.Avalanche:
        return walletCore.CoinType.avalancheCChain;
      case Chain.Base:
        return walletCore.CoinType.base;
      case Chain.CronosChain:
        return walletCore.CoinType.cronosChain;
      case Chain.BSC:
        return walletCore.CoinType.smartChain;
      case Chain.Blast:
        return walletCore.CoinType.blast;
      case Chain.Ethereum:
        return walletCore.CoinType.ethereum;
      case Chain.Optimism:
        return walletCore.CoinType.optimism;
      case Chain.Polygon:
        return walletCore.CoinType.polygon;
      case Chain.Bitcoin:
        return walletCore.CoinType.bitcoin;
      case Chain.BitcoinCash:
        return walletCore.CoinType.bitcoinCash;
      case Chain.Litecoin:
        return walletCore.CoinType.litecoin;
      case Chain.Dogecoin:
        return walletCore.CoinType.dogecoin;
      case Chain.Dash:
        return walletCore.CoinType.dash;
      case Chain.Solana:
        return walletCore.CoinType.solana;
      case Chain.Gaia:
        return walletCore.CoinType.cosmos;
      case Chain.Kujira:
        return walletCore.CoinType.kujira;
      case Chain.Dydx:
        return walletCore.CoinType.dydx;
      case Chain.Polkadot:
        return walletCore.CoinType.polkadot;
    }
  }
}
