import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  isSidePanelPopupRequest,
  SidePanelPopupRequest,
} from '../../sidePanel/request'
import { openInSidePanel } from './inSidePanel'

// The slice of `chrome.runtime.Port` the background uses.
type PortStub = {
  name: string
  postMessage: (message: unknown) => void
  disconnect: () => void
  onDisconnect: {
    addListener: (listener: () => void) => void
    removeListener: (listener: () => void) => void
  }
}

type FakePort = {
  sent: unknown[]
  isDisconnected: boolean
  disconnectFromPanel: () => void
  port: PortStub
}

const createFakePort = (name: string): FakePort => {
  const disconnectListeners = new Set<() => void>()
  const fake: FakePort = {
    sent: [],
    isDisconnected: false,
    disconnectFromPanel: () =>
      disconnectListeners.forEach(listener => listener()),
    port: {
      name,
      postMessage: message => {
        fake.sent.push(message)
      },
      disconnect: () => {
        fake.isDisconnected = true
      },
      onDisconnect: {
        addListener: listener => {
          disconnectListeners.add(listener)
        },
        removeListener: listener => {
          disconnectListeners.delete(listener)
        },
      },
    },
  }

  return fake
}

type PanelBehavior = 'claim' | 'ignore' | 'absent' | 'claimWithoutPort'

type ChromeStub = {
  requests: SidePanelPopupRequest[]
  ports: FakePort[]
  connectListenerCount: () => number
}

type StubChromeInput = {
  openSidePanels?: number
  panel?: PanelBehavior
  hasSidePanelApi?: boolean
  // Delivers the panel's port only after it has answered the claim.
  isPortLate?: boolean
}

const stubChrome = ({
  openSidePanels = 1,
  panel = 'claim',
  hasSidePanelApi = true,
  isPortLate = false,
}: StubChromeInput = {}): ChromeStub => {
  const connectListeners = new Set<(port: PortStub) => void>()
  const stub: ChromeStub = {
    requests: [],
    ports: [],
    connectListenerCount: () => connectListeners.size,
  }

  const connect = (name: string) => {
    const fake = createFakePort(name)
    stub.ports.push(fake)
    connectListeners.forEach(listener => listener(fake.port))
  }

  vi.stubGlobal('chrome', {
    sidePanel: hasSidePanelApi ? {} : undefined,
    runtime: {
      getContexts: async () =>
        Array.from({ length: openSidePanels }, () => ({
          contextType: 'SIDE_PANEL',
        })),
      onConnect: {
        addListener: (listener: (port: PortStub) => void) =>
          connectListeners.add(listener),
        removeListener: (listener: (port: PortStub) => void) =>
          connectListeners.delete(listener),
      },
      sendMessage: async (message: unknown) => {
        if (!isSidePanelPopupRequest(message)) return undefined
        stub.requests.push(message)

        if (panel === 'absent') {
          throw new Error('Receiving end does not exist.')
        }
        if (panel === 'ignore') return undefined
        if (panel === 'claim') {
          if (isPortLate) {
            setTimeout(() => connect(message.portName), 0)
          } else {
            connect(message.portName)
          }
        }

        return true
      },
    },
  })

  return stub
}

const input = { windowId: 7, url: 'chrome-extension://id/popup.html?callId=1' }

describe('openInSidePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('asks the side panels to show the request for the dApp window', async () => {
    const stub = stubChrome()

    await openInSidePanel(input)

    expect(stub.requests).toEqual([
      expect.objectContaining({ windowId: 7, url: input.url }),
    ])
  })

  it('tells the claiming panel to show the request', async () => {
    const stub = stubChrome()

    const surface = await openInSidePanel(input)

    expect(surface).toBeDefined()
    expect(stub.ports[0].sent).toEqual(['show'])
    expect(stub.connectListenerCount()).toBe(0)
  })

  it('takes a port that arrives after the claim answer', async () => {
    const stub = stubChrome({ isPortLate: true })

    const surface = await openInSidePanel(input)

    expect(surface).toBeDefined()
    expect(stub.ports[0].sent).toEqual(['show'])
  })

  it('leaves the request to a popup when no side panel is open', async () => {
    const stub = stubChrome({ openSidePanels: 0 })

    await expect(openInSidePanel(input)).resolves.toBeUndefined()
    expect(stub.requests).toEqual([])
  })

  it('leaves the request to a popup when the browser has no side panel API', async () => {
    const stub = stubChrome({ hasSidePanelApi: false })

    await expect(openInSidePanel(input)).resolves.toBeUndefined()
    expect(stub.requests).toEqual([])
  })

  it('leaves the request to a popup when no panel claims it', async () => {
    const stub = stubChrome({ panel: 'ignore' })

    await expect(openInSidePanel(input)).resolves.toBeUndefined()
    expect(stub.connectListenerCount()).toBe(0)
  })

  it('leaves the request to a popup when no extension page is listening', async () => {
    stubChrome({ panel: 'absent' })

    await expect(openInSidePanel(input)).resolves.toBeUndefined()
  })

  it('gives up on a claim whose port never arrives', async () => {
    vi.useFakeTimers()
    const stub = stubChrome({ panel: 'claimWithoutPort' })

    const surface = openInSidePanel(input)
    await vi.runAllTimersAsync()

    await expect(surface).resolves.toBeUndefined()
    expect(stub.connectListenerCount()).toBe(0)
  })

  it('aborts the request when the side panel goes away', async () => {
    const stub = stubChrome()

    const surface = await openInSidePanel(input)
    stub.ports[0].disconnectFromPanel()

    expect(surface?.abortSignal.aborted).toBe(true)
  })

  it('closes the request in the panel and drops the port', async () => {
    const stub = stubChrome()

    const surface = await openInSidePanel(input)
    surface?.close()

    expect(stub.ports[0].sent).toEqual(['show', 'close'])
    expect(stub.ports[0].isDisconnected).toBe(true)
    expect(surface?.abortSignal.aborted).toBe(false)
  })

  it('lets go of an answered request without closing it', async () => {
    const stub = stubChrome()

    const surface = await openInSidePanel(input)
    surface?.release()

    expect(stub.ports[0].sent).toEqual(['show'])
    expect(stub.ports[0].isDisconnected).toBe(true)
  })
})
