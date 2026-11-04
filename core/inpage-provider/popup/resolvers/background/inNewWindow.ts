import { attempt } from '@vultisig/lib-utils/attempt'

import { PopupOptions } from '../../resolver'
import { openInSidePanel } from './inSidePanel'
import { trackPendingRequest } from './pendingRequestsBadge'
import { PopupSurface } from './popupSurface'

type ExecuteInput = Pick<PopupSurface, 'abortSignal' | 'close'>

type Input<T> = PopupOptions & {
  url: string
  windowId?: number
  execute: (input: ExecuteInput) => Promise<T>
}

const windowWidth = 480
const windowHeight = 600

const getPopupPosition = async (): Promise<
  { left: number; top: number } | undefined
> => {
  const result = await attempt(() =>
    chrome.windows.getLastFocused({ windowTypes: ['normal'] })
  )
  if ('error' in result) return undefined

  const { state, left, top, width, height } = result.data

  // A minimized window reports off-screen coordinates, which would put the
  // popup where nobody can see it.
  if (state === 'minimized') return undefined

  if (
    left === undefined ||
    top === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return undefined
  }

  // Anchoring inside the browser window keeps the popup on the display the
  // user is looking at, including displays that start at a negative offset. A
  // browser window too small to hold the popup gets no anchor at all, so the
  // browser is free to place it somewhere it fits.
  if (width < windowWidth || height < windowHeight) return undefined

  return { left: left + width - windowWidth, top }
}

const openPopupWindow = async (url: string): Promise<PopupSurface> => {
  const position = await getPopupPosition()
  const newWindow = await new Promise<chrome.windows.Window | undefined>(
    resolve =>
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
  const windowId = newWindow?.id
  if (!windowId) {
    throw new Error('Failed to create new window')
  }

  // Firefox ignores left/top on create; apply via update
  const shouldReposition =
    position !== undefined &&
    newWindow.state !== 'fullscreen' &&
    (newWindow.left !== position.left || newWindow.top !== position.top)

  // `drawAttention` is the fallback for platforms that refuse to raise a
  // window on behalf of a background page: it flashes the taskbar entry or
  // bounces the dock icon instead.
  await attempt(() =>
    chrome.windows.update(windowId, {
      focused: true,
      drawAttention: true,
      ...(shouldReposition ? position : {}),
    })
  )

  const controller = new AbortController()
  const handleRemoved = (removedId: number) => {
    if (removedId === windowId) {
      chrome.windows.onRemoved.removeListener(handleRemoved)
      controller.abort()
    }
  }
  chrome.windows.onRemoved.addListener(handleRemoved)

  const release = () => chrome.windows.onRemoved.removeListener(handleRemoved)

  return {
    abortSignal: controller.signal,
    close: () => {
      release()
      chrome.windows.remove(windowId)
    },
    release,
  }
}

let popupQueue: Promise<unknown> = Promise.resolve()

/**
 * Shows a dApp request and resolves once the user has answered it. A side
 * panel open in the dApp's browser window (`windowId`) takes the request;
 * otherwise it opens in a popup window of its own. Requests are served one at
 * a time; every one of them badges the toolbar icon for as long as it waits,
 * since the operating system is free to ignore the raise-to-front and leave
 * the window behind the browser.
 */
export const inNewWindow = async <T>({
  url,
  windowId,
  execute,
}: Input<T>): Promise<T> => {
  const retirePendingRequest = trackPendingRequest()

  const run = async (): Promise<T> => {
    const sidePanel =
      windowId === undefined
        ? undefined
        : await openInSidePanel({ windowId, url })
    const { abortSignal, close, release } =
      sidePanel ?? (await openPopupWindow(url))

    try {
      return await execute({ abortSignal, close })
    } finally {
      release()
    }
  }

  const next = popupQueue.then(run, run).finally(retirePendingRequest)
  popupQueue = next.catch(() => {})
  return next
}
