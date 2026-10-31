import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockOpenInSidePanel = vi.hoisted(() => vi.fn())

vi.mock('./inSidePanel', () => ({
  openInSidePanel: (...args: unknown[]) => mockOpenInSidePanel(...args),
}))

import { inNewWindow } from './inNewWindow'

type WindowFixture = Pick<
  chrome.windows.Window,
  'id' | 'left' | 'top' | 'width' | 'height' | 'state'
>

type ChromeStub = {
  lastFocused: WindowFixture
  created: chrome.windows.CreateData[]
  updates: Array<{ windowId: number; info: chrome.windows.UpdateInfo }>
  badgeTexts: string[]
}

const stubChrome = (lastFocused: WindowFixture = {}): ChromeStub => {
  const stub: ChromeStub = {
    lastFocused: {
      id: 1,
      left: 100,
      top: 50,
      width: 1200,
      height: 800,
      state: 'normal',
      ...lastFocused,
    },
    created: [],
    updates: [],
    badgeTexts: [],
  }

  // These handlers mirror the Chrome API signatures they stand in for, so they
  // keep Chrome's positional arguments rather than a single input object.
  vi.stubGlobal('chrome', {
    action: {
      setBadgeText: ({ text }: { text: string }) => {
        stub.badgeTexts.push(text)
        return Promise.resolve()
      },
      setBadgeBackgroundColor: () => Promise.resolve(),
      setBadgeTextColor: () => Promise.resolve(),
    },
    windows: {
      getLastFocused: () => Promise.resolve(stub.lastFocused),
      create: (
        data: chrome.windows.CreateData,
        callback: (window: WindowFixture) => void
      ) => {
        stub.created.push(data)
        callback({
          ...stub.lastFocused,
          id: 99,
          state: 'normal',
          left: data.left ?? 0,
          top: data.top ?? 0,
        })
      },
      update: (windowId: number, info: chrome.windows.UpdateInfo) => {
        stub.updates.push({ windowId, info })
        return Promise.resolve(stub.lastFocused)
      },
      remove: () => Promise.resolve(),
      onRemoved: {
        addListener: () => undefined,
        removeListener: () => undefined,
      },
    },
  })

  return stub
}

describe('inNewWindow', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockOpenInSidePanel.mockResolvedValue(undefined)
    // Badge renders are queued, so let the previous test's renders land on the
    // stub they were scheduled against instead of the next one.
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('raises the popup after creating it', async () => {
    const stub = stubChrome()

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(stub.created[0].focused).toBe(true)
    expect(stub.updates[0].windowId).toBe(99)
    expect(stub.updates[0].info).toMatchObject({
      focused: true,
      drawAttention: true,
    })
  })

  it('shows the request in the side panel of the dApp window instead of a popup', async () => {
    const stub = stubChrome()
    const abortSignal = new AbortController().signal
    const release = vi.fn()
    mockOpenInSidePanel.mockResolvedValue({
      abortSignal,
      close: () => undefined,
      release,
    })
    const execute = vi.fn(async () => 'done')

    await expect(
      inNewWindow({ url: 'popup.html', windowId: 1, execute })
    ).resolves.toBe('done')

    expect(mockOpenInSidePanel).toHaveBeenCalledWith({
      windowId: 1,
      url: 'popup.html',
    })
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ abortSignal })
    )
    expect(stub.created).toEqual([])
    expect(release).toHaveBeenCalled()
  })

  it('opens a popup when no side panel takes the request', async () => {
    const stub = stubChrome()

    await inNewWindow({
      url: 'popup.html',
      windowId: 1,
      execute: async () => 'done',
    })

    expect(stub.created).toHaveLength(1)
  })

  it('opens a popup without asking the side panel for a request from outside a tab', async () => {
    const stub = stubChrome()

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(mockOpenInSidePanel).not.toHaveBeenCalled()
    expect(stub.created).toHaveLength(1)
  })

  it('anchors the popup to the top right of the browser window', async () => {
    const stub = stubChrome({ left: -1920, top: 0, width: 1000 })

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(stub.created[0]).toMatchObject({ left: -1920 + 1000 - 480, top: 0 })
  })

  it('leaves placement to the browser when the popup would not fit inside it', async () => {
    const stub = stubChrome({ width: 400, height: 300 })

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(stub.created[0].left).toBeUndefined()
    expect(stub.created[0].top).toBeUndefined()
  })

  it('leaves placement to the browser when the last focused window is minimized', async () => {
    const stub = stubChrome({ state: 'minimized', left: -32000, top: -32000 })

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(stub.created[0].left).toBeUndefined()
    expect(stub.created[0].top).toBeUndefined()
  })

  it('badges the toolbar icon while a request is pending and clears it after', async () => {
    const stub = stubChrome()

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })
    await vi.waitFor(() => expect(stub.badgeTexts).toEqual(['1', '']))
  })

  it('keeps the badge up while a queued request waits its turn', async () => {
    const stub = stubChrome()
    let releaseFirst: () => void = () => undefined
    const first = inNewWindow({
      url: 'popup.html',
      execute: () =>
        new Promise<string>(resolve => {
          releaseFirst = () => resolve('first')
        }),
    })
    const second = inNewWindow({
      url: 'popup.html',
      execute: async () => 'second',
    })

    await vi.waitFor(() =>
      expect(stub.badgeTexts[stub.badgeTexts.length - 1]).toBe('2')
    )

    releaseFirst()
    await expect(first).resolves.toBe('first')
    await expect(second).resolves.toBe('second')

    await vi.waitFor(() =>
      expect(stub.badgeTexts[stub.badgeTexts.length - 1]).toBe('')
    )
  })

  it('clears the badge when the request fails', async () => {
    const stub = stubChrome()

    await expect(
      inNewWindow({
        url: 'popup.html',
        execute: async () => {
          throw new Error('rejected')
        },
      })
    ).rejects.toThrow('rejected')

    await vi.waitFor(() =>
      expect(stub.badgeTexts[stub.badgeTexts.length - 1]).toBe('')
    )
  })
})
