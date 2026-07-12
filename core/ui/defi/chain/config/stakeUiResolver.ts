import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'

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

/**
 * Translation keys that the stake UI resolver can request from its caller.
 */
export type StakeUiTranslationKey =
  | 'compounded_token'
  | 'defi_add'
  | 'defi_remove'
  | 'mint'
  | 'redeem'
  | 'staked'

type ResolverInput = {
  chain: Chain
  position: ThorchainStakePosition
  translate: (
    key: StakeUiTranslationKey,
    params?: Record<string, unknown>
  ) => string
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

/**
 * DeFi staking positions whose on-chain receipt is a transferable bank denom,
 * mapped to the coin that should actually be sent. This is intentionally the
 * receipt token the vault holds (e.g. `sRUJI` / `x/staking-x/ruji`), not the
 * liquid asset used for stake/unstake (`resolveStakeToken` returns the latter).
 *
 * Positions absent from this list are treated as non-transferable (e.g. bonded
 * RUNE), so they get no Send button. Add an entry here — the single source of
 * truth — to enable Send for a new receipt token.
 */
const transferableStakeTokenById: Partial<Record<Chain, Record<string, Coin>>> =
  {
    [Chain.THORChain]: {
      'thor-stake-stcy': thorchainTokens.stcy,
      'thor-stake-ruji': thorchainTokens.sruji,
    },
  }

/**
 * Returns the coin to send for a transferable stake position, or `undefined`
 * when the position's receipt is not transferable.
 */
export const resolveTransferableStakeToken = (
  chain: Chain,
  positionId: string
): Coin | undefined => transferableStakeTokenById[chain]?.[positionId]

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
      unstakeLabel: translate('redeem'),
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
  translate: (
    key: StakeUiTranslationKey,
    params?: Record<string, unknown>
  ) => string
}

export const resolveStakeTitle = ({
  position,
  coin,
  translate,
}: TitleResolverInput) => {
  if (position.type === 'index') return coin.ticker
  if (position.id === 'thor-stake-stcy') {
    return translate('compounded_token', { ticker: 'TCY' })
  }
  return `${translate('staked')} ${coin.ticker}`
}
