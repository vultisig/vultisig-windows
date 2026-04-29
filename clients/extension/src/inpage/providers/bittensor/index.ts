import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { Buffer } from 'buffer'
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
const ed25519SignaturePrefix = '0x00'

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

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers](data.params as any)
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
            skipBroadcast: true,
          },
        },
      },
      { account: payload.address }
    )

    const encodedBase64 = shouldBePresent(
      data.encoded,
      'signing output encoded'
    ) as string
    const signatureHex = Buffer.from(encodedBase64, 'base64').toString('hex')

    return {
      id: ++signingId,
      signature: ed25519SignaturePrefix + signatureHex,
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
      signature: ed25519SignaturePrefix + signature,
    }
  }
}
