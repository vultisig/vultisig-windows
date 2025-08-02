import { attempt } from '@lib/utils/attempt'

import { getDappHostname } from '../../../utils/connectedApps'
import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import { BackgroundApiRequest, isBackgroundApiMessage } from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener(
    async (request: unknown, { origin }, sendResponse) => {
      if (!origin) return

      if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(request, 'inpage'))
        return

      const { method, input } = request

      const handler = backgroundApi[method as BackgroundApiMethodName]
      if (!handler) return

      const dappHostname = getDappHostname(origin)

      attempt(
        attempt(
          handler({
            input,
            context: {
              dappHostname,
            },
          })
        )
      ).then(sendResponse)

      return true
    }
  )
}
