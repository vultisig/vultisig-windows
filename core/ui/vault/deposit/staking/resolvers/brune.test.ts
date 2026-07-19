import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { isStakeableCoin } from '../../config'
import { getBruneSpecific } from './brune'
import { selectStakeId } from './index'

describe('getBruneSpecific', () => {
  it('builds a liquid.bond wasm execute funded with bRUNE for stake', () => {
    expect(getBruneSpecific({ input: { kind: 'stake', amount: 1.5 } })).toEqual(
      {
        kind: 'wasm',
        contract: bruneBondConfig.contract,
        executeMsg: { liquid: { bond: {} } },
        funds: [
          {
            denom: bruneBondConfig.depositDenom,
            amount: toChainAmount(
              1.5,
              bruneBondConfig.depositDecimals
            ).toString(),
          },
        ],
      }
    )
  })

  it('builds a liquid.unbond wasm execute funded with ybRUNE for unstake', () => {
    expect(getBruneSpecific({ input: { kind: 'unstake', amount: 2 } })).toEqual(
      {
        kind: 'wasm',
        contract: bruneBondConfig.contract,
        executeMsg: { liquid: { unbond: {} } },
        funds: [
          {
            denom: bruneBondConfig.shareDenom,
            amount: toChainAmount(2, bruneBondConfig.shareDecimals).toString(),
          },
        ],
      }
    )
  })
})

describe('selectStakeId for bRUNE', () => {
  const bruneCoin: AccountCoin = {
    chain: Chain.THORChain,
    id: bruneBondConfig.depositDenom,
    ticker: 'BRUNE',
    decimals: bruneBondConfig.depositDecimals,
    address: 'thor1address',
    logo: 'brune',
  }

  it('routes the bRUNE deposit denom to the brune provider', () => {
    expect(selectStakeId(bruneCoin)).toBe('brune')
  })

  it('routes regardless of the coin ticker casing (bRUNE vs BRUNE)', () => {
    expect(selectStakeId({ ...bruneCoin, ticker: 'bRUNE' })).toBe('brune')
  })
})

describe('isStakeableCoin', () => {
  it('accepts the bRUNE brand ticker case-insensitively', () => {
    expect(isStakeableCoin('bRUNE')).toBe(true)
    expect(isStakeableCoin('BRUNE')).toBe(true)
    expect(isStakeableCoin('RUJI')).toBe(true)
    expect(isStakeableCoin('NOPE')).toBe(false)
  })
})
