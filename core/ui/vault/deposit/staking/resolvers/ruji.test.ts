import { Chain } from '@vultisig/core-chain/Chain'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { getRujiSpecific } from './ruji'

const rujiCoin: AccountCoin = {
  chain: Chain.THORChain,
  id: 'x/ruji',
  ticker: 'RUJI',
  decimals: 8,
  address: 'thor1test',
}

// Share price 2.0: 0.5 sRUJI shares are worth 1.0 RUJI.
const liquidShares = 50_000_000n
const liquidSize = 100_000_000n

describe('getRujiSpecific unstake', () => {
  it('redeems the full sRUJI receipt via liquid.unbond on a max unstake', () => {
    const result = getRujiSpecific({
      coin: rujiCoin,
      input: { kind: 'unstake', amount: 1, liquidShares, liquidSize },
    })

    expect(result).toEqual({
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { liquid: { unbond: {} } },
      funds: [{ denom: 'x/staking-x/ruji', amount: '50000000' }],
    })
  })

  it('converts a partial underlying amount to proportional receipt shares', () => {
    const result = getRujiSpecific({
      coin: rujiCoin,
      input: { kind: 'unstake', amount: 0.5, liquidShares, liquidSize },
    })

    expect(result).toEqual({
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { liquid: { unbond: {} } },
      // 0.5 RUJI / share price 2.0 = 0.25 sRUJI
      funds: [{ denom: 'x/staking-x/ruji', amount: '25000000' }],
    })
  })

  it('withdraws the bonded position when there is no liquid position', () => {
    const result = getRujiSpecific({
      coin: rujiCoin,
      input: {
        kind: 'unstake',
        amount: 0.0787,
        liquidShares: 0n,
        liquidSize: 0n,
      },
    })

    expect(result).toEqual({
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { account: { withdraw: { amount: '7870000' } } },
      funds: [],
    })
  })
})
