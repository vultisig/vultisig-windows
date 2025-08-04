import { pick } from '@lib/utils/record/pick'

import { setInitialView } from '../../../storage/initialView'
import { PopupApiInterface, PopupApiMethodName } from '../interface'
import { isPopupApiMessage, PopupApiCall, PopupApiResponse } from './core'

const inWindow = async <T>(
  fn: (window: chrome.windows.Window) => Promise<T>
) => {
  const currentWindow = await chrome.windows.getCurrent()

  const newWindow = await new Promise<chrome.windows.Window | undefined>(
    resolve => {
      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`index.html`),
          type: 'panel',
          ...pick(currentWindow, ['height', 'left', 'top', 'width']),
        },
        resolve
      )
    }
  )

  if (!newWindow) {
    throw new Error('Failed to create new window')
  }

  const handleWindowRemoved = (removedWindowId: number) => {
    if (removedWindowId === newWindow.id) {
      chrome.windows.onRemoved.removeListener(handleWindowRemoved)
      throw new Error('Popup window was closed')
    }
  }

  if (newWindow.id) {
    chrome.windows.onRemoved.addListener(handleWindowRemoved)
  }

  try {
    return await fn(newWindow)
  } finally {
    if (newWindow.id) {
      chrome.windows.onRemoved.removeListener(handleWindowRemoved)
      await chrome.windows.remove(newWindow.id)
    }
  }
}

export const callPopupApi = async <M extends PopupApiMethodName>(
  call: PopupApiCall<M>
): Promise<PopupApiInterface[M]['output']> => {
  await setInitialView({ id: 'popupApi', state: { call } })

  return inWindow(
    () =>
      new Promise((resolve, reject) => {
        const listener = (response: any) => {
          if (!isPopupApiMessage<PopupApiResponse<any>>(response, 'popup'))
            return

          chrome.runtime.onMessage.removeListener(listener)

          const { error, data } = response.result
          if (error) {
            reject(error)
          } else {
            resolve(data as PopupApiInterface[M]['output'])
          }

          return true
        }

        chrome.runtime.onMessage.addListener(listener)
      })
  )
}
