import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { BlockchainServiceThorchain } from './thorchain/BlockchainServiceThorchain';
import { IBlockchainService } from './IBlockchainService';
import { BlockchainServiceUtxo } from './utxo/BlockchainServiceUtxo';

export class BlockchainServiceFactory {
  static createService(
    chain: Chain,
    walletCore: WalletCore
  ): IBlockchainService {
    switch (chain) {
      case Chain.THORChain:
        return new BlockchainServiceThorchain(chain, walletCore);
      case Chain.Dogecoin:
        return new BlockchainServiceUtxo(chain, walletCore);
      default:
        throw new Error('Chain not supported');
    }
  }
}
