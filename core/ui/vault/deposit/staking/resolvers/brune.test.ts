import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { isBruneStakeCoin, isStakeableCoin } from '../../config'
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
    ticker: 'bRUNE',
    decimals: bruneBondConfig.depositDecimals,
    address: 'thor1address',
    logo: 'brune',
  }

  it('routes the canonical bRUNE denom to the brune provider', () => {
    expect(selectStakeId(bruneCoin)).toBe('brune')
  })

  it('does NOT route a look-alike bRUNE ticker with a different denom', () => {
    // A token that merely shares the `bRUNE` ticker but has a different denom
    // must not be routed into bRUNE staking (which always spends `x/brune`).
    expect(() =>
      selectStakeId({ ...bruneCoin, id: 'x/impostor', ticker: 'bRUNE' })
    ).toThrow()
  })
})

describe('isBruneStakeCoin', () => {
  it('matches only the canonical bRUNE denom on THORChain', () => {
    const base = { chain: Chain.THORChain, id: bruneBondConfig.depositDenom }
    expect(isBruneStakeCoin(base)).toBe(true)
    expect(isBruneStakeCoin({ ...base, id: 'x/impostor' })).toBe(false)
    expect(isBruneStakeCoin({ ...base, chain: Chain.Ethereum })).toBe(false)
  })
})

describe('isStakeableCoin', () => {
  it('matches the ticker-identified assets exactly (bRUNE is denom-based)', () => {
    expect(isStakeableCoin('TCY')).toBe(true)
    expect(isStakeableCoin('RUJI')).toBe(true)
    expect(isStakeableCoin('tcy')).toBe(false)
    expect(isStakeableCoin('bRUNE')).toBe(false)
    expect(isStakeableCoin('NOPE')).toBe(false)
  })
})
