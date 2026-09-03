import { encodeErrorResult, toFunctionSelector } from 'viem'
import { describe, expect, it } from 'vitest'

import { getSwapFailureReason } from './swapFailureReason'

const encodeStringRevert = (message: string) =>
  encodeErrorResult({
    abi: [
      {
        type: 'error',
        name: 'Error',
        inputs: [{ type: 'string', name: 'message' }],
      },
    ],
    errorName: 'Error',
    args: [message],
  })

describe('getSwapFailureReason', () => {
  it('reads the reasons the issue reported, as viem surfaces them', () => {
    expect(
      getSwapFailureReason({
        text: 'Execution reverted with reason: Insufficient output.',
      })
    ).toBe('slippage')

    expect(
      getSwapFailureReason({
        text: 'execution reverted: Return amount is not enough',
      })
    ).toBe('slippage')
  })

  it('matches however a contract happens to spell the phrase', () => {
    const spellings = [
      'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT',
      'V3TooLittleReceived()',
      'CumulativeSlippageTooHigh(1000000, 994000)',
      'Received amount of tokens are less then expected',
    ]

    spellings.forEach(text => {
      expect(getSwapFailureReason({ text })).toBe('slippage')
    })
  })

  it('decodes a string revert carried as raw data', () => {
    expect(
      getSwapFailureReason({ data: encodeStringRevert('Insufficient output') })
    ).toBe('slippage')
  })

  it('recognises a custom error from its selector alone', () => {
    expect(
      getSwapFailureReason({
        data: toFunctionSelector('ReturnAmountIsNotEnough()'),
      })
    ).toBe('slippage')
  })

  // These two revert as custom errors only. Their names never reach the client
  // as text, so a needle can never match them and the selector is the only
  // thing that can.
  it('recognises the custom errors that carry no text at all', () => {
    const selectorOnly = [
      'V4TooLittleReceived(uint256,uint256)',
      'IncompleteTransformERC20Error(address,uint256,uint256)',
    ]

    selectorOnly.forEach(signature => {
      expect(
        getSwapFailureReason({ data: toFunctionSelector(signature) })
      ).toBe('slippage')
    })
  })

  it('leaves an unrelated revert without a reason', () => {
    expect(
      getSwapFailureReason({
        text: 'execution reverted: ERC20: transfer amount exceeds balance',
      })
    ).toBeUndefined()

    expect(
      getSwapFailureReason({ data: encodeStringRevert('Deadline expired') })
    ).toBeUndefined()

    expect(
      getSwapFailureReason({ data: toFunctionSelector('Unauthorized()') })
    ).toBeUndefined()

    expect(getSwapFailureReason({})).toBeUndefined()
  })

  it('ignores revert data that is not hex', () => {
    expect(getSwapFailureReason({ data: 'slippage' })).toBeUndefined()
  })
})
