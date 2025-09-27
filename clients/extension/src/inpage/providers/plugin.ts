import { processSignature } from '@clients/extension/src/inpage/providers/ethereum'
import { Chain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import { PersonalSign } from '@core/inpage-provider/popup/interface'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

export class Plugin extends EventEmitter {
  constructor() {
    super()
  }

  async request({ method, params }: RequestInput) {
    const handlers = {
      personal_sign: async ([rawMessage, account, type]: [
        string,
        string,
        'connect' | 'policy',
      ]) => {
        const message = new TextEncoder().encode(rawMessage)

        const params: PersonalSign = {
          bytesCount: message.length,
          chain: Chain.Ethereum,
          message: new TextDecoder().decode(message),
        }

        switch (type) {
          case 'connect': {
            const connectSignature = await callPopup(
              { pluginConnectSign: params },
              { account }
            )

            return processSignature(connectSignature)
          }
          case 'policy': {
            const policySignature = await callPopup(
              { pluginPolicySign: params },
              { account }
            )

            return processSignature(policySignature)
          }
          default: {
            throw new NotImplementedError(`Plugin sign type ${type}`)
          }
        }
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
