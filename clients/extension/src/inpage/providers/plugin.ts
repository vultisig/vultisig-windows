import { processSignature } from '@clients/extension/src/inpage/providers/ethereum'
import { Chain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import { PersonalSign } from '@core/inpage-provider/popup/interface'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

type SignType = 'connect' | 'policy'
type SignHandler = () => Promise<string>

export class Plugin extends EventEmitter {
  constructor() {
    super()
  }

  async request({ method, params }: RequestInput) {
    const handlers = {
      personal_sign: async ([rawMessage, account, type]: [
        string,
        string,
        SignType,
      ]) => {
        const params: PersonalSign = {
          bytesCount: new TextEncoder().encode(rawMessage).length,
          chain: Chain.Ethereum,
          message: rawMessage,
        }

        const signHandlers: Record<SignType, SignHandler> = {
          connect: () => callPopup({ pluginConnectSign: params }, { account }),
          policy: () => callPopup({ pluginPolicySign: params }, { account }),
        }

        if (type in signHandlers) {
          const signature = await signHandlers[type]()

          return processSignature(signature)
        }

        throw new NotImplementedError(`Plugin sign type ${type}`)
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
