import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'

import type { ChainAction } from './ChainAction'
import { isStakeableCoin } from './config'
import {
  computeMergeOptions,
  computeMintOptions,
  computeRedeemOptions,
  computeUnmergeOptions,
} from './utils/options'

type OptionsBuilderParams = {
  allCoins: AccountCoin[]
  thorCoins: AccountCoin[]
  addresses: Record<Chain, string>
  selected?: AccountCoin
  unmergeBalances?: { symbol: string }[]
}

type CorrectionParams = {
  action: ChainAction
  allCoins: AccountCoin[]
  selected?: AccountCoin
  options: AccountCoin[]
  chain?: Chain
}

type ActionPolicy = {
  buildOptions?: (ctx: OptionsBuilderParams) => AccountCoin[]
  correct?: (ctx: CorrectionParams) => AccountCoin | undefined
}

export const depositActionPolicies: Record<ChainAction, ActionPolicy> = {
  mint: {
    buildOptions: ({ thorCoins, addresses }) =>
      computeMintOptions({
        thorCoins,
        thorAddress: addresses[Chain.THORChain],
      }),
    correct: ({ selected, options }) =>
      (selected && findByTicker({ coins: options, ticker: selected.ticker })) ??
      options[0] ??
      selected,
  },
  redeem: {
    buildOptions: ({ allCoins, addresses }) =>
      computeRedeemOptions({
        allCoins,
        thorAddress: addresses[Chain.THORChain],
      }),
    correct: ({ selected, options }) =>
      (selected && findByTicker({ coins: options, ticker: selected.ticker })) ??
      options[0] ??
      selected,
  },
  merge: {
    buildOptions: ({ thorCoins }) => computeMergeOptions(thorCoins),
    correct: ({ selected, options }) =>
      (selected && findByTicker({ coins: options, ticker: selected.ticker })) ??
      options[0] ??
      selected,
  },
  unmerge: {
    buildOptions: ({ thorCoins, addresses, unmergeBalances = [] }) =>
      computeUnmergeOptions({
        thorCoins,
        thorAddress: addresses[Chain.THORChain],
        balances: unmergeBalances,
      }),
    correct: ({ selected, options }) =>
      (selected && findByTicker({ coins: options, ticker: selected.ticker })) ??
      options[0] ??
      selected,
  },

  bond: {
    correct: ({ allCoins, selected }) =>
      findByTicker({ coins: allCoins, ticker: 'RUNE' }) ?? selected,
  },

  stake_ruji: {
    correct: ({ allCoins, selected }) =>
      findByTicker({ coins: allCoins, ticker: 'RUJI' }) ?? selected,
  },
  unstake_ruji: {
    correct: ({ allCoins, selected }) =>
      findByTicker({ coins: allCoins, ticker: 'RUJI' }) ?? selected,
  },
  withdraw_ruji_rewards: {
    correct: ({ allCoins, selected }) =>
      findByTicker({ coins: allCoins, ticker: 'RUJI' }) ?? selected,
  },

  stake: {
    correct: ({ selected, chain, allCoins }) => {
      if (!selected) return selected
      if (chain !== Chain.THORChain) return selected
      return isStakeableCoin(selected.ticker)
        ? selected
        : (findByTicker({ coins: allCoins, ticker: 'TCY' }) ?? selected)
    },
  },
  unstake: {
    correct: ({ selected, chain, allCoins }) => {
      if (!selected) return selected
      if (chain !== Chain.THORChain) return selected
      return isStakeableCoin(selected.ticker)
        ? selected
        : (findByTicker({ coins: allCoins, ticker: 'TCY' }) ?? selected)
    },
  },
  ibc_transfer: {},
  switch: {},
  custom: {},
  vote: {},
  unbond: {},
  bond_with_lp: {},
  unbond_with_lp: {},
  leave: {},
} as const
