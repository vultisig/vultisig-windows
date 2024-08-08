import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

export enum Chain {
  THORChain = 'THORChain',
  MayaChain = 'MayaChain',
  Arbitrum = 'Arbitrum',
  Avalanche = 'Avalanche',
  Base = 'Base',
  CronosChain = 'CronosChain',
  BSC = 'BSC',
  Blast = 'Blast',
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Polygon = 'Polygon',
  Bitcoin = 'Bitcoin',
  BitcoinCash = 'Bitcoin-Cash',
  Litecoin = 'Litecoin',
  Dogecoin = 'Dogecoin',
  Dash = 'Dash',
  Solana = 'Solana',
  Gaia = 'Gaia',
  Kujira = 'Kujira',
  Dydx = 'Dydx',
  Polkadot = 'Polkadot',
}
export enum TssKeysignType {
  ECDSA,
  EdDSA,
}
export enum TssAction {
  KEYGEN,
  RESHARE,
}
export class ChainUtils {
  static getCoinType(chain: Chain): CoinType {
    switch (chain) {
      case Chain.THORChain:
        return CoinType.thorchain;
      case Chain.MayaChain:
        return CoinType.thorchain;
      case Chain.Arbitrum:
        return CoinType.arbitrum;
      case Chain.Avalanche:
        return CoinType.avalancheCChain;
      case Chain.Base:
        return CoinType.base;
      case Chain.CronosChain:
        return CoinType.cronosChain;
      case Chain.BSC:
        return CoinType.smartChain;
      case Chain.Blast:
        return CoinType.blast;
      case Chain.Ethereum:
        return CoinType.ethereum;
      case Chain.Optimism:
        return CoinType.optimism;
      case Chain.Polygon:
        return CoinType.polygon;
      case Chain.Bitcoin:
        return CoinType.bitcoin;
      case Chain.BitcoinCash:
        return CoinType.bitcoinCash;
      case Chain.Litecoin:
        return CoinType.litecoin;
      case Chain.Dogecoin:
        return CoinType.dogecoin;
      case Chain.Dash:
        return CoinType.dash;
      case Chain.Solana:
        return CoinType.solana;
      case Chain.Gaia:
        return CoinType.cosmos;
      case Chain.Kujira:
        return CoinType.kujira;
      case Chain.Dydx:
        return CoinType.dydx;
      case Chain.Polkadot:
        return CoinType.polkadot;
    }
  }

  static getTssKeysignType(chain: Chain): TssKeysignType {
    switch (chain) {
      case (Chain.Solana, Chain.Polkadot):
        return TssKeysignType.EdDSA;
      default:
        return TssKeysignType.ECDSA;
    }
  }
  static getTicker(chain: Chain): string {
    switch (chain) {
      case Chain.THORChain:
        return 'RUNE';
      case Chain.MayaChain:
        return 'CACAO';
      case Chain.Arbitrum:
        return 'ARB';
      case Chain.Avalanche:
        return 'AVAX';
      case Chain.Base:
        return 'BASE';
      case Chain.CronosChain:
        return 'CRO';
      case Chain.BSC:
        return 'BNB';
      case Chain.Blast:
        return 'BLAST';
      case Chain.Ethereum:
        return 'ETH';
      case Chain.Optimism:
        return 'OP';
      case Chain.Polygon:
        return 'MATIC';
      case Chain.Bitcoin:
        return 'BTC';
      case Chain.BitcoinCash:
        return 'BCH';
      case Chain.Litecoin:
        return 'LTC';
      case Chain.Dogecoin:
        return 'DOGE';
      case Chain.Dash:
        return 'DASH';
      case Chain.Solana:
        return 'SOL';
      case Chain.Gaia:
        return 'UATOM';
      case Chain.Kujira:
        return 'KUJI';
      case Chain.Dydx:
        return 'DYDX';
      case Chain.Polkadot:
        return 'DOT';
    }
  }
}
