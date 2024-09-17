import { EvmChain } from '../chain/evm/EvmChain';

enum OtherChain {
  THORChain = 'THORChain',
  MayaChain = 'MayaChain',
  Sui = 'Sui',
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

export const Chain = {
  ...EvmChain,
  ...OtherChain,
};

export type Chain = EvmChain | OtherChain;

export enum TssKeysignType {
  ECDSA = 'ECDSA',
  EdDSA = 'EdDSA',
}
export enum TssAction {
  KEYGEN = 'KEYGEN',
  RESHARE = 'RESHARE',
}

export class ChainUtils {
  static stringToChain(chain: string): Chain | undefined {
    if (Object.values(Chain).includes(chain as Chain)) {
      return chain as Chain;
    }
    return undefined;
  }
  static stringToTssAction(action: string): TssAction | undefined {
    if (Object.values(TssAction).includes(action as TssAction)) {
      return action as TssAction;
    }
    return undefined;
  }

  static getTssKeysignType(chain: Chain): TssKeysignType {
    switch (chain) {
      case Chain.Solana:
        return TssKeysignType.EdDSA;
      case Chain.Polkadot:
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
      case Chain.ZkSync:
        return 'ZK';
      case Chain.Sui:
        return 'SUI';
    }
  }
}
