import { Chain } from '../../model/chain';
import { SendServiceEvm } from './evm/SendServiceEvm';
import { SendServiceSolana } from './solana/SendServiceSolana';
import { SendServiceThorchain } from './thorchain/SendServiceThorchain';
import { SendServiceUtxo } from './utxo/SendServiceUtxo';

export class SendServiceFactory {
  static createSendService(chain: Chain) {
    switch (chain) {
      case (Chain.THORChain, Chain.MayaChain):
        return new SendServiceThorchain();
      case (Chain.Bitcoin,
      Chain.BitcoinCash,
      Chain.Litecoin,
      Chain.Dogecoin,
      Chain.Dash):
        return new SendServiceUtxo();
      case Chain.Solana:
        return new SendServiceSolana();
      case (Chain.Ethereum,
      Chain.Optimism,
      Chain.Polygon,
      Chain.Arbitrum,
      Chain.Blast,
      Chain.CronosChain,
      Chain.BSC,
      Chain.ZkSync,
      Chain.Base,
      Chain.Optimism):
        return new SendServiceEvm();
      default:
        return new SendServiceUtxo();
    }
  }
}
