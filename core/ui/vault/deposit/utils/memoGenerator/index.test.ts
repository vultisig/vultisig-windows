import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import {
  tronWithdrawExpireUnfreezeAction,
  tronWithdrawExpireUnfreezeMemo,
} from '../../tron/withdrawExpireUnfreeze'
import { generateMemo } from './index'

const runeCoin = {
  chain: Chain.THORChain,
  ticker: 'RUNE',
  decimals: 8,
} as AccountCoin

describe('generateMemo', () => {
  it('encodes the exact unbond amount in base units', () => {
    // Math.round(Number('123456789.87654321') * 1e8) is 12345678987654320 —
    // float scaling loses the last digit of full-precision amounts (#4494)
    const memo = generateMemo({
      selectedChainAction: 'unbond',
      depositFormData: {
        nodeAddress: 'thor1node',
        amount: '123456789.87654321',
      },
      bondableAsset: 'THOR.RUNE',
      chain: Chain.THORChain,
      coin: runeCoin,
    })

    expect(memo).toBe('UNBOND:thor1node:12345678987654321')
  })

  it('encodes plain unbond amounts', () => {
    const memo = generateMemo({
      selectedChainAction: 'unbond',
      depositFormData: { nodeAddress: 'thor1node', amount: '1.5' },
      bondableAsset: 'THOR.RUNE',
      chain: Chain.THORChain,
      coin: runeCoin,
    })

    expect(memo).toBe('UNBOND:thor1node:150000000')
  })

  it('encodes the TRON matured-unfreeze claim marker without an amount', () => {
    const memo = generateMemo({
      selectedChainAction: tronWithdrawExpireUnfreezeAction,
      depositFormData: {},
      bondableAsset: 'THOR.RUNE',
      chain: Chain.Tron,
      coin: {
        chain: Chain.Tron,
        ticker: 'TRX',
        decimals: 6,
        address: 'TClaimOwner',
      } as AccountCoin,
    })

    expect(memo).toBe(tronWithdrawExpireUnfreezeMemo)
  })
})
