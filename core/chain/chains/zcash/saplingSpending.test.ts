import { describe, expect, it } from 'vitest'

import {
  getZcashSaplingSpendableBalance,
  getZcashSaplingSpendableNotes,
  getZcashSaplingZip317Fee,
  planZcashSaplingSpend,
} from './saplingSpending'

describe('sapling spending rules', () => {
  it('filters out notes with fewer than 3 confirmations', () => {
    const notes = [
      { txid: 'a', outputIndex: 0, height: 97, value: 5, spent: false },
      { txid: 'b', outputIndex: 0, height: 98, value: 7, spent: false },
      { txid: 'c', outputIndex: 0, height: 100, value: 11, spent: false },
      { txid: 'd', outputIndex: 0, value: 13, spent: false },
      { txid: 'e', outputIndex: 0, height: 90, value: 17, spent: true },
    ] as any

    const spendable = getZcashSaplingSpendableNotes(notes, 100)

    expect(spendable.map(note => note.txid)).toEqual(['a', 'd'])
    expect(getZcashSaplingSpendableBalance(notes, 100)).toBe(18n)
  })

  it('computes ZIP-317 fees from logical actions', () => {
    expect(
      getZcashSaplingZip317Fee({
        saplingSpends: 1,
        saplingOutputs: 1,
      })
    ).toBe(10000)

    expect(
      getZcashSaplingZip317Fee({
        saplingSpends: 3,
        saplingOutputs: 2,
      })
    ).toBe(15000)

    expect(
      getZcashSaplingZip317Fee({
        saplingSpends: 1,
        saplingOutputs: 3,
      })
    ).toBe(15000)
  })

  it('recomputes the fee from the final selected spend count', () => {
    const notes = [
      {
        txid: 'a',
        outputIndex: 0,
        height: 1,
        value: 10000,
        spent: false,
        noteData: 'aa',
        witnessData: 'bb',
      },
      {
        txid: 'b',
        outputIndex: 0,
        height: 1,
        value: 10000,
        spent: false,
        noteData: 'cc',
        witnessData: 'dd',
      },
      {
        txid: 'c',
        outputIndex: 0,
        height: 1,
        value: 10000,
        spent: false,
        noteData: 'ee',
        witnessData: 'ff',
      },
    ] as any

    const plan = planZcashSaplingSpend({
      notes,
      chainHeight: 100,
      amount: 15000,
    })

    expect(plan.selectedNotes.map(note => note.txid)).toEqual(['a', 'b', 'c'])
    expect(plan.fee).toBe(15000)
    expect(plan.changeAmount).toBe(0)
    expect(plan.outputCount).toBe(1)
  })
})
