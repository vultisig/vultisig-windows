import { createMessenger } from './createMessenger'
import { detectScriptType } from './detectScriptType'
import { tabMessenger } from './tab'
import { windowMessenger } from './window'

const messenger = tabMessenger.available ? tabMessenger : windowMessenger

export const bridgeMessenger = createMessenger({
  available: messenger.available,
  name: 'bridgeMessenger',
  async send(topic, payload, { id } = {}) {
    return messenger.send(topic, payload, { id })
  },
  reply(topic, callback) {
    return messenger.reply(topic, callback)
  },
})

export function setupBridgeMessengerRelay() {
  if (detectScriptType() !== 'contentScript') {
    throw new Error(
      '`setupBridgeMessengerRelay` is only supported in Content Scripts.'
    )
  }
  windowMessenger.reply<unknown, unknown>(
    '*',
    async (payload, { topic, id }) => {
      if (!topic) return

      const topic_ = topic.replace('> ', '')
      const response = await tabMessenger.send<unknown, unknown>(
        topic_,
        payload,
        { id }
      )
      return response
    }
  )

  tabMessenger.reply<unknown, unknown>('*', async (payload, { topic, id }) => {
    if (!topic) return

    const topic_: string = topic.replace('> ', '')
    const response = await windowMessenger.send<unknown, unknown>(
      topic_,
      payload,
      { id }
    )
    return response
  })
}
