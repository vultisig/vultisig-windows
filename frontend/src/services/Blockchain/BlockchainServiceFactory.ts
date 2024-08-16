import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { BlockchainServiceThorchain } from './thorchain/BlockchainServiceThorchain';
import { IBlockchainService } from './IBlockchainService';

export class BlockchainServiceFactory {
  static createAddressService(
    chain: Chain,
    walletCore: WalletCore
  ): IBlockchainService {
    switch (chain) {
      case Chain.THORChain:
        return new BlockchainServiceThorchain(chain, walletCore);
      default:
        throw new Error('Chain not supported');
    }
  }
}
