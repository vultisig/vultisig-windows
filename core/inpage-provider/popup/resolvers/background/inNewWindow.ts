import { ignorePromiseOutcome } from '@lib/utils/promise/ignorePromiseOutcome'
import { pick } from '@lib/utils/record/pick'

import { PopupOptions } from '../../resolver'

type Input<T> = PopupOptions & {
  url: string
  execute: (signal: AbortSignal) => Promise<T>
}

export const inNewWindow = async <T>({
  closeOnFinish,
  url,
  execute,
}: Input<T>): Promise<T> => {
  const currentWindow = await chrome.windows.getCurrent()
  const newWindow = await new Promise<chrome.windows.Window | undefined>(
    resolve =>
      chrome.windows.create(
        {
          url,
          type: 'panel',
          ...pick(currentWindow, ['height', 'left', 'top', 'width']),
        },
        resolve
      )
  )
  if (!newWindow?.id) {
    throw new Error('Failed to create new window')
  }

  const controller = new AbortController()
  const handleRemoved = (removedId: number) => {
    if (removedId === newWindow.id) {
      chrome.windows.onRemoved.removeListener(handleRemoved)
      controller.abort()
    }
  }
  chrome.windows.onRemoved.addListener(handleRemoved)

  try {
    return await execute(controller.signal)
  } finally {
    chrome.windows.onRemoved.removeListener(handleRemoved)
    if (closeOnFinish) {
      await ignorePromiseOutcome(chrome.windows.remove(newWindow.id))
    }
  }
}
