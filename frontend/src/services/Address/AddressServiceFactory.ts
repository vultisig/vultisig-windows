import { Chain } from '../../model/chain';
import { AddressService } from './AddressService';
import { AddressServiceEvm } from './evm/AddressServiceEvm';
import { AddressServicePolkadot } from './polkadot/AddressServicePolkadot';
import { AddressServiceSolana } from './solana/AddressServiceSolana';
import { AddressServiceThorchain } from './thorchain/AddressServiceThorchain';

export class AddressServiceFactory {
  static createAddressService(chain: Chain) {
    switch (chain) {
      case (Chain.THORChain, Chain.MayaChain):
        return new AddressServiceThorchain(chain);
      case Chain.Solana:
        return new AddressServiceSolana(chain);
      case Chain.Polkadot:
        return new AddressServicePolkadot(chain);
      case (Chain.Ethereum,
      Chain.Optimism,
      Chain.Polygon,
      Chain.Arbitrum,
      Chain.Blast,
      Chain.CronosChain,
      Chain.BSC,
      Chain.ZkSync,
      Chain.Base,
      Chain.Avalanche):
        return new AddressServiceEvm(chain);
      default:
        return new AddressService(chain);
    }
  }
}
