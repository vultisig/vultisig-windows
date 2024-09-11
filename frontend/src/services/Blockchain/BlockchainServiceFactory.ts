import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { BlockchainServiceThorchain } from './thorchain/BlockchainServiceThorchain';
import { IBlockchainService } from './IBlockchainService';
import { BlockchainServiceUtxo } from './utxo/BlockchainServiceUtxo';
import { BlockchainServiceEvm } from './evm/BlockchainServiceEvm';

export class BlockchainServiceFactory {
  static createService(
    chain: Chain,
    walletCore: WalletCore
  ): IBlockchainService {
    switch (chain) {
      case Chain.THORChain:
        return new BlockchainServiceThorchain(chain, walletCore);
      case Chain.Bitcoin:
        return new BlockchainServiceUtxo(chain, walletCore);
      case Chain.BitcoinCash:
        return new BlockchainServiceUtxo(chain, walletCore);
      case Chain.Litecoin:
        return new BlockchainServiceUtxo(chain, walletCore);
      case Chain.Dash:
        return new BlockchainServiceUtxo(chain, walletCore);
      case Chain.Dogecoin:
        return new BlockchainServiceUtxo(chain, walletCore);
      case Chain.Ethereum:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Avalanche:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Arbitrum:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.BSC:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Blast:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Base:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.CronosChain:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Optimism:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.ZkSync:
        return new BlockchainServiceEvm(chain, walletCore);
      default:
        throw new Error('Chain not supported');
    }
  }
}
