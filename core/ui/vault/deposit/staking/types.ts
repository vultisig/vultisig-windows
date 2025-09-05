import { AccountCoin } from '@core/chain/coin/AccountCoin'

export type StakeParams = {
  sender: string
  coin: AccountCoin
  amount: number
}

export type UnstakeParams = {
  sender: string
  coin: AccountCoin
  percentage?: number
  unitsAvailable?: bigint
}

export type BuildResult =
  | {
      kind: 'bank_send'
      memo: string
      toAmount: string
    }
  | {
      kind: 'wasm_execute'
      contract: string
      executeMsg: string
      funds: Array<{ denom: string; amount: string }>
      toAmount: string
    }

export type StakingProvider = {
  id: string
  supportsStake(coin: AccountCoin): boolean
  supportsUnstake(coin: AccountCoin): boolean
  buildStake(ctx: StakeParams): BuildResult
  buildUnstake(ctx: UnstakeParams): BuildResult
  buildClaim?(sender: string, coin: AccountCoin): BuildResult
}
