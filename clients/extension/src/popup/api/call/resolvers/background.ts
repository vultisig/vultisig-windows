import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { ignorePromiseOutcome } from '@lib/utils/promise/ignorePromiseOutcome'
import { pick } from '@lib/utils/record/pick'

import { setInitialView } from '../../../../storage/initialView'
import { isPopupApiMessage, PopupApiResponse } from '../../communication/core'
import {
  CallPopupApiOptions,
  CallPopupResolver,
  CallPopupResolverInput,
} from '../resolver'

const inNewWindow = async <T>(
  fn: (signal: AbortSignal) => Promise<T>,
  { closeOnFinish }: CallPopupApiOptions
): Promise<T> => {
  const currentWindow = await chrome.windows.getCurrent()
  const newWindow = await new Promise<chrome.windows.Window | undefined>(
    resolve =>
      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`index.html`),
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
    return await fn(controller.signal)
  } finally {
    chrome.windows.onRemoved.removeListener(handleRemoved)
    if (closeOnFinish) {
      await ignorePromiseOutcome(chrome.windows.remove(newWindow.id))
    }
  }
}

export const callPopupApiFromBackground: CallPopupResolver = async <
  M extends PopupMethod,
>({
  call,
  options,
}: CallPopupResolverInput<M>) => {
  await setInitialView({ id: 'popupApi', state: { call } })

  return inNewWindow(
    abortSignal =>
      new Promise<PopupInterface[M]['output']>((resolve, reject) => {
        const handleMessage = (response: any) => {
          if (!isPopupApiMessage<PopupApiResponse<any>>(response, 'popup'))
            return

          chrome.runtime.onMessage.removeListener(handleMessage)
          abortSignal.removeEventListener('abort', handleAbort)

          const { error, data } = response.result
          if (error) {
            reject(error)
          } else {
            resolve(data as PopupInterface[M]['output'])
          }
        }

        const handleAbort = () => {
          chrome.runtime.onMessage.removeListener(handleMessage)
          reject(new Error('Popup window was closed'))
        }

        chrome.runtime.onMessage.addListener(handleMessage)
        abortSignal.addEventListener('abort', handleAbort, { once: true })
      }),
    options
  )
}
