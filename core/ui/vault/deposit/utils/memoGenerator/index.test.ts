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

  describe('add_maya_lp', () => {
    const cacaoCoin = {
      chain: Chain.MayaChain,
      ticker: 'CACAO',
      decimals: 10,
    } as AccountCoin

    const btcCoin = {
      chain: Chain.Bitcoin,
      ticker: 'BTC',
      decimals: 8,
    } as AccountCoin

    it('names the asset address on the CACAO side', () => {
      const memo = generateMemo({
        selectedChainAction: 'add_maya_lp',
        depositFormData: { pool: 'BTC.BTC', pairedAddress: 'bc1qvault' },
        bondableAsset: 'BTC.BTC',
        chain: Chain.MayaChain,
        coin: cacaoCoin,
      })

      expect(memo).toBe('+:BTC.BTC:bc1qvault')
    })

    it('adds CACAO alone when no address pairs', () => {
      const memo = generateMemo({
        selectedChainAction: 'add_maya_lp',
        depositFormData: { pool: 'ETH.USDC-0XA0B8', pairedAddress: '' },
        bondableAsset: 'ETH.USDC-0XA0B8',
        chain: Chain.MayaChain,
        coin: cacaoCoin,
      })

      expect(memo).toBe('+:ETH.USDC-0XA0B8')
    })

    it('names the CACAO address on the asset side', () => {
      const memo = generateMemo({
        selectedChainAction: 'add_maya_lp',
        depositFormData: { pool: 'BTC.BTC', pairedAddress: 'maya1vault' },
        bondableAsset: 'BTC.BTC',
        chain: Chain.Bitcoin,
        coin: btcCoin,
      })

      expect(memo).toBe('+:BTC.BTC:maya1vault')
    })

    it('refuses an asset-side add without the CACAO address', () => {
      expect(() =>
        generateMemo({
          selectedChainAction: 'add_maya_lp',
          depositFormData: { pool: 'BTC.BTC', pairedAddress: '' },
          bondableAsset: 'BTC.BTC',
          chain: Chain.Bitcoin,
          coin: btcCoin,
        })
      ).toThrow()
    })
  })
})
