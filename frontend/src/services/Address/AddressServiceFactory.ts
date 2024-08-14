import { Chain } from '../../model/chain';
import { AddressService } from './AddressService';
import { AddressServiceEvm } from './evm/AddressServiceEvm';
import { AddressServiceThorchain } from './thorchain/AddressServiceThorchain';

export class AddressServiceFactory {
  static createAddressService(chain: Chain) {
    switch (chain) {
      case (Chain.THORChain, Chain.MayaChain):
        return new AddressServiceThorchain();
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
        return new AddressServiceEvm();
      default:
        return new AddressService();
    }
  }
}
