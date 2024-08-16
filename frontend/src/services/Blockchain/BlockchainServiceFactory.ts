import { Chain } from '../../model/chain';
import { BlockchainServiceThorchain } from './thorchain/BlockchainServiceThorchain';

export class BlockchainServiceFactory {
  static createAddressService(chain: Chain) {
    switch (chain) {
      case Chain.THORChain:
        return new BlockchainServiceThorchain(chain);
      default:
        throw new Error('Chain not supported');
    }
  }
}
