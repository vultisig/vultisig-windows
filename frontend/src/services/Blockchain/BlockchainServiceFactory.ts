import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../model/chain';
import { BlockchainServiceCosmos } from './cosmos/BlockchainServiceCosmos';
import { BlockchainServiceEvm } from './evm/BlockchainServiceEvm';
import { IBlockchainService } from './IBlockchainService';
import { BlockchainServiceMaya } from './maya/BlockchainServiceMaya';
import { BlockchainServicePolkadot } from './polkadot/BlockchainServicePolkadot';
import { BlockchainServiceSolana } from './solana/BlockchainServiceSolana';
import { BlockchainServiceSui } from './sui/BlockchainServiceSui';
import { BlockchainServiceThorchain } from './thorchain/BlockchainServiceThorchain';
import { BlockchainServiceTon } from './ton/BlockchainServiceTon';
import { BlockchainServiceUtxo } from './utxo/BlockchainServiceUtxo';

export class BlockchainServiceFactory {
  static createService(
    chain: Chain,
    walletCore: WalletCore
  ): IBlockchainService {
    switch (chain) {
      case Chain.THORChain:
        return new BlockchainServiceThorchain(chain, walletCore);
      case Chain.MayaChain:
        return new BlockchainServiceMaya(chain, walletCore);
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
      case Chain.Polygon:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Zksync:
        return new BlockchainServiceEvm(chain, walletCore);
      case Chain.Solana:
        return new BlockchainServiceSolana(chain, walletCore);
      case Chain.Sui:
        return new BlockchainServiceSui(chain, walletCore);
      case Chain.Cosmos:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.Osmosis:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.Kujira:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.Dydx:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.Terra:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.TerraClassic:
        return new BlockchainServiceCosmos(chain, walletCore);
      case Chain.Polkadot:
        return new BlockchainServicePolkadot(chain, walletCore);
      case Chain.Ton:
        return new BlockchainServiceTon(chain, walletCore);
      default:
        throw new Error('Chain not supported');
    }
  }
}
