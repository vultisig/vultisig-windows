import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import { runBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../api'
import { callPopupApiFromBackground } from '../popup/api/call/resolvers/background'
import { MessageKey } from '../utils/constants'
import { backgroundApi } from './api'
import { BackgroundApiMethodName } from './api/interface'
import { dispatchMessage } from './dispatcher/messageDispatcher'
import { keepAliveHandler } from './handlers/keepAliveHandler'
if (!navigator.userAgent.toLowerCase().includes('firefox')) {
  ;[
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)
}

const inpageMessenger = initializeMessenger({ connect: 'inpage' })

inpageMessenger.reply<{ type: MessageKey; message: any }, unknown>(
  'providerRequest',
  async ({ type, message }, { sender }) => {
    try {
      const response = await dispatchMessage(type, message, sender)

      return response
    } catch (err) {
      console.error('[background] unhandled providerRequest error', err)
      throw err
    }
  }
)
keepAliveHandler()

runBridgeBackgroundAgent<ExtensionApiMessage, Result>({
  handleRequest: ({ message, context, reply }) => {
    attempt(
      matchRecordUnion<ExtensionApiMessage, Promise<unknown>>(message, {
        background: backgroundMessage => {
          const methodName = getRecordUnionKey(backgroundMessage.call)
          const input = getRecordUnionValue(backgroundMessage.call)

          const resolver = backgroundApi[methodName as BackgroundApiMethodName]

          return resolver({ input, context })
        },
        popup: popupMessage => {
          return callPopupApiFromBackground({
            call: popupMessage.call,
            options: popupMessage.options,
          })
        },
      })
    ).then(reply)
  },
})
