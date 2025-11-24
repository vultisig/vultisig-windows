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

export const inNewWindow = async <T>({
  url,
  execute,
}: Input<T>): Promise<T> => {
  const currentWindow = await chrome.windows.getCurrent()
  const position = calculateTopRightPosition(currentWindow)

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
