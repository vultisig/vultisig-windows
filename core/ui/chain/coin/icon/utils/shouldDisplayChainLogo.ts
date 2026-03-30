import { EthereumL2Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

export const shouldDisplayChainLogo = (coin: CoinKey): boolean =>
  isOneOf(coin.chain, Object.values(EthereumL2Chain)) || !isFeeCoin(coin)
