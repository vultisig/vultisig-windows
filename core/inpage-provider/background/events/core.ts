export const backgroundEventMsgType = 'backgroundEvent'

export type BackgroundEventMessage = {
  type: typeof backgroundEventMsgType
  subscriptionId: string
  value?: unknown
}

export const isBackgroundEventMessage = (
  message: unknown
): message is BackgroundEventMessage =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === backgroundEventMsgType
