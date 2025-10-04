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
      personal_sign: async ([rawMessage, account, type = 'default']: [
        string,
        string,
        SignMessageType,
      ]) => {
        const signature = await callPopup(
          {
            signMessage: {
              personal_sign: {
                bytesCount: new TextEncoder().encode(rawMessage).length,
                chain: Chain.Ethereum,
                message: rawMessage,
                type,
              },
            },
          },
          { account }
        )

        return processSignature(signature)
      },
      reshare_sign: async ([{ id }]: [{ id: string }]) => {
        const { joinUrl } = await callPopup({ pluginReshare: { pluginId: id } })

        return joinUrl
      },
    } as const

    if (method in handlers) {
      return handlers[method as keyof typeof handlers](params as any)
    }

    throw new NotImplementedError(`Plugin method ${method}`)
  }
}
