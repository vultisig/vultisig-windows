import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'

import { MessageKey } from '../utils/constants'
import { dispatchMessage } from './dispatcher/messageDispatcher'
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

const popupMessenger = initializeMessenger({ connect: 'popup' })
const inpageMessenger = initializeMessenger({ connect: 'inpage' })

inpageMessenger.reply<{ type: MessageKey; message: any }, unknown>(
  'providerRequest',
  async ({ type, message }, { sender }) => {
    try {
      const response = await dispatchMessage(
        type,
        message,
        sender,
        popupMessenger
      )

      return response
    } catch (err) {
      console.error('[background] unhandled providerRequest error', err)
      throw err
    }
  }
)
