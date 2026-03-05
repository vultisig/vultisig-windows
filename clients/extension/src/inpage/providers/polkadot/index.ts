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
} from './types'

let signingId = 0

export class Polkadot extends EventEmitter {
  public static instance: Polkadot | null = null
  constructor() {
    super()
  }

  static getInstance(): Polkadot {
    if (!Polkadot.instance) {
      Polkadot.instance = new Polkadot()
    }
    return Polkadot.instance
  }

  async request(data: RequestInput) {
    const handlers = getSharedHandlers(OtherChain.Polkadot)

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
    }

    throw new NotImplementedError(`Polkadot method ${data.method}`)
  }

  async enable(_origin?: string) {
    await requestAccount(OtherChain.Polkadot)

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
      getAccount: { chain: OtherChain.Polkadot },
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
            chain: OtherChain.Polkadot,
          },
        },
      },
      { account: payload.address }
    )

    return {
      id: ++signingId,
      signature: shouldBePresent(data.output, 'signing output') as string,
    }
  }

  async signRaw(
    payload: PolkadotSignerPayloadRaw
  ): Promise<PolkadotSignerResult> {
    const signature = await callPopup(
      {
        signMessage: {
          sign_message: {
            chain: OtherChain.Polkadot,
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
