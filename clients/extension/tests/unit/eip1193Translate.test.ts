import {
  callNotFoundPopupResult,
  PopupError,
  signingFailedPopupResult,
} from '@core/inpage-provider/popup/error'
import { describe, expect, it } from 'vitest'

import { toEip1193Error } from '../../src/inpage/providers/ethereum/eip1193Translate'

const internalErrorCode = -32603

// Popup results reach the provider through `chrome.runtime` messaging, which
// serializes them. Round-tripping mirrors that trip.
const overMessaging = (result: unknown) =>
  JSON.parse(JSON.stringify(result)).error

describe('toEip1193Error', () => {
  it('reports a failed sign with a message naming signing, not "Internal error"', () => {
    const error = toEip1193Error(overMessaging(signingFailedPopupResult))

    expect(error.code).toBe(internalErrorCode)
    expect(error.message).toMatch(/signing/i)
    expect(error.message).not.toBe('Internal error')
  })

  it('reports a missing pending call with readable wording', () => {
    const error = toEip1193Error(overMessaging(callNotFoundPopupResult))

    expect(error.code).toBe(internalErrorCode)
    expect(error.message).not.toBe('Internal error')
  })

  it('never leaks the raw sentinel identifier to the dApp', () => {
    const error = toEip1193Error(overMessaging(signingFailedPopupResult))

    expect(error.message).not.toBe(PopupError.SigningFailed)
  })

  it('still maps a rejection to 4001', () => {
    const error = toEip1193Error(
      overMessaging({ error: PopupError.RejectedByUser })
    )

    expect(error.code).toBe(4001)
  })

  it('falls back to "Internal error" for a value with no message', () => {
    // What an `Error` instance degrades to once serialized — the shape this
    // sentinel approach exists to avoid.
    expect(toEip1193Error({}).message).toBe('Internal error')
  })
})
