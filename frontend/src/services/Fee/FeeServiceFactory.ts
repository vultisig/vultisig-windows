import { Chain } from '../../model/chain';
import { FeeServiceEvm } from './evm/FeeServiceEvm';
import { FeeServiceCosmos } from './cosmos/FeeServiceCosmos';
import { FeeServicePolkadot } from './polkadot/FeeServicePolkadot';
import { FeeServiceSolana } from './solana/FeeServiceSolana';
import { FeeServiceSui } from './sui/FeeServiceSui';
import { FeeServiceThorchain } from './thorchain/FeeServiceThorchain';
import { FeeServiceUtxo } from './utxo/FeeServiceUtxo';

export class FeeServiceFactory {
  static createFeeService(chain: Chain) {
    switch (chain) {
      case Chain.Solana:
        return new FeeServiceSolana();
      case Chain.Polkadot:
        return new FeeServicePolkadot();
      case Chain.Ethereum:
        return new FeeServiceEvm();
      case Chain.Optimism:
        return new FeeServiceEvm();
      case Chain.Polygon:
        return new FeeServiceEvm();
      case Chain.Arbitrum:
        return new FeeServiceEvm();
      case Chain.Blast:
        return new FeeServiceEvm();
      case Chain.Base:
        return new FeeServiceEvm();
      case Chain.CronosChain:
        return new FeeServiceEvm();
      case Chain.BSC:
        return new FeeServiceEvm();
      case Chain.ZkSync:
        return new FeeServiceEvm();
      case Chain.THORChain:
        return new FeeServiceThorchain();
      case Chain.MayaChain:
        return new FeeServiceThorchain();
      case Chain.Bitcoin:
        return new FeeServiceUtxo();
      case Chain.BitcoinCash:
        return new FeeServiceUtxo();
      case Chain.Litecoin:
        return new FeeServiceUtxo();
      case Chain.Dash:
        return new FeeServiceUtxo();
      case Chain.Dogecoin:
        return new FeeServiceUtxo();
      case Chain.Avalanche:
        return new FeeServiceEvm();
      case Chain.Sui:
        return new FeeServiceSui();
      case Chain.Gaia:
        return new FeeServiceCosmos();
      case Chain.Kujira:
        return new FeeServiceCosmos();
      case Chain.Dydx:
        return new FeeServiceCosmos();
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
