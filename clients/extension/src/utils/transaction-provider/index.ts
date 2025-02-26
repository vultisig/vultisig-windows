import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import CosmosTransactionProvider from '@clients/extension/src/utils/transaction-provider/cosmos'
import DydxTransactionProvider from '@clients/extension/src/utils/transaction-provider/dydx'
import EVMTransactionProvider from '@clients/extension/src/utils/transaction-provider/evm'
import GaiaTransactionProvider from '@clients/extension/src/utils/transaction-provider/gaia'
import KujiraTransactionProvider from '@clients/extension/src/utils/transaction-provider/kujira'
import MayaTransactionProvider from '@clients/extension/src/utils/transaction-provider/maya'
import OsmosisTransactionProvider from '@clients/extension/src/utils/transaction-provider/osmosis'
import SolanaTransactionProvider from '@clients/extension/src/utils/transaction-provider/solana'
import ThorchainTransactionProvider from '@clients/extension/src/utils/transaction-provider/thorchain'
import UTXOTransactionProvider from '@clients/extension/src/utils/transaction-provider/utxo'
import { Chain, EvmChain } from '@core/chain/Chain'
import { WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'

export {
  BaseTransactionProvider,
  CosmosTransactionProvider,
  EVMTransactionProvider,
  GaiaTransactionProvider,
  MayaTransactionProvider,
  ThorchainTransactionProvider,
}

interface ChainRef {
  [Chain: string]: CoinType
}

export class TransactionProvider {
  static createProvider(
    chainKey: Chain,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    switch (chainKey) {
      case Chain.THORChain: {
        return new ThorchainTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.MayaChain: {
        return new MayaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.Cosmos: {
        return new GaiaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.Osmosis: {
        return new OsmosisTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.Kujira: {
        return new KujiraTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.Dydx: {
        return new DydxTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.Solana: {
        return new SolanaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      case Chain.BitcoinCash:
      case Chain.Dash:
      case Chain.Dogecoin:
      case Chain.Litecoin:
      case Chain.Bitcoin: {
        return new UTXOTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
      default: {
        return new EVMTransactionProvider(
          chainKey as EvmChain,
          chainRef,
          dataEncoder,
          walletCore
        )
      }
    }
  }
}
