import {
  CallbackFunction,
  createMessenger,
  ReplyMessage,
  SendMessage,
} from './createMessenger'
import { isValidReply } from './isValidReply'
import { isValidSend } from './isValidSend'

export const extensionMessenger = createMessenger({
  available: Boolean(typeof chrome !== 'undefined' && chrome.runtime?.id),
  name: 'extensionMessenger',
  async send<TPayload, TResponse>(
    topic: string,
    payload: TPayload,
    { id }: { id?: number | string } = {}
  ) {
    return new Promise<TResponse>((resolve, reject) => {
      const listener = (
        message: ReplyMessage<TResponse>,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
      ) => {
        if (!isValidReply<TResponse>({ id, message, topic })) return

        chrome.runtime.onMessage.removeListener(listener)

        const { response: response_, error } = message.payload
        if (error) reject(new Error(error.message))
        resolve({ ...response_, sender })
        sendResponse({})
        return true
      }

      chrome.runtime.onMessage.addListener(listener)

      chrome.runtime.sendMessage({
        topic: `> ${topic}`,
        payload,
        id,
      })
    })
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>
  ) {
    const listener = async (
      message: SendMessage<TPayload>,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ) => {
      if (!isValidSend({ message, topic })) return

      const repliedTopic = message.topic.replace(/>/g, '<')

      try {
        const response = await callback(message.payload, {
          id: message.id,
          sender,
          topic: message.topic,
        })

        chrome.runtime.sendMessage({
          topic: repliedTopic,
          payload: { response, sender },
          id: message.id,
        })
      } catch (error_) {
        // Errors do not serialize properly over `chrome.runtime.sendMessage`, so
        // we are manually serializing it to an object.
        const error: Record<string, unknown> = {}
        for (const key of Object.getOwnPropertyNames(error_)) {
          error[key] = (<Error>error_)[<keyof Error>key]
        }
        chrome.runtime.sendMessage({
          topic: repliedTopic,
          payload: { error },
          id: message.id,
        })
      }
      sendResponse({})
      return true
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  },
})
