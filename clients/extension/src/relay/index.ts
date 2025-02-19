import { MessageKey, SenderKey } from '@clients/extension/src/utils/constants'
import { Messaging } from '@clients/extension/src/utils/interfaces'

const sendToBackground = <Request, Response>(
  type: MessageKey,
  message: Request
): Promise<Response> => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ message, type }, resolve)
  })
}

window.addEventListener(
  'message',
  ({
    data,
    source,
  }: MessageEvent<{
    id: string
    message: any
    sender: SenderKey
    type: MessageKey
  }>) => {
    if (
      source !== window ||
      data.sender !== SenderKey.PAGE ||
      !data.id ||
      !data.type
    ) {
      return
    }

    switch (data.type) {
      case MessageKey.BITCOIN_REQUEST:
      case MessageKey.BITCOIN_CASH_REQUEST:
      case MessageKey.COSMOS_REQUEST:
      case MessageKey.DASH_REQUEST:
      case MessageKey.DOGECOIN_REQUEST:
      case MessageKey.ETHEREUM_REQUEST:
      case MessageKey.LITECOIN_REQUEST:
      case MessageKey.MAYA_REQUEST:
      case MessageKey.SOLANA_REQUEST:
      case MessageKey.THOR_REQUEST: {
        sendToBackground<Messaging.Chain.Request, Messaging.Chain.Response>(
          data.type,
          data.message
        ).then(result => {
          window.postMessage(
            {
              id: data.id,
              message: result,
              sender: SenderKey.RELAY,
              type: data.type,
            },
            '*'
          )
        })

        break
      }
      case MessageKey.PRIORITY: {
        sendToBackground<
          Messaging.SetPriority.Request,
          Messaging.SetPriority.Response
        >(data.type, data.message).then(result => {
          window.postMessage(
            {
              id: data.id,
              message: result,
              sender: SenderKey.RELAY,
              type: data.type,
            },
            '*'
          )
        })

        break
      }
      case MessageKey.VAULT: {
        sendToBackground<
          Messaging.GetVault.Request,
          Messaging.GetVault.Response
        >(data.type, data.message).then(result => {
          window.postMessage(
            {
              id: data.id,
              message: result,
              sender: SenderKey.RELAY,
              type: data.type,
            },
            '*'
          )
        })

        break
      }
      case MessageKey.VAULTS: {
        sendToBackground<
          Messaging.GetVaults.Request,
          Messaging.GetVaults.Response
        >(data.type, data.message).then(result => {
          window.postMessage(
            {
              id: data.id,
              message: result,
              sender: SenderKey.RELAY,
              type: data.type,
            },
            '*'
          )
        })

        break
      }
      default: {
        break
      }
    }
  }
)
