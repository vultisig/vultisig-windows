import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'

import { mayaCoin, runeCoin, thorchainTokens } from '../queries/tokens'
import { ThorchainStakePosition } from '../queries/types'

type StakeAction =
  | 'stake'
  | 'unstake'
  | 'mint'
  | 'redeem'
  | 'withdraw_ruji_rewards'
  | 'add_cacao_pool'
  | 'remove_cacao_pool'

type StakeActionConfig = {
  stakeAction: StakeAction
  unstakeAction: StakeAction
  stakeLabel?: string
  unstakeLabel?: string
  actionsDisabled?: boolean
}

type ResolverInput = {
  chain: Chain
  position: ThorchainStakePosition
  translate: (key: string, params?: Record<string, unknown>) => string
}

const tokenById: Partial<Record<Chain, Record<string, Coin>>> = {
  [Chain.THORChain]: {
    'thor-stake-rune': runeCoin,
    'thor-stake-tcy': thorchainTokens.tcy,
    'thor-stake-stcy': thorchainTokens.stcy,
    'thor-stake-ruji': thorchainTokens.ruji,
    'thor-stake-yrune': thorchainTokens.yRune,
    'thor-stake-ytcy': thorchainTokens.yTcy,
  },
  [Chain.MayaChain]: {
    'maya-stake-cacao': mayaCoin,
  },
}

const stakeActionByChain: Partial<
  Record<Chain, (input: ResolverInput) => StakeActionConfig>
> = {
  [Chain.MayaChain]: ({ translate }) => ({
    stakeAction: 'add_cacao_pool',
    unstakeAction: 'remove_cacao_pool',
    stakeLabel: translate('defi_add'),
    unstakeLabel: translate('defi_remove'),
  }),
}

const defaultActions: StakeActionConfig = {
  stakeAction: 'stake',
  unstakeAction: 'unstake',
}

export const resolveStakeToken = (chain: Chain, positionId: string) => {
  const chainTokens = tokenById[chain]
  if (chainTokens?.[positionId]) return chainTokens[positionId]

  return { ...chainFeeCoin[chain], chain }
}

export const resolveStakeActions = ({
  chain,
  position,
  translate,
}: ResolverInput): StakeActionConfig => {
  const resolver = stakeActionByChain[chain]
  const base = resolver
    ? resolver({ chain, position, translate })
    : defaultActions

  if (
    chain === Chain.THORChain &&
    (position.id === 'thor-stake-yrune' || position.id === 'thor-stake-ytcy')
  ) {
    return {
      ...base,
      stakeAction: 'mint',
      unstakeAction: 'redeem',
      stakeLabel: translate('mint'),
      unstakeLabel: 'Unmint',
    }
  }

  // Index tokens should not allow stake/unstake from UI
  if (position.type === 'index') {
    return {
      ...base,
      actionsDisabled: true,
    }
  }

  return base
}

type TitleResolverInput = {
  position: ThorchainStakePosition
  coin: Coin
  translate: (key: string, params?: Record<string, unknown>) => string
}

export const resolveStakeTitle = ({
  position,
  coin,
  translate,
}: TitleResolverInput) => {
  if (position.type === 'index') return coin.ticker
  if (position.id === 'thor-stake-stcy') {
    return translate('compounded_token', { ticker: coin.ticker })
  }
  return `${translate('staked')} ${coin.ticker}`
}
