import { attempt } from '@lib/utils/attempt'

import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import { Request } from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener(
    async (message: Request, sender, sendResponse) => {
      const handler = backgroundApi[message.method as BackgroundApiMethodName]
      if (!handler) return

      attempt(attempt(handler(message.input))).then(sendResponse)

      return true
    }
  )
}
