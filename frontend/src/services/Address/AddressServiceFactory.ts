import { Chain } from '../../model/chain';
import { AddressService } from './AddressService';
import { AddressServiceEvm } from './evm/AddressServiceEvm';
import { IAddressService } from './IAddressService';
import { AddressServiceMaya } from './maya/AddressServiceMaya';
import { AddressServicePolkadot } from './polkadot/AddressServicePolkadot';
import { AddressServiceSolana } from './solana/AddressServiceSolana';
import { AddressServiceSui } from './sui/AddressServiceSui';
import { AddressServiceThorchain } from './thorchain/AddressServiceThorchain';

export class AddressServiceFactory {
  static createAddressService(chain: Chain, walletCore: any): IAddressService {
    switch (chain) {
      case Chain.THORChain:
        return new AddressServiceThorchain(chain, walletCore);
      case Chain.MayaChain:
        return new AddressServiceMaya(chain, walletCore);
      case Chain.Solana:
        return new AddressServiceSolana(chain, walletCore);
      case Chain.Polkadot:
        return new AddressServicePolkadot(chain, walletCore);
      case Chain.Sui:
        return new AddressServiceSui(chain, walletCore);
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
        return new AddressServiceEvm(chain, walletCore);
      default:
        return new AddressService(chain, walletCore);
    }
  }
}
