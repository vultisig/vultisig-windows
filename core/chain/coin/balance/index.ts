import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { CoinBalanceResolver } from './CoinBalanceResolver'
import { getCosmosCoinBalance } from './cosmos'
import { getEvmCoinBalance } from './evm'
import { getPolkadotCoinBalance } from './polkadot'
import { getRippleCoinBalance } from './ripple'
import { getSolanaCoinBalance } from './solana'
import { getSuiCoinBalance } from './sui'
import { getTonCoinBalance } from './ton'
import { getTronCoinBalance } from './tron'
import { getUtxoCoinBalance } from './utxo'

const handlers: Record<ChainKind, CoinBalanceResolver<any>> = {
  utxo: getUtxoCoinBalance,
  cosmos: getCosmosCoinBalance,
  sui: getSuiCoinBalance,
  evm: getEvmCoinBalance,
  ton: getTonCoinBalance,
  ripple: getRippleCoinBalance,
  polkadot: getPolkadotCoinBalance,
  solana: getSolanaCoinBalance,
  tron: getTronCoinBalance,
}

export const getCoinBalance: CoinBalanceResolver = async input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  return handler(input)
}
