import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import { match } from '@lib/utils/match'

import { ExtensionApi, ExtensionApiMessage } from '../api'
import { runInpageBackgroundChannelBackgroundAgent } from '../channels/inpageBackground/background'
import { callPopupApiFromInpage } from '../popup/api/call/resolvers/inpage'
import { MessageKey } from '../utils/constants'
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

const handlers: Record<ExtensionApi> = {}

runInpageBackgroundChannelBackgroundAgent({
  getHandler: ({ context, message, reply }) => {
    const { api, ...rest } = message as ExtensionApiMessage

    const handler = match(api, {
      popup: () => callPopupApiFromInpage(rest),
    })
  },
})
