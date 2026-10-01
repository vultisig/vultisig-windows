import { BackgroundError } from '@core/inpage-provider/background/error'
import { serializeBridgeError } from '@core/inpage-provider/bridge/serializeBridgeError'
import { PopupError } from '@core/inpage-provider/popup/error'
import { describe, expect, it } from 'vitest'

import { toEip1193Error } from '../../src/inpage/providers/ethereum/eip1193Translate'

const overMessaging = (value: unknown) => JSON.parse(JSON.stringify(value))

describe('serializeBridgeError', () => {
  it.each([PopupError.RejectedByUser, BackgroundError.Unauthorized])(
    'keeps the sentinel %s identical so identity checks still match',
    sentinel => {
      expect(serializeBridgeError(sentinel)).toBe(sentinel)
    }
  )

  it('keeps the message of a plain Error under -32603', () => {
    expect(
      serializeBridgeError(new Error('HTTP request failed. Status: 503'))
    ).toEqual({ code: -32603, message: 'HTTP request failed. Status: 503' })
  })

  it('preserves a node JSON-RPC code, message and data', () => {
    const error = { code: -32000, message: 'execution reverted', data: '0x08' }

    expect(serializeBridgeError(error)).toEqual(error)
  })

  it('drops data that cannot be serialized but keeps code and message', () => {
    const data: Record<string, unknown> = {}
    data.self = data

    expect(
      serializeBridgeError({ code: -32000, message: 'boom', data })
    ).toEqual({ code: -32000, message: 'boom' })
  })

  it('never produces an empty message', () => {
    expect(serializeBridgeError(undefined).message).not.toBe('')
    expect(serializeBridgeError({}).message).not.toBe('')
  })

  it('reaches the dApp with the real message after the messaging hop', () => {
    const wire = overMessaging({
      error: serializeBridgeError(
        new Error('HTTP request failed. Status: 503')
      ),
    })

    const error = toEip1193Error(wire.error)

    expect(error.message).toBe('HTTP request failed. Status: 503')
    expect(error.code).toBe(-32603)
  })
})
