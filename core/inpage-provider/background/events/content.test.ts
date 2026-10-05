import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runBackgroundEventsContentAgent } from './content'
import { backgroundEventMsgType } from './core'

const eventMessage = {
  type: backgroundEventMsgType,
  event: 'accountsChanged',
  value: undefined,
}

describe('runBackgroundEventsContentAgent', () => {
  let listener: (msg: unknown) => void
  const postMessage = vi.fn()

  const setOrigin = (origin: string) => {
    vi.stubGlobal('window', { origin, postMessage })
  }

  beforeEach(() => {
    postMessage.mockReset()
    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: {
          addListener: (handler: (msg: unknown) => void) => {
            listener = handler
          },
        },
      },
    })
    runBackgroundEventsContentAgent()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('forwards a background event to the page', () => {
    setOrigin('https://app.example.com')

    listener(eventMessage)

    expect(postMessage).toHaveBeenCalledExactlyOnceWith(
      eventMessage,
      'https://app.example.com'
    )
  })

  it('skips frames with an opaque origin', () => {
    setOrigin('null')

    expect(() => listener(eventMessage)).not.toThrow()
    expect(postMessage).not.toHaveBeenCalled()
  })

  it('ignores messages that are not background events', () => {
    setOrigin('https://app.example.com')

    listener({ type: 'somethingElse' })

    expect(postMessage).not.toHaveBeenCalled()
  })
})
