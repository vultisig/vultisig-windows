import { WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey } from "../../constants";

import CosmosTransactionProvider from "../../transaction-provider/cosmos";

export default class GaiaTransactionProvider extends CosmosTransactionProvider {
  constructor(
    chainKey: ChainKey,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore);
  }

  protected accountNumberURL(address: string): string | null {
    return `https://cosmos-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  protected denom(): string {
    return "uatom";
  }
}
