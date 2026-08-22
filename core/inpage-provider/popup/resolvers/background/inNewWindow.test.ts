import { beforeEach, describe, expect, it, vi } from 'vitest'

import { inNewWindow } from './inNewWindow'

type ChromeStub = {
  lastFocused: chrome.windows.Window
  created: chrome.windows.CreateData[]
  updates: Array<[number, chrome.windows.UpdateInfo]>
  badgeTexts: string[]
}

const stubChrome = (
  lastFocused: Partial<chrome.windows.Window> = {}
): ChromeStub => {
  const stub: ChromeStub = {
    lastFocused: {
      id: 1,
      left: 100,
      top: 50,
      width: 1200,
      height: 800,
      state: 'normal',
      focused: true,
      incognito: false,
      alwaysOnTop: false,
      type: 'normal',
      ...lastFocused,
    } as chrome.windows.Window,
    created: [],
    updates: [],
    badgeTexts: [],
  }

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
        callback: (window: chrome.windows.Window) => void
      ) => {
        stub.created.push(data)
        callback({
          ...stub.lastFocused,
          id: 99,
          type: 'popup',
          left: data.left ?? 0,
          top: data.top ?? 0,
        } as chrome.windows.Window)
      },
      update: (windowId: number, info: chrome.windows.UpdateInfo) => {
        stub.updates.push([windowId, info])
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
    // Badge renders are queued, so let the previous test's renders land on the
    // stub they were scheduled against instead of the next one.
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('raises the popup after creating it', async () => {
    const stub = stubChrome()

    await inNewWindow({ url: 'popup.html', execute: async () => 'done' })

    expect(stub.created[0].focused).toBe(true)
    expect(stub.updates[0][0]).toBe(99)
    expect(stub.updates[0][1]).toMatchObject({
      focused: true,
      drawAttention: true,
    })
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
