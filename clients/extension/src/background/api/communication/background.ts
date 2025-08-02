import { attempt } from '@lib/utils/attempt'

import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import { BackgroundApiRequest, isBackgroundApiMessage } from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener(
    async (request: unknown, _, sendResponse) => {
      if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(request, 'inpage'))
        return

      const { method, input } = request

      const handler = backgroundApi[method as BackgroundApiMethodName]
      if (!handler) return

      attempt(attempt(handler(input))).then(sendResponse)

      return true
    }
  )
}
