import { UtxoChain } from '@core/chain/Chain'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { BitcoinAccount, Messaging, ProviderId } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'
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
  private providerType: MessageKey
  public static instances: Map<string, UTXO>
  private providerId: ProviderId
  constructor(
    providerType: string,
    chain: SupportedUtxoChain,
    providerId: ProviderId = 'vultisig'
  ) {
    super()
    this.providerType = providerType as MessageKey
    this.chain = chain
    this.providerId = providerId
  }

  static getInstance(
    providerType: string,
    chain: SupportedUtxoChain,
    providerId: ProviderId
  ): UTXO {
    if (!UTXO.instances) {
      UTXO.instances = new Map<string, UTXO>()
    }

    if (!UTXO.instances.has(providerType)) {
      UTXO.instances.set(
        providerType,
        new UTXO(providerType, chain, providerId)
      )
    }
    return UTXO.instances.get(providerType)!
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

  async signPSBT(_psbt: string | Buffer) {
    return await this.request({
      method: RequestMethod.CTRL.SIGN_PSBT,
      params: [],
    })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    const processRequest = async () => {
      const handlers = getSharedHandlers(this.chain)

      if (data.method in handlers) {
        return handlers[data.method as keyof typeof handlers]()
      }
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: this.providerType,
          message: data,
        },
        { id: uuidv4() }
      )

      return processBackgroundResponse(data, this.providerType, response)
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
