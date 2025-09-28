import { BridgeContext } from './context'
import { getBridgeMessageSourceId, isBridgeMessage } from './core'
import { KeepaliveMessage } from './keepalive'

type BackgroundRequestHandler<TMessage = unknown, TResponse = unknown> = {
  context: BridgeContext
  message: TMessage
  reply: (response: TResponse) => void
}

export const runBridgeBackgroundAgent = <
  TMessage = unknown,
  TResponse = unknown,
>({
  handleRequest,
}: {
  handleRequest: (input: BackgroundRequestHandler<TMessage, TResponse>) => void
}) => {
  chrome.runtime.onMessage.addListener(
    (request, { origin, tab }, sendResponse) => {
      if (!origin) return

      if (!isBridgeMessage(request, 'inpage')) {
        return
      }

      const { id, message } = request

      // Handle keepalive ping/pong messages
      if (isKeepaliveMessage(message)) {
        console.log('[Background] Received keepalive ping')
        sendResponse({
          id,
          sourceId: getBridgeMessageSourceId('background'),
          message: {
            type: 'pong',
            timestamp: Date.now(),
          } as KeepaliveMessage,
        })
        return true
      }

      handleRequest({
        message: message as TMessage,
        context: {
          requestFavicon: tab?.favIconUrl,
          requestOrigin: origin,
        },
        reply: (response: TResponse) => {
          sendResponse({
            id,
            sourceId: getBridgeMessageSourceId('background'),
            message: response,
          })
        },
      })

      return true
    }
  )
}

/**
 * Check if a message is a keepalive ping
 */
const isKeepaliveMessage = (message: unknown): message is KeepaliveMessage => {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    (message.type === 'ping' || message.type === 'pong')
  )
}
