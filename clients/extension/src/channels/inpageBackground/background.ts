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

type Input = {
  handleRequest: (input: BackgroundRequestHandler) => Promise<unknown>
}

export const runInpageBackgroundChannelBackgroundAgent = ({
  handleRequest,
}: Input) => {
  chrome.runtime.onMessage.addListener((request, { origin }, sendResponse) => {
    if (!origin) return

    if (!isInpageBackgroundChannelMessage(request, 'inpage')) {
      return
    }

    const { id, message } = request

    handleRequest({
      message,
      context: {
        requestOrigin: origin,
      },
      reply: message => {
        sendResponse({
          id,
          sourceId: getInpageBackgroundMessageSourceId('background'),
          message,
        })
      },
    })

    return true
  })
}
