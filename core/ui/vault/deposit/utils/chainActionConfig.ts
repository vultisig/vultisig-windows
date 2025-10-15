import { Chain } from '@core/chain/Chain'

import { ChainAction } from '../ChainAction'

type BalanceDisplayConfig = {
  showBalance: boolean
  balanceLabel?: 'balance' | 'shares'
  showTicker: boolean
}

const chainActionConfig: Record<ChainAction, BalanceDisplayConfig> = {
  bond: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  stake: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  unstake: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  switch: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  mint: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  redeem: { showBalance: true, balanceLabel: 'balance', showTicker: true },
  withdraw_ruji_rewards: {
    showBalance: true,
    balanceLabel: 'balance',
    showTicker: true,
  },
  ibc_transfer: {
    showBalance: true,
    balanceLabel: 'balance',
    showTicker: false,
  },
  merge: { showBalance: true, balanceLabel: 'balance', showTicker: false },
  unmerge: { showBalance: true, balanceLabel: 'shares', showTicker: false },
  unbond: { showBalance: false, showTicker: false },
  leave: { showBalance: false, showTicker: false },
  custom: { showBalance: false, showTicker: false },
  bond_with_lp: { showBalance: false, showTicker: false },
  unbond_with_lp: { showBalance: false, showTicker: false },
  vote: { showBalance: false, showTicker: false },
}

export const getBalanceDisplayConfig = (
  chainAction: ChainAction,
  chain: Chain
): BalanceDisplayConfig => {
  const baseConfig = chainActionConfig[chainAction]

  if (chainAction === 'stake' && chain === Chain.Ton) {
    return {
      ...baseConfig,
      showTicker: false,
    }
  }

  return baseConfig
}

export const shouldShowBalance = (
  fieldName: string,
  chainAction: ChainAction
): boolean => {
  if (fieldName !== 'amount') return false
  return chainActionConfig[chainAction].showBalance
}

export const shouldShowTicker = (
  fieldName: string,
  chainAction: ChainAction,
  chain: Chain
): boolean => {
  if (fieldName !== 'amount') return false
  const config = getBalanceDisplayConfig(chainAction, chain)
  return config.showTicker
}

export const getBalanceLabel = (chainAction: ChainAction): string => {
  return chainActionConfig[chainAction].balanceLabel || 'balance'
}
