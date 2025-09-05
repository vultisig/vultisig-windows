import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

import {
  BuildResult,
  StakeParams,
  StakingProvider,
  UnstakeParams,
} from './types'

// TCY native (memo-based)
const thorNativeTcy: StakingProvider = {
  id: 'thor.tcy.native',
  supportsStake: (coin: AccountCoin) => coin.ticker === 'TCY',
  supportsUnstake: (coin: AccountCoin) => coin.ticker === 'TCY',
  buildStake: ({ coin, amount }: StakeParams): BuildResult => {
    const amt = toChainAmount(amount, coin.decimals).toString()
    return { kind: 'bank_send', memo: 'tcy+', toAmount: amt }
  },
  buildUnstake: ({ percentage }: UnstakeParams): BuildResult => {
    const pct = Math.floor((percentage ?? 100) * 100) // basis points
    return { kind: 'bank_send', memo: `tcy-:${pct}`, toAmount: '0' }
  },
}

const tcyAutoCompounderConfig = {
  contract: 'thor1z7ejlk5wk2pxh9nfwjzkkdnrq4p2f5rjcpudltv0gh282dwfz6nq9g2cr0',
  depositDenom: 'tcy',
  depositDecimals: 8,
  shareDenom: 'x/staking-tcy',
  shareDecimals: 0,
} as const

const rujiraStcy: StakingProvider = {
  id: 'rujira.tcy.liquid',
  supportsStake: (coin: AccountCoin) => coin.ticker === 'TCY',
  supportsUnstake: (coin: AccountCoin) => coin.ticker === 'TCY',
  buildStake: ({ amount }: StakeParams): BuildResult => {
    const amt = toChainAmount(
      amount,
      tcyAutoCompounderConfig.depositDecimals
    ).toString()
    return {
      kind: 'wasm_execute',
      contract: tcyAutoCompounderConfig.contract,
      executeMsg: JSON.stringify({ liquid: { bond: {} } }),
      funds: [{ denom: tcyAutoCompounderConfig.depositDenom, amount: amt }],
      toAmount: amt,
    }
  },
  buildUnstake: ({
    percentage = 100,
    unitsAvailable = 0n,
  }: StakeParams): BuildResult => {
    const units = (BigInt(Math.floor(percentage)) * unitsAvailable) / 100n
    if (units < 1n) throw new Error('Unstake amount too low')
    return {
      kind: 'wasm_execute',
      contract: tcyAutoCompounderConfig.contract,
      executeMsg: JSON.stringify({ liquid: { unbond: {} } }),
      funds: [
        { denom: tcyAutoCompounderConfig.shareDenom, amount: units.toString() },
      ],
      toAmount: '0',
    }
  },
}

// RUJI (rujira-staking account)
const rujiraStakingConfig = {
  contract: 'thor13g83nn5ef4qzqeafp0508dnvkvm0zqr3sj7eefcn5umu65gqluusrml5cr',
  bondDenom: 'x/ruji',
  bondDecimals: 8,
} as const

const rujiraRuji: StakingProvider = {
  id: 'rujira.ruji',
  supportsStake: (coin: AccountCoin) => coin.ticker === 'RUJI',
  supportsUnstake: (coin: AccountCoin) => coin.ticker === 'RUJI',
  buildStake: ({ amount }: StakeParams): BuildResult => {
    const amt = toChainAmount(
      amount,
      rujiraStakingConfig.bondDecimals
    ).toString()
    return {
      kind: 'wasm_execute',
      contract: rujiraStakingConfig.contract,
      executeMsg: JSON.stringify({ account: { bond: {} } }),
      funds: [{ denom: rujiraStakingConfig.bondDenom, amount: amt }],
      toAmount: amt,
    }
  },
  buildUnstake: ({
    coin,
    amount,
  }: UnstakeParams & { amount?: number }): BuildResult => {
    // For RUJI unstake we use explicit amount (not %); amount is passed as number in UI
    const amt = toChainAmount(amount ?? 0, coin.decimals).toString()
    return {
      kind: 'wasm_execute',
      contract: rujiraStakingConfig.contract,
      executeMsg: JSON.stringify({ account: { withdraw: { amount: amt } } }),
      funds: [],
      toAmount: '0',
    }
  },
  buildClaim: (): BuildResult => ({
    kind: 'wasm_execute',
    contract: rujiraStakingConfig.contract,
    executeMsg: JSON.stringify({ account: { claim: {} } }),
    funds: [],
    toAmount: '0',
  }),
}

export const stakingProviders = [rujiraRuji, rujiraStcy, thorNativeTcy] as const

export function selectStakingProvider(opts: {
  coin: AccountCoin
  action: 'stake' | 'unstake' | 'claim'
  autoCompoundTcy?: boolean
}): StakingProvider {
  const { coin, action, autoCompoundTcy } = opts

  // RUJI always uses rujira provider
  if (coin.ticker === 'RUJI') return rujiraRuji

  // TCY: toggle picks provider
  if (coin.ticker === 'TCY') {
    if (autoCompoundTcy) return rujiraStcy
    return thorNativeTcy
  }

  // Fallback: native TCY-like (no-op), but we prefer explicit support
  const p = stakingProviders.find(p =>
    action === 'stake' ? p.supportsStake(coin) : p.supportsUnstake(coin)
  )
  if (!p) throw new Error('No staking provider for selection')
  return p
}
