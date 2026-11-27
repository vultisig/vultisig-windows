import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { generateMemo } from './index'

const node = 'thor19m4kqulyqvya339jfja84h6qp8tkjgxuxa4n4a'
const vault = 'thor1x2whgc2nt665y0kc44uywhynazvp0l8tp0vtu6'

const runeCoin = {
  chain: Chain.THORChain,
  ticker: 'RUNE',
  decimals: 8,
  address: vault,
} as AccountCoin

const bondYieldMemo = (payoutPercentage: unknown) =>
  generateMemo({
    selectedChainAction: 'bond_yield',
    depositFormData: { nodeAddress: node, payoutPercentage },
    bondableAsset: 'THOR.RUNE',
    chain: Chain.THORChain,
    coin: runeCoin,
  })

// Expected memos follow the BONDYIELD examples in
// https://dev.thorchain.org/concepts/memos.html
describe('generateMemo bond_yield', () => {
  it('pays the share out to the vault address in basis points', () => {
    expect(bondYieldMemo(40)).toBe(`BONDYIELD:${node}:4000:${vault}`)
    expect(bondYieldMemo(1)).toBe(`BONDYIELD:${node}:100:${vault}`)
    expect(bondYieldMemo(100)).toBe(`BONDYIELD:${node}:10000:${vault}`)
  })

  it('disables payouts without a target at 0%', () => {
    expect(bondYieldMemo(0)).toBe(`BONDYIELD:${node}:0`)
  })

  it('rejects a percentage that is not a whole number from 0 to 100', () => {
    for (const value of [
      -1,
      101,
      12.5,
      Number.NaN,
      undefined,
      null,
      '',
      '50',
    ]) {
      expect(() => bondYieldMemo(value)).toThrow()
    }
  })
})
