import { pick } from '@lib/utils/record/pick'

import { PopupOptions } from '../../resolver'

type ExecuteInput = {
  abortSignal: AbortSignal
  close: () => void
}

type Input<T> = PopupOptions & {
  url: string
  execute: (input: ExecuteInput) => Promise<T>
}

export const inNewWindow = async <T>({
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
  const windowId = newWindow?.id
  if (!windowId) {
    throw new Error('Failed to create new window')
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
