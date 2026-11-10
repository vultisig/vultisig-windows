import { describe, expect, it } from 'vitest'

import { summarizeCosmosSignDataTransfers } from './summarizeCosmosSignDataTransfers'

describe('summarizeCosmosSignDataTransfers', () => {
  it('lists every recipient and totals each coin', () => {
    expect(
      summarizeCosmosSignDataTransfers([
        { recipient: 'cosmos1first', coin: { denom: 'uatom', amount: 1n } },
        { recipient: 'cosmos1second', coin: { denom: 'uatom', amount: 1000n } },
        { recipient: 'cosmos1first', coin: { denom: 'uosmo', amount: 7n } },
      ])
    ).toEqual({
      recipients: ['cosmos1first', 'cosmos1second'],
      coins: [
        { denom: 'uatom', amount: 1001n },
        { denom: 'uosmo', amount: 7n },
      ],
      memos: [],
    })
  })

  it('keeps distinct memos and skips transfers without a recipient', () => {
    expect(
      summarizeCosmosSignDataTransfers([
        { coin: { denom: 'rune', amount: 2n }, memo: '=:ETH.ETH:0xabc' },
        { coin: { denom: 'rune', amount: 3n }, memo: '=:ETH.ETH:0xabc' },
        { coin: { denom: 'rune', amount: 4n }, memo: '=:BTC.BTC:bc1q' },
      ])
    ).toEqual({
      recipients: [],
      coins: [{ denom: 'rune', amount: 9n }],
      memos: ['=:ETH.ETH:0xabc', '=:BTC.BTC:bc1q'],
    })
  })
})
