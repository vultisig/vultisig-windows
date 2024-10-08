import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../model/chain';
import { SendServiceCosmos } from './cosmos/SendServiceCosmos';
import { SendServiceEvm } from './evm/SendServiceEvm';
import { ISendService } from './ISendService';
import { SendService } from './SendService';
import { SendServiceSolana } from './solana/SendServiceSolana';
import { SendServiceThorchain } from './thorchain/SendServiceThorchain';
import { SendServiceUtxo } from './utxo/SendServiceUtxo';

export class SendServiceFactory {
  static createSendService(chain: Chain, walletCore: WalletCore): ISendService {
    switch (chain) {
      case Chain.THORChain:
        return new SendServiceThorchain(chain, walletCore);
      case Chain.MayaChain:
        return new SendServiceThorchain(chain, walletCore);
      case Chain.Arbitrum:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Avalanche:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Base:
        return new SendServiceEvm(chain, walletCore);
      case Chain.CronosChain:
        return new SendServiceEvm(chain, walletCore);
      case Chain.BSC:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Blast:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Ethereum:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Optimism:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Polygon:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Zksync:
        return new SendServiceEvm(chain, walletCore);
      case Chain.Bitcoin:
        return new SendServiceUtxo(chain, walletCore);
      case Chain.BitcoinCash:
        return new SendServiceUtxo(chain, walletCore);
      case Chain.Litecoin:
        return new SendServiceUtxo(chain, walletCore);
      case Chain.Dogecoin:
        return new SendServiceUtxo(chain, walletCore);
      case Chain.Dash:
        return new SendServiceUtxo(chain, walletCore);
      case Chain.Solana:
        return new SendServiceSolana(chain, walletCore);
      case Chain.Sui:
        return new SendService(chain, walletCore); // TODO: implement Sui
      case Chain.Cosmos:
        return new SendServiceCosmos(chain, walletCore);
      case Chain.Kujira:
        return new SendServiceCosmos(chain, walletCore);
      case Chain.Dydx:
        return new SendServiceCosmos(chain, walletCore);
      case Chain.Polkadot:
        return new SendService(chain, walletCore); // TODO: implement Polkadot
      default:
        throw new Error('Chain not supported');
    }
  }
}
