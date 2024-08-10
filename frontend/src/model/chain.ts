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
