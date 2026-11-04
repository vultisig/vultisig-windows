import { BridgeContext } from './context'
import { getBridgeMessageSourceId, isBridgeMessage } from './core'

type BackgroundRequestHandler<TMessage = unknown, TResponse = unknown> = {
  context: BridgeContext
  message: TMessage
  reply: (response: TResponse) => void
}

/**
 * Listens in the background for bridge requests from inpage scripts and hands
 * each one to `handleRequest` together with the sender's context.
 */
export const runBridgeBackgroundAgent = <
  TMessage = unknown,
  TResponse = unknown,
>({
  handleRequest,
}: {
  handleRequest: (input: BackgroundRequestHandler<TMessage, TResponse>) => void
}) => {
  chrome.runtime.onMessage.addListener(
    (request, { frameId, origin, tab }, sendResponse) => {
      if (!origin) return

      if (!isBridgeMessage(request, 'inpage')) {
        return
      }

      const { id, message } = request

      const isTopFrame = frameId === 0
      handleRequest({
        message: message as TMessage,
        context: {
          requestFavicon: isTopFrame ? tab?.favIconUrl : undefined,
          requestName: isTopFrame ? tab?.title : undefined,
          requestOrigin: origin,
          requestWindowId: tab?.windowId,
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
