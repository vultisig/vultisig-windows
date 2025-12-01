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
const windowOffset = 20

const calculateTopRightPosition = (
  currentWindow: chrome.windows.Window
): { left?: number; top: number } => {
  const currentLeft = currentWindow.left
  const currentTop = currentWindow.top
  const currentWidth = currentWindow.width

  if (
    currentLeft !== undefined &&
    currentTop !== undefined &&
    currentWidth !== undefined &&
    currentWidth >= windowWidth
  ) {
    const left = currentLeft + currentWidth - windowWidth

    return {
      left: Math.max(currentLeft, left),
      top: Math.max(0, currentTop + windowOffset),
    }
  }

  return {
    top: windowOffset,
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
  const currentWindow = await chrome.windows.getCurrent()
  const position = calculateTopRightPosition(currentWindow)

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
      const tabId = tabs[0]?.id
      if (!tabId) {
        windowId = undefined // Fall back to creating new window
      } else {
        try {
          await chrome.tabs.update(tabId, { url })
        } catch (error) {
          windowId = undefined // Fall back to creating new window
        }

        if (windowId !== undefined) {
          try {
            await chrome.windows.update(windowId, { focused: true })
          } catch (error) {
            // Best-effort fallback: try to create a new focused window
            try {
              const fallbackWindow = await new Promise<
                chrome.windows.Window | undefined
              >(resolve =>
                chrome.windows.create(
                  {
                    url,
                    type: 'popup',
                    height: windowHeight,
                    width: windowWidth,
                    focused: true,
                    ...position,
                  },
                  resolve
                )
              )
              const fallbackId = fallbackWindow?.id
              if (fallbackId) {
                windowId = fallbackId
              } else {
                throw new Error('Failed to create fallback window')
              }
            } catch (fallbackError) {
              throw new Error(
                `Failed to reuse or create popup window: ${error instanceof Error ? error.message : String(error)}`
              )
            }
          }
        }
      }
    }
  }

  // Create a new window if we couldn't reuse an existing one
  if (existingWindowId === null || windowId === undefined) {
    const newWindow = await new Promise<chrome.windows.Window | undefined>(
      resolve =>
        chrome.windows.create(
          {
            url,
            type: 'popup',
            height: windowHeight,
            width: windowWidth,
            ...position,
          },
          resolve
        )
    )
    const id = newWindow?.id
    if (!id) {
      throw new Error('Failed to create new window')
    }
    windowId = id
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
