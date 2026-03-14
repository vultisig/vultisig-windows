import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { CoinBalanceResolver } from './resolver'
import { getCardanoCoinBalance } from './resolvers/cardano'
import { getCosmosCoinBalance } from './resolvers/cosmos'
import { getEvmCoinBalance } from './resolvers/evm'
import { getMoneroCoinBalance } from './resolvers/monero'
import { getPolkadotCoinBalance } from './resolvers/polkadot'
import { getRippleCoinBalance } from './resolvers/ripple'
import { getSolanaCoinBalance } from './resolvers/solana'
import { getSuiCoinBalance } from './resolvers/sui'
import { getTonCoinBalance } from './resolvers/ton'
import { getTronCoinBalance } from './resolvers/tron'
import { getUtxoCoinBalance } from './resolvers/utxo'
import { getZcashSaplingCoinBalance } from './resolvers/zcashSapling'

const resolvers: Record<ChainKind, CoinBalanceResolver<any>> = {
  utxo: getUtxoCoinBalance,
  cosmos: getCosmosCoinBalance,
  sui: getSuiCoinBalance,
  evm: getEvmCoinBalance,
  ton: getTonCoinBalance,
  ripple: getRippleCoinBalance,
  polkadot: getPolkadotCoinBalance,
  solana: getSolanaCoinBalance,
  tron: getTronCoinBalance,
  cardano: getCardanoCoinBalance,
  zcashSapling: getZcashSaplingCoinBalance,
  monero: getMoneroCoinBalance,
}

export const getCoinBalance: CoinBalanceResolver = async input =>
  resolvers[getChainKind(input.chain)](input)
