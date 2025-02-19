import { Chain } from '@core/chain/Chain'
import { WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'

import CosmosTransactionProvider from '../../transaction-provider/cosmos'

export default class OsmosisTransactionProvider extends CosmosTransactionProvider {
  constructor(
    chainKey: Chain,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore)
  }

  protected accountNumberURL(address: string): string | null {
    return `https://osmosis-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`
  }

  protected denom(): string {
    return 'uosmo'
  }
}
