import { UtxoChain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import {
  BitcoinAccount,
  ProviderId,
  RequestInput,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import EventEmitter from 'events'

import { Callback } from '../constants'
import { requestAccount } from './core/requestAccount'
import { getSharedHandlers } from './core/sharedHandlers'

type SupportedUtxoChain =
  | UtxoChain.Bitcoin
  | UtxoChain.BitcoinCash
  | UtxoChain.Dogecoin
  | UtxoChain.Litecoin
  | UtxoChain.Zcash

export class UTXO extends EventEmitter {
  public chain: UtxoChain
  public static instances: Map<string, UTXO>
  private providerId: ProviderId
  constructor(chain: SupportedUtxoChain, providerId: ProviderId = 'vultisig') {
    super()
    this.chain = chain
    this.providerId = providerId
  }

  static getInstance(chain: SupportedUtxoChain, providerId: ProviderId): UTXO {
    if (!UTXO.instances) {
      UTXO.instances = new Map<string, UTXO>()
    }

    if (!UTXO.instances.has(chain)) {
      UTXO.instances.set(chain, new UTXO(chain, providerId))
    }
    return UTXO.instances.get(chain)!
  }

  async requestAccounts(): Promise<BitcoinAccount[] | string[]> {
    const { address, publicKey } = await requestAccount(this.chain)
    if (this.providerId === 'phantom-override') {
      return [
        { address, publicKey, addressType: 'p2wpkh', purpose: 'payment' },
        { address, publicKey, addressType: 'p2wpkh', purpose: 'ordinals' },
      ]
    }
    return [address]
  }

  async signPSBT(psbt: Buffer) {
    const { hash } = await callPopup({
      sendTx: {
        serialized: {
          data: Buffer.from(psbt).toString('base64'),
          chain: this.chain,
        },
      },
    })

    return hash
  }

  async request(data: RequestInput, callback?: Callback) {
    const processRequest = async () => {
      const handlers = getSharedHandlers(this.chain)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers](
          data.params as any
        )
      }

      throw new NotImplementedError(`UTXO method ${data.method}`)
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
