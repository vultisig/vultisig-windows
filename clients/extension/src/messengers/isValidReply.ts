import { ReplyMessage } from './createMessenger'

export function isValidReply<TResponse>({
  id,
  topic,
  message,
}: {
  id?: number | string
  topic: string
  message: ReplyMessage<TResponse>
}) {
  if (!message?.topic) return false
  if (message.topic !== `< ${topic}`) return false
  if (typeof id !== 'undefined' && message.id !== id) return false
  return true
}
