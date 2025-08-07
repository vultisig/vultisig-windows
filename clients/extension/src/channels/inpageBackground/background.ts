import { InpageBackgroundChannelContext } from './context'
import {
  getInpageBackgroundMessageSourceId,
  isInpageBackgroundChannelMessage,
} from './core'

type HandlerInput = {
  context: InpageBackgroundChannelContext
  message: unknown
  reply: (response: unknown) => void
}

type Handler = (input: HandlerInput) => Promise<unknown>

type Input = {
  getHandler: (message: unknown) => Handler
}

export const runInpageBackgroundChannelBackgroundAgent = ({
  getHandler,
}: Input) => {
  chrome.runtime.onMessage.addListener((request, { origin }, sendResponse) => {
    if (!origin) return

    if (!isInpageBackgroundChannelMessage(request, 'inpage')) {
      return
    }

    const { id, message } = request

    const handler = getHandler(message)

    handler({
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
