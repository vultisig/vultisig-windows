import { WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey } from "utils/constants";
import BaseTransactionProvider from "utils/transaction-provider/base";
import CosmosTransactionProvider from "utils/transaction-provider/cosmos";
import EVMTransactionProvider from "utils/transaction-provider/evm";
import GaiaTransactionProvider from "utils/transaction-provider/gaia";
import MayaTransactionProvider from "utils/transaction-provider/maya";
import ThorchainTransactionProvider from "utils/transaction-provider/thorchain";
import DydxTransactionProvider from "./dydx";
import KujiraTransactionProvider from "./kujira";
import OsmosisTransactionProvider from "./osmosis";
import UTXOTransactionProvider from "./utxo";
import SolanaTransactionProvider from "./solana";

export {
  BaseTransactionProvider,
  CosmosTransactionProvider,
  EVMTransactionProvider,
  GaiaTransactionProvider,
  MayaTransactionProvider,
  ThorchainTransactionProvider,
};

interface ChainRef {
  [chainKey: string]: CoinType;
}

export class TransactionProvider {
  static createProvider(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    switch (chainKey) {
      case ChainKey.THORCHAIN: {
        return new ThorchainTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.MAYACHAIN: {
        return new MayaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.GAIACHAIN: {
        return new GaiaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.OSMOSIS: {
        return new OsmosisTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.KUJIRA: {
        return new KujiraTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.DYDX: {
        return new DydxTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.SOLANA: {
        return new SolanaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.BITCOINCASH:
      case ChainKey.DASH:
      case ChainKey.DOGECOIN:
      case ChainKey.LITECOIN:
      case ChainKey.BITCOIN: {
        return new UTXOTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      default: {
        return new EVMTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
    }
  }
}
