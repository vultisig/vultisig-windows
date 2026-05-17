import { attempt } from '@vultisig/lib-utils/attempt'

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
  const result = await attempt(() => chrome.windows.getLastFocused())
  if ('error' in result) return undefined
  const lastFocused = result.data
  const l = lastFocused.left ?? 0
  const w = lastFocused.width ?? windowWidth
  const top = lastFocused.top ?? 0
  const left = Math.max(l + (w - windowWidth), 0)
  return { left, top }
}

let popupQueue: Promise<unknown> = Promise.resolve()

export const inNewWindow = async <T>({
  url,
  execute,
}: Input<T>): Promise<T> => {
  const run = async (): Promise<T> => {
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
    const windowId = newWindow?.id
    if (!windowId) {
      throw new Error('Failed to create new window')
    }
    // Firefox ignores left/top on create; apply via update
    if (
      position &&
      newWindow.state !== 'fullscreen' &&
      (newWindow.left !== position.left || newWindow.top !== position.top)
    ) {
      await chrome.windows.update(windowId, {
        left: position.left,
        top: position.top,
      })
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

  const next = popupQueue.then(run, run)
  popupQueue = next.catch(() => {})
  return next
}
