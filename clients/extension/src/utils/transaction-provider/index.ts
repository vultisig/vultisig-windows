import { WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import BaseTransactionProvider from "../transaction-provider/base";
import CosmosTransactionProvider from "../transaction-provider/cosmos";
import EVMTransactionProvider from "../transaction-provider/evm";
import GaiaTransactionProvider from "../transaction-provider/gaia";
import MayaTransactionProvider from "../transaction-provider/maya";
import ThorchainTransactionProvider from "../transaction-provider/thorchain";
import DydxTransactionProvider from "./dydx";
import KujiraTransactionProvider from "./kujira";
import OsmosisTransactionProvider from "./osmosis";
import UTXOTransactionProvider from "./utxo";
import SolanaTransactionProvider from "./solana";
import { Chain } from "@core/chain/Chain";

export {
  BaseTransactionProvider,
  CosmosTransactionProvider,
  EVMTransactionProvider,
  GaiaTransactionProvider,
  MayaTransactionProvider,
  ThorchainTransactionProvider,
};

interface ChainRef {
  [Chain: string]: CoinType;
}

export class TransactionProvider {
  static createProvider(
    chainKey: Chain,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore,
  ) {
    switch (chainKey) {
      case Chain.THORChain: {
        return new ThorchainTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.MayaChain: {
        return new MayaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.Cosmos: {
        return new GaiaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.Osmosis: {
        return new OsmosisTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.Kujira: {
        return new KujiraTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.Dydx: {
        return new DydxTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
      case Chain.Solana: {
        return new SolanaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
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
          walletCore,
        );
      }
      default: {
        return new EVMTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore,
        );
      }
    }
  }
}
