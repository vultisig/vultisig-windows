import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { Chain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import EventEmitter from 'events'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { currentExtensionBrandConfig } from '../../brand/extensionBrandConfig'
import { Callback } from '../constants'
import { getSharedHandlers } from './core/sharedHandlers'
import {
  handleQbtcSignAndBroadcast,
  parseSignAndBroadcastParams,
} from './qbtcSignAndBroadcast'

const mldsaRequiredMessage = `QBTC requires an MLDSA-enabled vault. Enable MLDSA in ${currentExtensionBrandConfig.provider.walletPickerName} Developer Options and create a new vault.`

type SharedHandlers = ReturnType<typeof getSharedHandlers>
type SendTransactionParams = Parameters<SharedHandlers['send_transaction']>[0]

// dApp-supplied params arrive typed as `unknown[]`. Validate the routing
// boundary at runtime, then narrow to the shared handler's parameter shape.
const parseSendTransactionParams = (
  params: readonly unknown[]
): SendTransactionParams => {
  const [tx] = params
  if (!tx || typeof tx !== 'object') {
    throw new EIP1193Error('InvalidParams')
  }
  return [tx as SendTransactionParams[0]]
}

/**
 * Dedicated dApp provider for QBTC, exposed at `window.vultisig.qbtc`.
 *
 * QBTC is a post-quantum Cosmos SDK chain that signs with MLDSA-44 rather
 * than secp256k1/ed25519. This provider is the QBTC-native surface
 * (`get_accounts`, `request_accounts`, `send_transaction`,
 * `sign_and_broadcast`, `get_transaction_by_hash`) with explicit MLDSA
 * semantics — no `algo` spoofing, no Keplr signature-shape compromises.
 *
 * `send_transaction` is the legacy bank-send shortcut; new dApp flows that
 * need to sign arbitrary Cosmos SDK messages (`MsgVote`, `MsgDelegate`,
 * `MsgWithdrawDelegatorReward`, etc.) should use `sign_and_broadcast` —
 * see {@link handleQbtcSignAndBroadcast} for the accepted shape.
 *
 * QBTC is also reachable via the Keplr compatibility route at chainId
 * `qbtc` for dApps that can't be modified; see `xdefiKeplr.ts`.
 * Both routes funnel into the same MLDSA keysign pipeline.
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

      if (data.method === 'send_transaction') {
        return handlers.send_transaction(
          parseSendTransactionParams(data.params)
        )
      }

      if (data.method === 'sign_and_broadcast') {
        return handleQbtcSignAndBroadcast(
          parseSignAndBroadcastParams(data.params)
        )
      }

      if (data.method === 'get_transaction_by_hash') {
        const [hash] = data.params
        if (typeof hash !== 'string') {
          throw new EIP1193Error('InvalidParams')
        }
        return handlers.get_transaction_by_hash([hash])
      }

      throw new NotImplementedError(`QBTC method ${data.method}`)
    }

    try {
      const result = await processRequest()

      callback?.(null, result)

      return result
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error))
      callback?.(normalizedError)
      throw normalizedError
    }
  }
}
