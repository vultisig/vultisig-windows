import { Result } from '@lib/utils/types/Result'

import {
  BridgeMessage,
  getBridgeMessageSourceId,
  isBridgeMessage,
} from './core'

const sendMaxAttempts = 3
const sendInitialDelay = 75

export const runBridgeContentAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBridgeMessage(data, 'inpage')) return

    const { id } = data

    const send = (attemptsLeft: number, delayMs: number) => {
      chrome.runtime.sendMessage(data, response => {
        const error = chrome.runtime.lastError?.message

        if (error) {
          if (attemptsLeft > 0 && /Receiving end does not exist/i.test(error)) {
            setTimeout(() => send(attemptsLeft - 1, delayMs * 2), delayMs)
            return
          }

          const message: BridgeMessage<Result> = {
            id,
            sourceId: getBridgeMessageSourceId('background'),
            message: {
              error: `Failed to send message to background script after ${sendMaxAttempts} attempts: ${error}`,
            },
          }

          window.postMessage(message, '*')
          return
        }

        window.postMessage(response, '*')
      })
    }

    send(sendMaxAttempts, sendInitialDelay)
  })
}
