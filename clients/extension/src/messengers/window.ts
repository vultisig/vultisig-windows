import {
  CallbackFunction,
  createMessenger,
  SendMessage,
} from './createMessenger'
import { isValidReply } from './isValidReply'
import { isValidSend } from './isValidSend'

export const windowMessenger = createMessenger({
  available: typeof window !== 'undefined',
  name: 'windowMessenger',
  async send(topic, payload, { id } = {}) {
    window.postMessage({ topic: `> ${topic}`, payload, id }, '*')

    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        if (!isValidReply({ id, message: event.data, topic })) return
        if (event.source != window) return

        window.removeEventListener('message', listener)

        const { response, error } = event.data.payload
        if (error) reject(new Error(error.message))
        resolve(response)
      }
      window.addEventListener('message', listener)
    })
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>
  ) {
    const listener = async (event: MessageEvent<SendMessage<TPayload>>) => {
      if (!isValidSend({ message: event.data, topic })) return

      const sender = event.source
      if (sender != window) return

      let error
      let response
      try {
        response = await callback(event.data.payload, {
          topic: event.data.topic,
          sender: event.source as any,
          id: event.data.id,
        })
      } catch (error_) {
        error = error_
      }

      const repliedTopic = event.data.topic.replace(/>/g, '<')
      window.postMessage({
        topic: repliedTopic,
        payload: { error, response },
        id: event.data.id,
      })
    }
    window.addEventListener('message', listener, false)
    return () => window.removeEventListener('message', listener)
  },
})
