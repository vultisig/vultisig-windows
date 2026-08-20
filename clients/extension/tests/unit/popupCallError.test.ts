import {
  broadcastFailedPopupResult,
  PopupError,
  signingFailedPopupResult,
  toPopupCallError,
} from '@core/inpage-provider/popup/error'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { describe, expect, it } from 'vitest'

// Popup failures reach the inpage through two serializing hops, so what
// `callPopup` rethrows is the plain sentinel, not the object it was sent as.
const overMessaging = (result: unknown) =>
  JSON.parse(JSON.stringify(result)).error

describe('toPopupCallError', () => {
  it('keeps the rejection sentinel identical so providers still match it', () => {
    const error = toPopupCallError(
      overMessaging({ error: PopupError.RejectedByUser })
    )

    expect(error).toBe(PopupError.RejectedByUser)
  })

  it.each([
    ['signing failure', signingFailedPopupResult, /signing/i],
    ['broadcast failure', broadcastFailedPopupResult, /broadcast/i],
  ])(
    'gives a non-EVM provider a readable Error for a %s',
    (_name, result, expected) => {
      const error = toPopupCallError(overMessaging(result))

      expect(error).toBeInstanceOf(Error)
      // Chains without their own translator interpolate the raw value, which
      // is why the sentinel identifier must not be what they receive.
      expect(extractErrorMsg(error)).toMatch(expected)
      expect(extractErrorMsg(error)).not.toBe(PopupError.SigningFailed)
    }
  )

  it('leaves an unrelated failure untouched', () => {
    const error = new Error('RPC timeout')

    expect(toPopupCallError(error)).toBe(error)
  })
})
