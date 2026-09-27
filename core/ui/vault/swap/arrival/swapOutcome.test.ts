import { SwapArrivalStatusResult } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { describe, expect, it } from 'vitest'

import { getSwapArrivalOutcome, getSwapSourceOutcome } from './swapOutcome'

const source = (status: TxStatusResult['status']): TxStatusResult => ({
  status,
})

const arrival = (
  status: SwapArrivalStatusResult['status']
): SwapArrivalStatusResult =>
  ({ provider: 'thorchain', txHash: 'hash', status }) as SwapArrivalStatusResult

describe('getSwapSourceOutcome', () => {
  it.each([
    ['pending', 'pending'],
    ['not_found', 'pending'],
    ['success', 'success'],
    ['error', 'failed'],
    ['expired', 'failed'],
  ] as const)('reads a %s source transaction as %s', (status, expected) => {
    expect(getSwapSourceOutcome(source(status))).toBe(expected)
  })
})

describe('getSwapArrivalOutcome', () => {
  it.each([
    ['pending', 'pending'],
    ['not_found', 'pending'],
    ['success', 'success'],
    ['partial', 'success'],
    ['refunded', 'failed'],
    ['error', 'failed'],
  ] as const)('reads a provider %s as %s', (status, expected) => {
    expect(getSwapArrivalOutcome(arrival(status))).toBe(expected)
  })
})
