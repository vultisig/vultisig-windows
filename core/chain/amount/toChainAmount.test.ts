import { decimalStringToBigInt } from '@lib/utils/bigint/decimalStringToBigInt'
import { describe, expect, it } from 'vitest'

import { toChainAmount } from './toChainAmount'

describe('toChainAmount - Floating Point Bug', () => {
  it('should show the floating-point precision loss with toChainAmount', () => {
    const decimals = 18
    const result = toChainAmount(28.57142857142857, decimals)
    const correctResult = decimalStringToBigInt('28.57142857142857', decimals) // Properly truncated

    console.log(`\ntoChainAmount precision loss:`)
    console.log(`toChainAmount result: ${result}`)
    console.log(`Correct truncated: ${correctResult}`)
    console.log(`Match: ${result === correctResult}`)

    // Show the precision loss
    expect(result).toBe(correctResult)
  })
})
