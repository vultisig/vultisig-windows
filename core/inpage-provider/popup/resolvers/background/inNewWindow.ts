import { pick } from '@lib/utils/record/pick'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { PopupOptions } from '../../resolver'
import { UAParser } from 'ua-parser-js'

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

  const platform =
    'userAgentData' in navigator
      ? (navigator.userAgentData as any).platform
      : navigator.platform

  const isMacOs = platform.toLowerCase().includes('mac')

  const newWindow = await new Promise<chrome.windows.Window | undefined>(
    resolve =>
      chrome.windows.create(
        {
          url,
          type: 'panel',
          top: currentWindow.top,
          height: isMacOs ? currentWindow.height : 600,
          width: isMacOs ? currentWindow.width : 480,
          left: isMacOs
            ? currentWindow.left
            : shouldBePresent(currentWindow.width) - 500,
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
