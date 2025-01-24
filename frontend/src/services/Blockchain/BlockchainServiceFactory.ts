import { WalletCore } from '@trustwallet/wallet-core';

import { match } from '../../lib/utils/match';
import { Chain } from '../../model/chain';
import { BlockchainServiceCosmos } from './cosmos/BlockchainServiceCosmos';
import { BlockchainServiceEvm } from './evm/BlockchainServiceEvm';
import { IBlockchainService } from './IBlockchainService';
import { BlockchainServiceMaya } from './maya/BlockchainServiceMaya';
import { BlockchainServicePolkadot } from './polkadot/BlockchainServicePolkadot';
import { BlockchainServiceRipple } from './ripple/BlockchainServiceRipple';
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
    return match(chain, {
      [Chain.THORChain]: () =>
        new BlockchainServiceThorchain(chain, walletCore),
      [Chain.MayaChain]: () => new BlockchainServiceMaya(chain, walletCore),
      [Chain.Bitcoin]: () => new BlockchainServiceUtxo(chain, walletCore),
      [Chain.BitcoinCash]: () => new BlockchainServiceUtxo(chain, walletCore),
      [Chain.Litecoin]: () => new BlockchainServiceUtxo(chain, walletCore),
      [Chain.Dash]: () => new BlockchainServiceUtxo(chain, walletCore),
      [Chain.Dogecoin]: () => new BlockchainServiceUtxo(chain, walletCore),
      [Chain.Avalanche]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Sui]: () => new BlockchainServiceSui(chain, walletCore),
      [Chain.Cosmos]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Akash]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Ripple]: () => new BlockchainServiceRipple(chain, walletCore),
      [Chain.Noble]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Osmosis]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Kujira]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Dydx]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Terra]: () => new BlockchainServiceCosmos(chain, walletCore),
      [Chain.TerraClassic]: () =>
        new BlockchainServiceCosmos(chain, walletCore),
      [Chain.Ton]: () => new BlockchainServiceTon(chain, walletCore),
      [Chain.Polkadot]: () => new BlockchainServicePolkadot(chain, walletCore),
      [Chain.BSC]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Zksync]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Optimism]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.CronosChain]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Base]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Arbitrum]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Blast]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Polygon]: () => new BlockchainServiceEvm(chain, walletCore),
      [Chain.Solana]: () => new BlockchainServiceSolana(chain, walletCore),
      [Chain.Ethereum]: () => new BlockchainServiceEvm(chain, walletCore),
    });
  }
}
