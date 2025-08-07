import { InpageBackgroundChannelContext } from './context'
import {
  getInpageBackgroundMessageSourceId,
  isInpageBackgroundChannelMessage,
} from './core'

export type BackgroundRequestHandler<
  TMessage = unknown,
  TResponse = unknown,
> = {
  context: InpageBackgroundChannelContext
  message: TMessage
  reply: (response: TResponse) => void
}

export const runInpageBackgroundChannelBackgroundAgent = <
  TMessage = unknown,
  TResponse = unknown,
>({
  handleRequest,
}: {
  handleRequest: (
    input: BackgroundRequestHandler<TMessage, TResponse>
  ) => Promise<unknown>
}) => {
  chrome.runtime.onMessage.addListener((request, { origin }, sendResponse) => {
    if (!origin) return

    if (!isInpageBackgroundChannelMessage(request, 'inpage')) {
      return
    }

    const { id, message } = request

    handleRequest({
      message: message as TMessage,
      context: {
        requestOrigin: origin,
      },
      reply: (response: TResponse) => {
        sendResponse({
          id,
          sourceId: getInpageBackgroundMessageSourceId('background'),
          message: response,
        })
      },
    })

    return true
  })
}
