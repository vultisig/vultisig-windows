import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { processSignature } from '@clients/extension/src/inpage/providers/ethereum'
import { Chain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import { SignMessageType } from '@core/inpage-provider/popup/interface'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

export class Plugin extends EventEmitter {
  constructor() {
    super()
  }

  async request({ method, params }: RequestInput) {
    const handlers = {
      personal_sign: async ([rawMessage, account, type = 'default', pluginId]: [
        string,
        string,
        SignMessageType,
        string | undefined,
      ]) => {
        if (type === 'policy' && (!pluginId || pluginId.trim() === '')) {
          const error = new EIP1193Error('InvalidParams')
          error.message =
            'Invalid params: pluginId is required when type === "policy"'
          throw error
        }

        const signature = await callPopup(
          {
            signMessage: {
              personal_sign: {
                bytesCount: new TextEncoder().encode(rawMessage).length,
                chain: Chain.Ethereum,
                message: rawMessage,
                type,
                pluginId,
              },
            },
          },
          { account, shouldClosePopup: true }
        )

        return processSignature(signature)
      },
      reshare_sign: async ([{ id }]: [{ id: string }]) => {
        return callPopup(
          {
            pluginReshare: { pluginId: id },
          },
          { shouldClosePopup: true }
        )
      },
    } as const

    if (method in handlers) {
      return handlers[method as keyof typeof handlers](params as any)
    }

    throw new NotImplementedError(`App method ${method}`)
  }
}
