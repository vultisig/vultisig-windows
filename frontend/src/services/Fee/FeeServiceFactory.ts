import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../model/chain';
import { FeeServiceCosmos } from './cosmos/FeeServiceCosmos';
import { FeeServiceEvm } from './evm/FeeServiceEvm';
import { IFeeService } from './IFeeService';
import { FeeServicePolkadot } from './polkadot/FeeServicePolkadot';
import { FeeServiceSolana } from './solana/FeeServiceSolana';
import { FeeServiceSui } from './sui/FeeServiceSui';
import { FeeServiceThorchain } from './thorchain/FeeServiceThorchain';
import { FeeServiceUtxo } from './utxo/FeeServiceUtxo';

export class FeeServiceFactory {
  static createFeeService(chain: Chain, walletCore: WalletCore): IFeeService {
    switch (chain) {
      case Chain.Solana:
        return new FeeServiceSolana(chain, walletCore);
      case Chain.Polkadot:
        return new FeeServicePolkadot(chain, walletCore);
      case Chain.Ethereum:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Optimism:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Polygon:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Arbitrum:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Blast:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Base:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.CronosChain:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.BSC:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Zksync:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.THORChain:
        return new FeeServiceThorchain(chain, walletCore);
      case Chain.MayaChain:
        return new FeeServiceThorchain(chain, walletCore);
      case Chain.Bitcoin:
        return new FeeServiceUtxo(chain, walletCore);
      case Chain.BitcoinCash:
        return new FeeServiceUtxo(chain, walletCore);
      case Chain.Litecoin:
        return new FeeServiceUtxo(chain, walletCore);
      case Chain.Dash:
        return new FeeServiceUtxo(chain, walletCore);
      case Chain.Dogecoin:
        return new FeeServiceUtxo(chain, walletCore);
      case Chain.Avalanche:
        return new FeeServiceEvm(chain, walletCore);
      case Chain.Sui:
        return new FeeServiceSui(chain, walletCore);
      case Chain.Gaia:
        return new FeeServiceCosmos(chain, walletCore);
      case Chain.Kujira:
        return new FeeServiceCosmos(chain, walletCore);
      case Chain.Dydx:
        return new FeeServiceCosmos(chain, walletCore);
      default:
        throw new Error(`Chain not supported ${chain}`);
    }
  }
}
