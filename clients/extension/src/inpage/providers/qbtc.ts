import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { Chain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import EventEmitter from 'events'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { Callback } from '../constants'
import { getSharedHandlers } from './core/sharedHandlers'

const mldsaRequiredMessage =
  'QBTC requires an MLDSA-enabled vault. Enable MLDSA in Vultisig Developer Options and create a new vault.'

/**
 * Dedicated dApp provider for QBTC, exposed at `window.vultisig.qbtc`.
 *
 * QBTC is a post-quantum Cosmos SDK chain that signs with MLDSA-44 rather
 * than secp256k1/ed25519, so it cannot fit the Keplr provider shape (the
 * `algo` field and signature length don't match). This provider exposes a
 * QBTC-native surface via the shared handlers — `get_accounts`,
 * `request_accounts`, `send_transaction`, `get_transaction_by_hash` — and
 * routes signing through the existing MLDSA keysign pipeline.
 */
export class Qbtc extends EventEmitter {
  public chainId: string
  public static instance: Qbtc | null = null

  constructor() {
    super()
    this.chainId = 'QBTC_qbtc'
  }

  static getInstance(): Qbtc {
    if (!Qbtc.instance) {
      Qbtc.instance = new Qbtc()
    }
    return Qbtc.instance
  }

  async request(data: RequestInput, callback?: Callback) {
    const processRequest = async () => {
      const handlers = getSharedHandlers(Chain.QBTC)

      if (data.method === 'get_accounts') {
        const accounts = await handlers.get_accounts()
        return accounts.filter(Boolean)
      }

      if (data.method === 'request_accounts') {
        const accounts = await handlers.request_accounts()
        if (!accounts[0]) {
          throw new EIP1193Error('Unauthorized', mldsaRequiredMessage)
        }
        return accounts
      }

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`QBTC method ${data.method}`)
    }

    try {
      const result = await processRequest()

      callback?.(null, result)

      return result
    } catch (error) {
      callback?.(error as Error)
      throw error
    }
  }
}
