import { OtherChain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

import { requestAccount } from '../core/requestAccount'
import { getSharedHandlers } from '../core/sharedHandlers'
import {
  PolkadotInjectedAccount,
  PolkadotSignerPayloadJSON,
  PolkadotSignerPayloadRaw,
  PolkadotSignerResult,
} from '../polkadot/types'

let signingId = 0

export class Bittensor extends EventEmitter {
  public static instance: Bittensor | null = null
  constructor() {
    super()
  }

  static getInstance(): Bittensor {
    if (!Bittensor.instance) {
      Bittensor.instance = new Bittensor()
    }
    return Bittensor.instance
  }

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Bittensor)

    const method = data.method
    const isHandlerMethod = (key: string): key is keyof typeof handlers =>
      key in handlers
    if (isHandlerMethod(method)) {
      return handlers[method](
        data.params as Parameters<(typeof handlers)[typeof method]>[0]
      )
    }

    throw new NotImplementedError(`Bittensor method ${data.method}`)
  }

  async enable(_origin?: string) {
    await requestAccount(OtherChain.Bittensor)

    return {
      accounts: {
        get: () => this.getAccounts(),
        subscribe: (cb: (accounts: PolkadotInjectedAccount[]) => void) => {
          const handler = () => {
            this.getAccounts().then(cb)
          }
          this.on('accountsChanged', handler)
          return () => this.off('accountsChanged', handler)
        },
      },
      signer: {
        signPayload: (payload: PolkadotSignerPayloadJSON) =>
          this.signPayload(payload),
        signRaw: (payload: PolkadotSignerPayloadRaw) => this.signRaw(payload),
      },
    }
  }

  async getAccounts(): Promise<PolkadotInjectedAccount[]> {
    const { address } = await callBackground({
      getAccount: { chain: OtherChain.Bittensor },
    })

    return [
      {
        address,
        type: 'ed25519',
      },
    ]
  }

  async signPayload(
    payload: PolkadotSignerPayloadJSON
  ): Promise<PolkadotSignerResult> {
    const [{ data }] = await callPopup(
      {
        sendTx: {
          serialized: {
            data: [JSON.stringify(payload)],
            chain: OtherChain.Bittensor,
          },
        },
      },
      { account: payload.address }
    )

    const output = shouldBePresent(data.output, 'signing output')
    if (typeof output !== 'string') {
      throw new Error('Expected signing output to be a string')
    }

    return {
      id: ++signingId,
      signature: output,
    }
  }

  async signRaw(
    payload: PolkadotSignerPayloadRaw
  ): Promise<PolkadotSignerResult> {
    const signature = await callPopup(
      {
        signMessage: {
          sign_message: {
            chain: OtherChain.Bittensor,
            message: payload.data,
          },
        },
      },
      { account: payload.address }
    )

    return {
      id: ++signingId,
      signature,
    }
  }
}
