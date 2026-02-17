import { attempt } from '@lib/utils/attempt'

import { PopupOptions } from '../../resolver'

type ExecuteInput = {
  abortSignal: AbortSignal
  close: () => void
}

type Input<T> = PopupOptions & {
  url: string
  execute: (input: ExecuteInput) => Promise<T>
}

const windowWidth = 480
const windowHeight = 600

const getPopupPosition = async (): Promise<
  { left: number; top: number } | undefined
> => {
  try {
    const lastFocused = await chrome.windows.getLastFocused()
    const l = lastFocused.left ?? 0
    const w = lastFocused.width ?? windowWidth
    const top = lastFocused.top ?? 0
    const left = Math.max(l + (w - windowWidth), 0)
    return { left, top }
  } catch {
    return undefined
  }
}

const findExistingPopupWindow = async (): Promise<number | null> => {
  const allWindows = await chrome.windows.getAll({ windowTypes: ['popup'] })
  const runtimeUrl = chrome.runtime.getURL('popup.html')

  for (const window of allWindows) {
    if (!window.id) continue

    const tabs = await chrome.tabs.query({ windowId: window.id })
    const matchingTab = tabs.find(tab => {
      const tabUrl = tab.url
      return tabUrl?.startsWith(runtimeUrl.split('?')[0])
    })

    if (matchingTab) {
      return window.id
    }
  }

  return null
}

export const inNewWindow = async <T>({
  url,
  execute,
}: Input<T>): Promise<T> => {
  // Check if there's an existing popup window we can reuse
  const existingWindowId = await findExistingPopupWindow()

  let windowId: number | undefined
  if (existingWindowId !== null) {
    // Reuse existing window by updating its tab URL and focusing it
    windowId = existingWindowId
    const tabs = await chrome.tabs.query({ windowId })

    if (tabs.length === 0) {
      windowId = undefined // Fall back to creating new window
    } else {
      const tabId = tabs[0].id
      if (!tabId) {
        windowId = undefined // Fall back to creating new window
      } else {
        const tabUpdateResult = await attempt(
          chrome.tabs.update(tabId, { url })
        )
        if ('error' in tabUpdateResult) {
          windowId = undefined // Fall back to creating new window
        }

        if (windowId !== undefined) {
          const focusResult = await attempt(
            chrome.windows.update(windowId, { focused: true })
          )
          if ('error' in focusResult) {
            // Best-effort fallback: try to create a new focused window
            const position = await getPopupPosition()
            const fallbackResult = await attempt(
              new Promise<chrome.windows.Window | undefined>(resolve =>
                chrome.windows.create(
                  {
                    url,
                    type: 'popup',
                    height: windowHeight,
                    width: windowWidth,
                    focused: true,
                    ...(position ?? {}),
                  },
                  resolve
                )
              )
            )
            const popupWindow = fallbackResult.data
            if (popupWindow?.id) {
              windowId = popupWindow.id
              if (
                position &&
                popupWindow.state !== 'fullscreen' &&
                (popupWindow.left !== position.left ||
                  popupWindow.top !== position.top)
              ) {
                await chrome.windows.update(windowId, {
                  left: position.left,
                  top: position.top,
                })
              }
            } else {
              throw new Error(
                `Failed to reuse or create popup window: ${focusResult.error instanceof Error ? focusResult.error.message : String(focusResult.error)}`
              )
            }
          }
        }
      }
    }
  }

  // Create a new window if we couldn't reuse an existing one
  if (existingWindowId === null || windowId === undefined) {
    const position = await getPopupPosition()
    const newWindow = await new Promise<chrome.windows.Window | undefined>(
      resolve =>
        chrome.windows.create(
          {
            url,
            type: 'popup',
            height: windowHeight,
            width: windowWidth,
            ...(position ?? {}),
          },
          resolve
        )
    )
    const id = newWindow?.id
    if (!id) {
      throw new Error('Failed to create new window')
    }
    windowId = id
    // Firefox ignores left/top on create; apply via update
    if (
      newWindow &&
      position &&
      newWindow.state !== 'fullscreen' &&
      (newWindow.left !== position.left || newWindow.top !== position.top)
    ) {
      await chrome.windows.update(windowId, {
        left: position.left,
        top: position.top,
      })
    }
  }

  const controller = new AbortController()
  const handleRemoved = (removedId: number) => {
    if (removedId === windowId) {
      chrome.windows.onRemoved.removeListener(handleRemoved)
      controller.abort()
    }
  }
  chrome.windows.onRemoved.addListener(handleRemoved)

  try {
    return await execute({
      abortSignal: controller.signal,
      close: () => {
        chrome.windows.onRemoved.removeListener(handleRemoved)
        chrome.windows.remove(windowId)
      },
    })
  } finally {
    chrome.windows.onRemoved.removeListener(handleRemoved)
  }
}
